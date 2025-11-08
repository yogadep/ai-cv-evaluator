import 'dotenv/config';
import { newWeavClient, ensureSchema, ingestChunks } from '../src/rag.js';
import { pdfToText, chunkText } from '../src/pdf.js';

const file = process.argv[2];
const kind = process.argv[3]; // cv_rubric | project_rubric
if (!file || !kind) throw new Error('usage: node ingestion/ingest-rubrics.js <path.pdf> <cv_rubric|project_rubric>');

const run = async () => {
  const client = newWeavClient();
  await ensureSchema(client);
  const text = await pdfToText(file);
  await ingestChunks(client, kind, kind, chunkText(text));
  console.log('Ingested rubric:', kind);
};
run();
