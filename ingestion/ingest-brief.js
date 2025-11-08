import 'dotenv/config';
import { newWeavClient, ensureSchema, ingestChunks } from '../src/rag.js';
import { pdfToText, chunkText } from '../src/pdf.js';

const file = process.argv[2];
if (!file) throw new Error('usage: node ingestion/ingest-brief.js <path.pdf>');

const run = async () => {
  const client = newWeavClient();
  await ensureSchema(client);
  const text = await pdfToText(file);
  await ingestChunks(client, 'case_brief', 'case_study_brief', chunkText(text));
  console.log('Ingested Case Study Brief.');
};
run();
