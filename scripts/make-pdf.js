import fs from "fs";
import PDFDocument from "pdfkit";

function writePDF(outPath, title, sections) {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.pipe(fs.createWriteStream(outPath));

  doc.fontSize(20).text(title, { underline: true });
  doc.moveDown(0.75);

  sections.forEach(({ heading, body }) => {
    if (heading) doc.fontSize(14).text(heading, { bold: true });
    if (heading) doc.moveDown(0.15);
    doc.fontSize(11).text(body, { lineGap: 2 });
    doc.moveDown(0.75);
  });

  doc.end();
  console.log(`✓ Wrote ${outPath}`);
}

const jdSections = [
  {
    heading: "About the Job",
    body:
`Rakamin is looking for a Product Engineer (Backend) to build new features with FE & PM using Agile, maintain robustness, and improve the codebase.
The role also touches AI-powered systems: designing prompts, LLM chaining, RAG with vector DB, handling long-running AI jobs (orchestration, async workers, retry), and mitigating LLM nondeterminism.

Example responsibilities:
- Backend integration across platforms/3rd party services.
- Server-side logic for central DB (throughput & latency).
- Design & fine-tune prompts according to product context.
- Build LLM chaining & RAG (embedding + retrieval).
- Job orchestration, retry mechanisms.
- Safeguards for external API failures & randomness.
- Leverage AI tools for productivity.
- Write reusable, testable code; strengthen test coverage.
- Full product lifecycle and collaboration with business/stakeholders.`
  },
  {
    heading: "About You & Requirements",
    body:
`Experienced in backend web development (Node.js/Django/Rails) and modern tooling:
- Database (MySQL/PostgreSQL/MongoDB), RESTful APIs, Security.
- Cloud (AWS/GCP/Azure), server-side languages (Java/Python/Ruby/JS).
- AuthN/AuthZ across multiple systems, scalable design, DB schema supporting business processes.
- Automated testing & unit tests.
- Familiar with LLM API, embeddings, vector DB, prompt design.
No emphasis on degree/alma mater; focus on results & work approach. Remote Indonesia (good timezone overlap).`
  },
  {
    heading: "Benefits & Perks",
    body:
`- 17 days PTO.
- Learning benefit totaling Rp29 million/year (course/book subscriptions Rp6m, O'Reilly Rp8m, bootcamp/short course access Rp15m).
- Device ownership Rp7 million/year.`
  },
  {
    heading: "Managers of One",
    body:
`Culture of trust & independence. Report to CTO, work from anywhere in Indonesia.`
  }
];


const briefSections = [
  {
    heading: "Objective",
    body:
`Build a backend service for initial job application screening. Input: CV (PDF) & Project Report (PDF).
Compare against: Job Description, this Case Study Brief, and Scoring Rubrics. Output is a structured evaluation report (AI-generated).`
  },
  {
    heading: "API Endpoints",
    body:
`POST /upload -> multipart/form-data: {cv, report}. Save and return ID for each document.
POST /evaluate -> body: {job_title, cv_id, report_id}. Trigger async pipeline, immediately return job_id + status=queued.
GET /result/{id} -> status: queued/processing/completed. If completed, return {cv_match_rate, cv_feedback, project_score, project_feedback, overall_summary}.`
  },
  {
    heading: "Evaluation Pipeline (AI)",
    body:
`RAG: Ingest "ground-truth" (Job Description, Case Study Brief, Rubrics) into vector DB. Retrieve relevant context.
LLM Chaining:
  • CV Evaluation: parse CV (structured), retrieve JD & CV Rubric context -> output cv_match_rate (0-1) + cv_feedback.
  • Project Evaluation: parse Report (structured), retrieve Case Brief & Project Rubric context -> output project_score (1-5) + project_feedback.
  • Final Analysis: synthesize into overall_summary (3–5 sentences).
Long-running: /evaluate async, /result polling; implement retry/backoff for LLM errors/rate limits; control temperature/validation for stability.`
  },
  {
    heading: "Standardized Parameters",
    body:
`CV Evaluation (1–5 → then converted to 0–1 ×0.2): Technical Skills Match (40%), Experience Level (25%), Relevant Achievements (20%), Cultural/Collaboration Fit (15%).
Project Evaluation (1–5): Correctness/Prompt/Chaining (30%), Code Quality (25%), Resilience/Error Handling (20%), Documentation (15%), Creativity/Bonus (10%).`
  },
  {
    heading: "Requirements & Submission",
    body:
`Backend framework of choice (Node/Django/Rails), use LLM API (OpenAI/Gemini/Router), vector DB (Weaviate/Chroma/Qdrant/RaaS). Include README (how to run + design rationale). Include documents and ingestion scripts.
Submission template PDF: 
1) Title, 2) Candidate Info, 3) Repo Link (without the word "Rakamin"), 4) Approach & Design (API, DB/job queue, LLM, RAG, prompts, resilience, edge cases), 5) Results & Reflection, 6) Screenshots of actual responses (/evaluate & /result), 7) (Optional) Bonus.`
  }
];


const cvRubricSections = [
  {
    heading: "CV Match Evaluation (1–5 per parameter)",
    body:
`Weights:
- Technical Skills Match (40%): backend, DB, API, cloud, AI/LLM exposure.
  1 Irrelevant … 5 Excellent + AI/LLM exposure
- Experience Level (25%): years & project complexity.
  1 <1yr … 5 5+ yrs / high-impact projects
- Relevant Achievements (20%): measurable impact (scaling/performance/adoption).
  1 Not clear … 5 Significant measurable impact
- Cultural/Collaboration Fit (15%): communication, collaboration, growth mindset.
  1 Not evident … 5 Excellent & well-demonstrated`
  },
  {
    heading: "Score Conversion",
    body:
`Calculate weighted average 1–5; for CV Match Rate convert to 0–1 (score/5) then ×0.2 as per brief.`
  },
  {
    heading: "CV Evaluation Notes",
    body:
`Write brief & actionable feedback: strengths, gaps vs JD, recommendations for improvement (tooling, cloud, testing, AI exposure).`
  }
];

const projRubricSections = [
  {
    heading: "Project Deliverable Evaluation (1–5 per parameter)",
    body:
`Weights:
- Correctness (Prompt & Chaining) 30%: prompt design, chaining, RAG context injection.
  1 None … 5 Fully correct + thoughtful
- Code Quality & Structure 25%: clean, modular, testable.
  1 Poor … 5 Excellent + strong tests
- Resilience & Error Handling 20%: long jobs, retries/backoff, API failures, determinism.
  1 Missing … 5 Production-ready
- Documentation & Explanation 15%: README, setup, trade-offs.
  1 Missing … 5 Excellent + insightful
- Creativity / Bonus 10%: extra features (auth, deploy, dashboard, observability, etc.).`
  },
  {
    heading: "Expected Output",
    body:
`LLM output for project: project_score (1–5) + project_feedback (reasoning for strengths/weaknesses & suggestions).`
  }
];

// Write all PDFs
fs.mkdirSync("./docs", { recursive: true });
writePDF("./docs/job_description.pdf", "Job Description — Product Engineer (Backend) 2025", jdSections);
writePDF("./docs/case_brief.pdf", "Case Study Brief — AI-Powered CV & Project Evaluator", briefSections);
writePDF("./docs/cv_rubric.pdf", "CV Scoring Rubric — Weighted Criteria", cvRubricSections);
writePDF("./docs/project_rubric.pdf", "Project Scoring Rubric — Weighted Criteria", projRubricSections);