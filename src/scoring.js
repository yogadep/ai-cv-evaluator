// Scoring helpers for CV and project evaluations.
export function weightedCv(s) {
  // Relative weights for each CV criterion (sum = 1)
  const w = { technical_match: 0.4, experience_level: 0.25, achievements: 0.2, cultural_fit: 0.15 };

  // Compute weighted sum on a 1–5 scale; missing values default to 0
  const total = Object.entries(w).reduce((acc, [k, ww]) => acc + (Number(s[k]) || 0) * ww, 0);

  // Convert 1–5 into 0–1, then scale to contribute up to 0.20 of the final grade
  const decimal = Math.round(((total / 5) * 0.2) * 100) / 100; // range ~0.00–0.20

  // `total` is the weighted average on 1–5; `decimal` is the 0–0.20 contribution
  return { total: Math.round(total * 100) / 100, decimal };
}

export function weightedProject(s) {
  // Relative weights for project evaluation (sum = 1)
  const w = { correctness: 0.3, code_quality: 0.25, resilience: 0.2, documentation: 0.15, creativity: 0.1 };

  // Weighted average on a 1–5 scale; missing values default to 0
  const total = Object.entries(w).reduce((acc, [k, ww]) => acc + (Number(s[k]) || 0) * ww, 0);

  // Return the 1–5 weighted score rounded to two decimals
  return Math.round(total * 100) / 100;
}
