#!/usr/bin/env node
/**
 * Build guides from CMS contents → static HTML
 * Reads contents with channel='brxce-guide' + status='published' from adaptations,
 * converts MD → HTML using the guide template.
 */
import Database from 'better-sqlite3';
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'cms', 'content.db');
const GUIDES_DIR = join(__dirname, 'public', 'guides');
const TEMPLATE_PATH = join(GUIDES_DIR, 'sample.html');

if (!existsSync(DB_PATH)) {
  console.error('Database not found. Run cms/migrate.js first.');
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });
const template = readFileSync(TEMPLATE_PATH, 'utf-8');

// Get published guide adaptations
const guides = db.prepare(`
  SELECT a.body_adapted, c.title, c.hook, c.slug, c.tags, c.cta, c.created_at
  FROM adaptations a
  JOIN contents c ON a.content_id = c.id
  WHERE a.channel = 'brxce-guide' AND a.status = 'published'
`).all();

console.log(`Building ${guides.length} guides...`);

mkdirSync(GUIDES_DIR, { recursive: true });

for (const guide of guides) {
  const htmlBody = marked(guide.body_adapted || '');
  const date = new Date(guide.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Simple template replacement
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${guide.title} — brxce.ai</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${(guide.hook || '').replace(/"/g, '&quot;')}">`)
    .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${guide.title} — brxce.ai">`)
    .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${(guide.hook || '').replace(/"/g, '&quot;')}">`)
    .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="https://brxce.ai/guides/${guide.slug}">`)
    .replace(/<h1>.*?<\/h1>/, `<h1>${guide.title}</h1>`)
    .replace(/<p class="subtitle">.*?<\/p>/, `<p class="subtitle">${guide.hook || ''}</p>`)
    .replace(/<span>2026년.*?<\/span>/, `<span>${date}</span>`);

  // Replace body content between <hr> tags
  const hrFirst = html.indexOf('<hr>');
  const ctaBox = html.indexOf('<div class="cta-box">');
  if (hrFirst !== -1 && ctaBox !== -1) {
    html = html.slice(0, hrFirst) + '<hr>\n\n' + htmlBody + '\n<hr>\n\n' + html.slice(ctaBox);
  }

  const outPath = join(GUIDES_DIR, `${guide.slug}.html`);
  writeFileSync(outPath, html);
  console.log(`  → ${outPath}`);
}

console.log('Build complete.');
