import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';

const SUPABASE_URL = 'https://euhxmmiqfyptvsvvbbvp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHhtbWlxZnlwdHZzdnZiYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkxNTkwMywiZXhwIjoyMDg2NDkxOTAzfQ.lkJCQ3y6QZ_TjNPUh187iELorIj64hyvmcfOhZ8zfuk';
const THREADS_TOKEN = 'THAAKIgAkDatBBUVREVDAxaE9LLXBaOFFaTHUzd3FNVHdMaVI5WVFXTE9MR2xSVGtjUVpEejQ0d29pbFpoYkhGQUJUZAm5RVVFDSFUzZA29DTkZAjR0lCUzlTa19QUzVjTzBLWTFlUkthbG5RRW94ZAE9YcGR2TlJwNWE2TGZA0NTRJUnA4T05ZATGpnV29JXzFjQncZD';
const THREADS_USER_ID = '25025228587141567';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
      meta[m[1]] = val;
    }
  }
  return { meta, body: match[2] };
}

function slugify(str) {
  return str.replace(/\.md$/, '').replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').toLowerCase();
}

const results = { ideas: { ok: 0, fail: 0 }, contents: { ok: 0, fail: 0 }, publications: { ok: 0, fail: 0 } };

// 1. Ideas
const ideasDir = '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/아이디어';
const ideaFiles = (await readdir(ideasDir)).filter(f => f.endsWith('.md'));
console.log(`Ideas: ${ideaFiles.length} files`);
for (const f of ideaFiles) {
  const raw = await readFile(join(ideasDir, f), 'utf-8');
  const { error } = await supabase.from('ideas').insert({ raw_text: raw.trim(), source: 'obsidian' });
  if (error) { console.error(`  FAIL idea ${f}:`, error.message); results.ideas.fail++; }
  else { results.ideas.ok++; }
}

// 2. Contents - 진행중
const draftDir = '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/진행중';
const draftFiles = (await readdir(draftDir)).filter(f => f.endsWith('.md'));
console.log(`Drafts: ${draftFiles.length} files`);
for (const f of draftFiles) {
  const raw = await readFile(join(draftDir, f), 'utf-8');
  const { meta, body } = parseFrontmatter(raw);
  const title = meta.title || f.replace(/\.md$/, '');
  const obsPath = join(draftDir, f);
  const row = {
    title,
    slug: slugify(f),
    status: 'draft',
    body_md: body.trim(),
    category: meta.category || null,
    tags: meta.tags ? (Array.isArray(meta.tags) ? meta.tags : [meta.tags]) : [],
    obsidian_path: obsPath,
  };
  const { error } = await supabase.from('contents').insert(row);
  if (error) { console.error(`  FAIL draft ${f}:`, error.message); results.contents.fail++; }
  else { results.contents.ok++; }
}

// 3. Contents - 시리즈
const seriesDir = '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/시리즈/에이전틱-워크플로우';
const seriesFiles = (await readdir(seriesDir)).filter(f => f.endsWith('.md'));
console.log(`Series: ${seriesFiles.length} files`);
for (const f of seriesFiles) {
  const raw = await readFile(join(seriesDir, f), 'utf-8');
  const { meta, body } = parseFrontmatter(raw);
  const title = meta.title || f.replace(/\.md$/, '');
  const obsPath = join(seriesDir, f);
  const row = {
    title,
    slug: slugify(f),
    status: 'draft',
    body_md: body.trim(),
    category: '에이전틱 워크플로우 시리즈',
    tags: meta.tags ? (Array.isArray(meta.tags) ? meta.tags : [meta.tags]) : [],
    obsidian_path: obsPath,
  };
  const { error } = await supabase.from('contents').insert(row);
  if (error) { console.error(`  FAIL series ${f}:`, error.message); results.contents.fail++; }
  else { results.contents.ok++; }
}

// 4. Threads publications
console.log('Fetching Threads posts...');
try {
  const url = `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads?fields=id,text,timestamp,permalink&limit=50&access_token=${THREADS_TOKEN}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.error) {
    console.error('Threads API error:', data.error.message);
  } else {
    const posts = data.data || [];
    console.log(`Threads: ${posts.length} posts`);
    for (const p of posts) {
      const row = {
        channel: 'threads',
        channel_post_id: p.id,
        url: p.permalink || null,
        published_at: p.timestamp || null,
      };
      const { error } = await supabase.from('publications').insert(row);
      if (error) { console.error(`  FAIL thread ${p.id}:`, error.message); results.publications.fail++; }
      else { results.publications.ok++; }
    }
  }
} catch (e) {
  console.error('Threads fetch failed:', e.message);
}

console.log('\n=== Migration Results ===');
console.log(`Ideas:        ${results.ideas.ok} ok / ${results.ideas.fail} fail`);
console.log(`Contents:     ${results.contents.ok} ok / ${results.contents.fail} fail`);
console.log(`Publications: ${results.publications.ok} ok / ${results.publications.fail} fail`);
