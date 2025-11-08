export const CV_PROMPT = `
You are a strict recruiter. Using JOB_DESCRIPTION and CV_EXCERPTS plus CV_RUBRIC, score:
- technical_match (1-5)
- experience_level (1-5)
- achievements (1-5)
- cultural_fit (1-5)
Return STRICT JSON only with exactly these keys and snake_case:
{
  "technical_match": <number>,
  "experience_level": <number>,
  "achievements": <number>,
  "cultural_fit": <number>,
  "cv_feedback": "<short text>"
}

JOB_DESCRIPTION:
{job_desc}

CV_EXCERPTS:
{cv_chunks}

CV_RUBRIC:
{cv_rubric}
`.trim();

export const PROJECT_PROMPT = `
You are a strict reviewer. Using CASE_BRIEF and REPORT_EXCERPTS plus PROJECT_RUBRIC, score:
- correctness (1-5)
- code_quality (1-5)
- resilience (1-5)
- documentation (1-5)
- creativity (1-5)
Return STRICT JSON only with exactly these keys and snake_case:
{
  "correctness": <number>,
  "code_quality": <number>,
  "resilience": <number>,
  "documentation": <number>,
  "creativity": <number>,
  "project_feedback": "<short text>"
}

CASE_BRIEF:
{brief}

REPORT_EXCERPTS:
{report_chunks}

PROJECT_RUBRIC:
{project_rubric}
`.trim();

export const FINAL_PROMPT = `
Summarize in 3-5 sentences the strengths, gaps, and recommendations, given:
CV_RESULT: {cv_result}
PROJECT_RESULT: {project_result}
Role: {job_title}
`.trim();
