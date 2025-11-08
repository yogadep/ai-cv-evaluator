import 'dotenv/config';
import { Worker } from 'bullmq';
import fs from 'fs';
import { newWeavClient, search } from './rag.js';
import { weightedCv, weightedProject } from './scoring.js';
import { CV_PROMPT, PROJECT_PROMPT, FINAL_PROMPT } from './prompts.js';
import { chatOnce } from './gemini.js';

const weav = newWeavClient();

/** Strip code fences and try to pull a JSON object from an LLM reply */
function parseJsonLoose(text) {
  if (!text) throw new Error('Empty LLM response');

  // remove ```json ... ``` wrappers if any
  let s = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  // super loose: keep substring between first { and last }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }

  return JSON.parse(s);
}

/** Ask model to return JSON, then parse with `parseJsonLoose` */
async function askJson(systemHint, userPrompt) {
  const reply = await chatOnce(
    `${systemHint}\n\nReturn ONLY valid JSON (no prose, no code fences).`
  + `\n\n<task>\n${userPrompt}\n</task>`
  );
  return parseJsonLoose(reply);
}

export const worker = new Worker(
  'eval',
  async (job) => {
    const { job_title, cv_path, report_path } = job.data;

    // RAG contexts
    const jobDesc    = (await search(weav, job_title, 'job_desc', 6)).join('\n');
    const cvRubric   = (await search(weav, 'cv rubric', 'cv_rubric', 6)).join('\n');
    const projRubric = (await search(weav, 'project rubric', 'project_rubric', 6)).join('\n');
    const brief      = (await search(weav, 'case study brief', 'case_brief', 8)).join('\n');

    // chunks dari hasil /upload
    const cvChunks     = JSON.parse(fs.readFileSync(cv_path + '.chunks.json', 'utf8'));
    const reportChunks = JSON.parse(fs.readFileSync(report_path + '.chunks.json', 'utf8'));

    // === CV eval (JSON)
    const cvParsed = await askJson(
      'You are a strict JSON generator. Validate and score CV content. Keys: cv_feedback (string), criteria (array of {name, score, weight}).',
      CV_PROMPT
        .replace('{job_desc}', jobDesc)
        .replace('{cv_chunks}', cvChunks.join('\n'))
        .replace('{cv_rubric}', cvRubric)
    );
    const cvAgg = weightedCv(cvParsed);

    // === Project eval (JSON)
    const projParsed = await askJson(
      'You are a strict JSON generator. Evaluate case study/project. Keys: project_feedback (string), criteria (array of {name, score, weight}).',
      PROJECT_PROMPT
        .replace('{brief}', brief)
        .replace('{report_chunks}', reportChunks.join('\n'))
        .replace('{project_rubric}', projRubric)
    );
    const projAgg = weightedProject(projParsed);

    // === Final summary (plain text)
    const summary = await chatOnce(
      FINAL_PROMPT
        .replace('{cv_result}', JSON.stringify(cvParsed))
        .replace('{project_result}', JSON.stringify(projParsed))
        .replace('{job_title}', job_title)
    );

    return {
      cv_match_rate: cvAgg.decimal,
      cv_feedback: cvParsed.cv_feedback || '',
      project_score: projAgg,
      project_feedback: projParsed.project_feedback || '',
      overall_summary: (summary || '').trim(),
    };
  },
  { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } }
);

worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));
console.log('Worker is running (Gemini free tier)…');