export function weightedCv(s) {
    const w = { technical_match: 0.4, experience_level: 0.25, achievements: 0.2, cultural_fit: 0.15 };
    const total = Object.entries(w).reduce((acc, [k, ww]) => acc + (Number(s[k]) || 0) * ww, 0);
    const decimal = Math.round(((total / 5) * 0.2) * 100) / 100; // 0–1 × 0.2
    return { total: Math.round(total * 100) / 100, decimal };
  }
  
  export function weightedProject(s) {
    const w = { correctness: 0.3, code_quality: 0.25, resilience: 0.2, documentation: 0.15, creativity: 0.1 };
    const total = Object.entries(w).reduce((acc, [k, ww]) => acc + (Number(s[k]) || 0) * ww, 0);
    return Math.round(total * 100) / 100;
  }
  