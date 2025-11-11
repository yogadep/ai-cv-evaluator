import fs from "fs";
import path from "path";
import { createRequire } from "module";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
// folder root pdfjs-dist di node_modules
const pdfjsDistDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
// path absolut ke standard_fonts/
const standardFontDataUrl = path.join(pdfjsDistDir, "standard_fonts/");

// Set sekali di global options (untuk Node)
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = standardFontDataUrl;

export async function pdfToText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  // Opsional: oper juga via getDocument options (double sure)
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
