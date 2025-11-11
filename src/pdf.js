import fs from "fs";
import path from "path";
import { createRequire } from "module";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
// pdfjs-dist root directory inside node_modules
const pdfjsDistDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
// Absolute path to standard_fonts/
const standardFontDataUrl = path.join(pdfjsDistDir, "standard_fonts/");

// Set once in global options (for Node)
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = standardFontDataUrl;

export async function pdfToText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  // Optional: also pass through getDocument options for safety
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(dataBuffer),
    useSystemFonts: true,
    standardFontDataUrl, 
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return fullText.trim();
}

export function chunkText(t, maxChars = 4000) {
  const words = (t || "").split(/\s+/);
  const out = [];
  let cur = [];
  let len = 0;
  for (const w of words) {
    cur.push(w);
    len += w.length + 1;
    if (len > maxChars) {
      out.push(cur.join(" "));
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}
