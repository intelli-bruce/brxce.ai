#!/usr/bin/env node
import { getDb } from './db.js';
import crypto from 'crypto';
import { readFileSync, existsSync } from 'fs';

const db = getDb();
const args = process.argv.slice(2);
const cmd = args[0];

function flag(name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  return args[i + 1];
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function printTable(rows, cols) {
  if (!rows.length) { console.log('(empty)'); return; }
  const keys = cols || Object.keys(rows[0]);
  for (const row of rows) {
    const parts = keys.map(k => `${k}=${row[k] ?? ''}`);
    console.log(parts.join(' | '));
  }
  console.log(`\n${rows.length} row(s)`);
}

function printJson(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function syncThreads() {
  // Get token
  let token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    const envPath = '/Users/brucechoe/Projects/bruce-studio/bruce-studio-api/.env';
    if (existsSync(envPath)) {
      const match = readFileSync(envPath, 'utf-8').match(/THREADS_ACCESS_TOKEN=(.+)/);
      if (match) token = match[1].trim();
    }
  }
  if (!token) { console.error('No THREADS_ACCESS_TOKEN found'); process.exit(1); }

  const userId = '25025228587141567';
  let allPosts = [];
  let url = `https://graph.threads.net/v1.0/${userId}/threads?fields=id,text,timestamp,media_type,permalink,shortcode&limit=50&access_token=${token}`;

  while (url) {
    process.stdout.write(`\r  Fetching... (${allPosts.length} posts)`);
    const res = await fetch(url);
    if (!res.ok) { console.error(`\n  API error: ${res.status} ${await res.text()}`); break; }
    const data = await res.json();
    if (data.data) allPosts.push(...data.data);
    url = data.paging?.next || null;
  }
  console.log(`\r  Fetched ${allPosts.length} posts from Threads API`);

  // Fetch metrics for all posts (likes, replies, reposts, quotes, views)
  const metricsMap = {};
  for (const post of allPosts) {
    try {
      const mRes = await fetch(`https://graph.threads.net/v1.0/${post.id}/insights?metric=likes,replies,reposts,quotes,views&access_token=${token}`);
      if (mRes.ok) {
        const mData = await mRes.json();
        const m = {};
        for (const d of (mData.data || [])) {
          m[d.name] = d.values?.[0]?.value ?? 0;
        }
        metricsMap[post.id] = m;
      }
    } catch {}
  }

  let newContents = 0, newPubs = 0, metricsUpdated = 0;

  for (const post of allPosts) {
    const postId = post.id;
    const text = post.text || '';
    const permalink = post.permalink || '';
    const publishedAt = post.timestamp || new Date().toISOString();
    const mediaType = (post.media_type || '').toLowerCase().includes('image') ? 'image'
      : (post.media_type || '').toLowerCase().includes('video') ? 'video' : 'text';
    const metrics = metricsMap[postId] ? JSON.stringify(metricsMap[postId]) : '{}';

    // Check existing publication
    const existingPub = db.prepare('SELECT id FROM publications WHERE channel_post_id = ?').get(postId);
    if (existingPub) {
      // Update metrics if we have them
      if (metricsMap[postId]) {
        db.prepare('UPDATE publications SET metrics = ? WHERE id = ?').run(metrics, existingPub.id);
        metricsUpdated++;
      }
      continue;
    }

    // New post — create content + publication
    let contentId = null;
    if (text.trim()) {
      const title = text.slice(0, 80).replace(/\n/g, ' ');
      const slug = slugify(title) || `threads-${postId}`;
      const existing = db.prepare('SELECT id FROM contents WHERE slug = ?').get(slug);
      if (existing) {
        contentId = existing.id;
      } else {
        contentId = crypto.randomUUID();
        db.prepare(`INSERT INTO contents (id, title, slug, status, body_md, media_type, created_at, updated_at)
          VALUES (?, ?, ?, 'published', ?, ?, ?, ?)`).run(contentId, title, slug, text, mediaType, publishedAt, publishedAt);
        newContents++;
      }
    }

    const pubId = crypto.randomUUID();
    db.prepare(`INSERT INTO publications (id, content_id, channel, channel_post_id, url, published_at, metrics)
      VALUES (?, ?, 'threads', ?, ?, ?, ?)`).run(pubId, contentId, postId, permalink, publishedAt, metrics);
    newPubs++;
  }

  console.log(`  New: ${newContents} contents, ${newPubs} publications`);
  console.log(`  Metrics updated: ${metricsUpdated} existing publications`);
}

switch (cmd) {
  case 'list': {
    const status = flag('status');
    const category = flag('category');
    let sql = 'SELECT id, title, status, category, media_type, created_at FROM contents';
    const conditions = [];
    const params = [];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY updated_at DESC';
    const rows = db.prepare(sql).all(...params);
    printTable(rows, ['id', 'title', 'status', 'category', 'created_at']);
    break;
  }

  case 'add': {
    const id = crypto.randomUUID();
    const title = flag('title') || 'Untitled';
    const slug = flag('slug') || slugify(title);
    const status = flag('status') || 'idea';
    const category = flag('category');
    const bodyFile = flag('body-file');
    const body = bodyFile ? readFileSync(bodyFile, 'utf-8') : (flag('body') || '');
    const hook = flag('hook');
    const coreMessage = flag('core-message');
    const mediaType = flag('media-type') || 'text';
    const tags = flag('tags') || '[]';
    const funnelStage = flag('funnel-stage');
    const cashflowLine = flag('cashflow-line');
    const cta = flag('cta');
    const sourceIdea = flag('source-idea');
    const obsidianPath = flag('obsidian-path');

    db.prepare(`INSERT INTO contents (id, title, slug, status, category, body_md, hook, core_message, media_type, tags, funnel_stage, cashflow_line, cta, source_idea, obsidian_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, title, slug, status, category, body, hook, coreMessage, mediaType, tags, funnelStage, cashflowLine, cta, sourceIdea, obsidianPath);
    console.log(`Created: ${id}`);
    break;
  }

  case 'get': {
    const id = args[1];
    if (!id) { console.error('Usage: cli.js get <id>'); process.exit(1); }
    const row = db.prepare('SELECT * FROM contents WHERE id = ?').get(id);
    if (!row) { console.error('Not found'); process.exit(1); }
    printJson(row);

    const adaptations = db.prepare('SELECT id, channel, format, status FROM adaptations WHERE content_id = ?').all(id);
    if (adaptations.length) {
      console.log('\n--- Adaptations ---');
      printTable(adaptations);
    }

    const pubs = db.prepare('SELECT id, channel, url, published_at FROM publications WHERE content_id = ?').all(id);
    if (pubs.length) {
      console.log('\n--- Publications ---');
      printTable(pubs);
    }
    break;
  }

  case 'update': {
    const id = args[1];
    if (!id) { console.error('Usage: cli.js update <id> --field value ...'); process.exit(1); }
    const fields = ['title', 'slug', 'status', 'category', 'hook', 'core-message', 'media-type', 'tags', 'funnel-stage', 'cashflow-line', 'cta', 'source-idea', 'obsidian-path', 'fact-checked', 'fact-check-notes'];
    const dbFields = {
      'title': 'title', 'slug': 'slug', 'status': 'status', 'category': 'category',
      'hook': 'hook', 'core-message': 'core_message', 'media-type': 'media_type',
      'tags': 'tags', 'funnel-stage': 'funnel_stage', 'cashflow-line': 'cashflow_line',
      'cta': 'cta', 'source-idea': 'source_idea', 'obsidian-path': 'obsidian_path',
      'fact-checked': 'fact_checked', 'fact-check-notes': 'fact_check_notes'
    };
    const sets = [];
    const params = [];
    for (const f of fields) {
      const v = flag(f);
      if (v !== undefined) { sets.push(`${dbFields[f]} = ?`); params.push(v); }
    }
    const bodyFile = flag('body-file');
    const body = flag('body');
    if (bodyFile) { sets.push('body_md = ?'); params.push(readFileSync(bodyFile, 'utf-8')); }
    else if (body) { sets.push('body_md = ?'); params.push(body); }

    if (!sets.length) { console.error('No fields to update'); process.exit(1); }
    sets.push("updated_at = datetime('now','localtime')");
    params.push(id);
    db.prepare(`UPDATE contents SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    console.log(`Updated: ${id}`);
    break;
  }

  case 'adapt': {
    const contentId = args[1];
    const channel = flag('channel');
    const format = flag('format') || 'short-text';
    const bodyFile = flag('body-file');
    const body = bodyFile ? readFileSync(bodyFile, 'utf-8') : (flag('body') || '');
    const status = flag('status') || 'draft';
    if (!contentId || !channel) { console.error('Usage: cli.js adapt <content-id> --channel <ch> --body "..."'); process.exit(1); }
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO adaptations (id, content_id, channel, format, body_adapted, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, contentId, channel, format, body, status);
    console.log(`Adaptation created: ${id}`);
    break;
  }

  case 'publish': {
    const adaptationId = args[1];
    const url = flag('url') || '';
    const channelPostId = flag('channel-post-id') || '';
    const channel = flag('channel');
    const contentId = flag('content-id');
    if (!adaptationId) { console.error('Usage: cli.js publish <adaptation-id> --url "..." --channel-post-id "..."'); process.exit(1); }

    // Get channel and content_id from adaptation if not provided
    let ch = channel, cid = contentId;
    if (!ch || !cid) {
      const adapt = db.prepare('SELECT channel, content_id FROM adaptations WHERE id = ?').get(adaptationId);
      if (adapt) { ch = ch || adapt.channel; cid = cid || adapt.content_id; }
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO publications (id, adaptation_id, content_id, channel, channel_post_id, url, published_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'))')
      .run(id, adaptationId, cid, ch, channelPostId, url);
    // Update adaptation status
    db.prepare("UPDATE adaptations SET status = 'published', updated_at = datetime('now','localtime') WHERE id = ?").run(adaptationId);
    console.log(`Published: ${id}`);
    break;
  }

  case 'search': {
    const query = args[1];
    if (!query) { console.error('Usage: cli.js search "keyword"'); process.exit(1); }
    const rows = db.prepare(`SELECT c.id, c.title, c.status, c.category, snippet(contents_fts, 1, '>>>', '<<<', '...', 40) as snippet
      FROM contents_fts f JOIN contents c ON f.rowid = c.rowid
      WHERE contents_fts MATCH ? ORDER BY rank`).all(query);
    printTable(rows, ['id', 'title', 'status', 'snippet']);
    break;
  }

  case 'stats': {
    console.log('=== Content Stats ===\n');
    const byStatus = db.prepare('SELECT status, COUNT(*) as cnt FROM contents GROUP BY status ORDER BY cnt DESC').all();
    console.log('By Status:');
    for (const r of byStatus) console.log(`  ${r.status}: ${r.cnt}`);

    const byCategory = db.prepare('SELECT category, COUNT(*) as cnt FROM contents WHERE category IS NOT NULL GROUP BY category ORDER BY cnt DESC').all();
    if (byCategory.length) {
      console.log('\nBy Category:');
      for (const r of byCategory) console.log(`  ${r.category}: ${r.cnt}`);
    }

    const byChannel = db.prepare('SELECT channel, COUNT(*) as cnt FROM publications GROUP BY channel ORDER BY cnt DESC').all();
    if (byChannel.length) {
      console.log('\nPublications by Channel:');
      for (const r of byChannel) console.log(`  ${r.channel}: ${r.cnt}`);
    }

    const totalContents = db.prepare('SELECT COUNT(*) as cnt FROM contents').get().cnt;
    const totalAdapt = db.prepare('SELECT COUNT(*) as cnt FROM adaptations').get().cnt;
    const totalPub = db.prepare('SELECT COUNT(*) as cnt FROM publications').get().cnt;
    const totalIdeas = db.prepare('SELECT COUNT(*) as cnt FROM ideas').get().cnt;
    console.log(`\nTotals: ${totalContents} contents, ${totalAdapt} adaptations, ${totalPub} publications, ${totalIdeas} ideas`);
    break;
  }

  case 'idea': {
    const text = args[1];
    const source = flag('source') || 'manual';
    if (!text) { console.error('Usage: cli.js idea "text" [--source telegram]'); process.exit(1); }
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO ideas (id, raw_text, source) VALUES (?, ?, ?)').run(id, text, source);
    console.log(`Idea added: ${id}`);
    break;
  }

  case 'ideas': {
    const rows = db.prepare('SELECT id, raw_text, source, promoted_to, created_at FROM ideas ORDER BY created_at DESC').all();
    printTable(rows, ['id', 'raw_text', 'source', 'promoted_to', 'created_at']);
    break;
  }

  case 'promote': {
    const ideaId = args[1];
    if (!ideaId) { console.error('Usage: cli.js promote <idea-id>'); process.exit(1); }
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);
    if (!idea) { console.error('Idea not found'); process.exit(1); }
    if (idea.promoted_to) { console.error(`Already promoted to ${idea.promoted_to}`); process.exit(1); }

    const contentId = crypto.randomUUID();
    const title = idea.raw_text.slice(0, 100);
    const slug = slugify(title);
    db.prepare('INSERT INTO contents (id, title, slug, status, source_idea) VALUES (?, ?, ?, ?, ?)')
      .run(contentId, title, slug, 'idea', `idea:${ideaId}`);
    db.prepare('UPDATE ideas SET promoted_to = ? WHERE id = ?').run(contentId, ideaId);
    console.log(`Promoted idea → content: ${contentId}`);
    break;
  }

  case 'sync-threads': {
    await syncThreads();
    break;
  }

  default:
    console.log(`Usage: node cli.js <command>

Commands:
  list [--status <s>] [--category <c>]   List contents
  add --title "..." [--status ...] [...]  Add content
  get <id>                                Get content detail
  update <id> --field value ...           Update content
  adapt <id> --channel <ch> --body "..."  Add channel adaptation
  publish <adapt-id> [--url ...] [...]    Record publication
  search "keyword"                        Full-text search
  stats                                   Summary statistics
  idea "text" [--source ...]              Add idea seed
  ideas                                   List ideas
  promote <idea-id>                       Promote idea to content
  sync-threads                             Sync from Threads API (new posts + metrics)
`);
}
