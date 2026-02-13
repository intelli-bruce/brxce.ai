#!/usr/bin/env node
/**
 * Embedding generator skeleton.
 * TODO: Implement with OpenAI/local embedding model.
 */
import { getDb } from './db.js';

const db = getDb();

async function generateEmbeddings() {
  const rows = db.prepare('SELECT id, title, body_md FROM contents WHERE embedding IS NULL AND body_md IS NOT NULL').all();
  console.log(`${rows.length} contents need embeddings`);

  // TODO: Call embedding API (OpenAI text-embedding-3-small or local)
  // for (const row of rows) {
  //   const text = `${row.title}\n${row.body_md}`;
  //   const embedding = await getEmbedding(text);
  //   db.prepare('UPDATE contents SET embedding = ? WHERE id = ?').run(Buffer.from(new Float32Array(embedding).buffer), row.id);
  // }

  console.log('Embedding generation not yet implemented');
}

generateEmbeddings();
