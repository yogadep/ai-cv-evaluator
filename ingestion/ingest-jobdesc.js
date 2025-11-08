import 'dotenv/config';
import { newWeavClient, ensureSchema, ingestChunks } from '../src/rag.js';
import { pdfToText, chunkText } from '../src/pdf.js';

const file = process.argv[2];
if (!file) throw new Error('usage: node ingestion/ingest-jobdesc.js <path.pdf>');

const run = async () => {
  const client = newWeavClient();
  await ensureSchema(client);
  const text = await pdfToText(file);
  await ingestChunks(client, 'job_desc', 'rakamin_backend', chunkText(text));
  console.log('Ingested Job Description.');
};
run();
