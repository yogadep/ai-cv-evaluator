import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import z from 'zod';
import { evalQueue } from './queue.js';
import { pdfToText, chunkText } from './pdf.js';
import { buildReportPdf, ensureDir } from './report.js';

const router = Router();
// Upload directory
const uploadDir = path.join(process.cwd(), 'storage', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.post('/upload', upload.fields([{ name: 'cv' }, { name: 'report' }]), async (req, res) => {
  try {
    const cv = req.files?.cv?.[0];
    const report = req.files?.report?.[0];
    if (!cv || !report) return res.status(400).json({ error: 'cv and report are required' });

    const cvId = path.parse(cv.filename).name;
    const reportId = path.parse(report.filename).name;
    const cvPath = path.join(uploadDir, `${cvId}.pdf`);
    const reportPath = path.join(uploadDir, `${reportId}.pdf`);

    fs.renameSync(cv.path, cvPath);
    fs.renameSync(report.path, reportPath);

    for (const p of [cvPath, reportPath]) {
      const text = await pdfToText(p);
      const chunks = chunkText(text);
      fs.writeFileSync(p + '.chunks.json', JSON.stringify(chunks));
    }

    res.json({ cv_id: cvId, report_id: reportId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'upload failed' });
  }
});

const EvaluateSchema = z.object({
  job_title: z.string().min(1),
  cv_id: z.string().min(1),
  report_id: z.string().min(1),
});

router.post('/evaluate', async (req, res) => {
  const parsed = EvaluateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { job_title, cv_id, report_id } = parsed.data;
  const cvPath = path.join(uploadDir, `${cv_id}.pdf`);
  const reportPath = path.join(uploadDir, `${report_id}.pdf`);

  if (!fs.existsSync(cvPath) || !fs.existsSync(reportPath)) {
    return res.status(404).json({ error: 'file not found' });
  }

  const job = await evalQueue.add(
    'evaluate',
    { job_title, cv_path: cvPath, report_path: reportPath },
    { removeOnComplete: false, attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
  );

  res.json({ id: job.id, status: 'queued' });
});

router.get('/result/:id', async (req, res) => {
  const job = await evalQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'job not found' });

  const state = await job.getState();
  if (state === 'completed') {
    const result = await job.returnvalue;
    return res.json({ id: job.id, status: 'completed', result });
  }
  if (state === 'failed') return res.json({ id: job.id, status: 'failed' });
  return res.json({ id: job.id, status: state === 'active' ? 'processing' : 'queued' });
});


router.get('/result/:id/pdf', async (req, res) => {
    try {
      const job = await evalQueue.getJob(req.params.id);
      if (!job) return res.status(404).json({ error: 'job not found' });
  
      const state = await job.getState();
      if (state !== 'completed') {
        return res.status(400).json({ error: `job is ${state}, PDF available only after completed` });
      }
  
      const result = await job.returnvalue;
  
      // Prepare a clear structure so the PDF shows component breakdowns
      const forPdf = {
        jobId: job.id,
        // candidate: {
        //   // If /evaluate includes candidate metadata later, map it here
        //   name: req.query.name || "",
        //   email: req.query.email || "",
        // },
        // jobTitle: job?.data?.job_title || req.query.job_title || "",
        cv: {
          decimal: result.cv_match_rate,        // 0–0.20
          feedback: result.cv_feedback || "",
          detail: job?.data?.cv_detail || job?.data?.cv_detail_json || null, // optional
        },
        project: {
          score: result.project_score,          // 1–5
          feedback: result.project_feedback || "",
          detail: job?.data?.project_detail || job?.data?.project_detail_json || null, // optional
        },
        summary: result.overall_summary || "",
      };

      // Output directory for generated PDFs
      const storageDir = path.join(process.cwd(), 'storage', 'reports');
      ensureDir(storageDir);
      const pdfPath = buildReportPdf({
        outDir: storageDir,
        ...forPdf
      });
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(pdfPath)}"`);
      fs.createReadStream(pdfPath).pipe(res);
    } catch (e) {
      console.error('PDF error:', e);
      res.status(500).json({ error: 'failed to build pdf' });
    }
  });

export default router;
