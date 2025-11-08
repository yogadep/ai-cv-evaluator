// import weaviate from 'weaviate-ts-client';
import { embedText } from './gemini.js';
import weaviate from "weaviate-ts-client";

const CLASS = 'GroundTruth';

export function newWeavClient() {
  const url = process.env.WEAVIATE_URL || 'http://localhost:8080';
  const apiKey = process.env.WEAVIATE_API_KEY;
  return weaviate.client({
    scheme: url.startsWith('https') ? 'https' : 'http',
    host: url.replace(/^https?:\/\//, ''),
    apiKey: apiKey ? new weaviate.ApiKey(apiKey) : undefined,
  });
}

export async function ensureSchema(client) {
  const schema = await client.schema.getter().do();
  const exists = schema.classes?.some((c) => c.class === CLASS);
  if (!exists) {
    await client.schema.classCreator().withClass({
      class: CLASS,
      vectorizer: 'none',
      properties: [
        { name: 'doc_type', dataType: ['text'] },
        { name: 'title', dataType: ['text'] },
        { name: 'chunk', dataType: ['text'] }
      ],
    }).do();
  }
}

export async function ingestChunks(client, docType, title, chunks) {
  if (!chunks?.length) return;
  const batcher = client.batch.objectsBatcher();
  for (const ch of chunks) {
    const vec = await embedText(ch);
    batcher.withObjects({
      class: CLASS,
      properties: { doc_type: docType, title, chunk: ch },
      vector: vec
    });
  }
  await batcher.do();
}

export async function search(client, queryText, docType, limit = 6) {
  const qVec = await embedText(queryText);
  const res = await client.graphql
    .get()
    .withClassName(CLASS)
    .withFields('chunk')
    .withNearVector({ vector: qVec })
    .withWhere({ path: ['doc_type'], operator: 'Equal', valueText: docType })
    .withLimit(limit)
    .do();
  const items = (res.data?.Get?.[CLASS] || []);
  return items.map((x) => x.chunk);
}
