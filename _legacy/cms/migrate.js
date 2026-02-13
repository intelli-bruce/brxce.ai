#!/usr/bin/env node
/**
 * Migration script:
 * 1. Obsidian Content-Creator folders → contents table
 * 2. Threads API published posts → publications + contents tables
 */
import { getDb } from './db.js';
import crypto from 'crypto';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const db = getDb();

// --- Obsidian Migration ---
function migrateObsidian() {
  console.log('\n=== Obsidian Migration ===\n');

  const folders = [
    { path: '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/아이디어/', status: 'idea', category: null },
    { path: '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/진행중/', status: 'draft', category: null },
    { path: '/Volumes/WorkSSD/Projects/bruce/1-Projects/Content-Creator/시리즈/에이전틱-워크플로우/', status: 'draft', category: '에이전틱-워크플로우' },
  ];

  const insert = db.prepare(`INSERT OR IGNORE INTO contents (id, title, slug, status, category, body_md, obsidian_path, media_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'text')`);

  let count = 0;
  for (const folder of folders) {
    if (!existsSync(folder.path)) {
      console.log(`  Skip (not found): ${folder.path}`);
      continue;
    }
    const files = readdirSync(folder.path).filter(f => f.endsWith('.md'));
    console.log(`  ${folder.path}: ${files.length} files`);

    for (const file of files) {
      const filePath = join(folder.path, file);
      const title = basename(file, '.md');
      const slug = slugify(title);
      const body = readFileSync(filePath, 'utf-8');
      const id = crypto.randomUUID();

      // Check if already exists by slug
      const existing = db.prepare('SELECT id FROM contents WHERE slug = ?').get(slug);
      if (existing) {
        console.log(`    Skip (exists): ${title}`);
        continue;
      }

      insert.run(id, title, slug, folder.status, folder.category, body, filePath);
      count++;
    }
  }
  console.log(`\n  Migrated ${count} obsidian notes`);
}

// --- Threads API Migration ---
async function migrateThreads() {
  console.log('\n=== Threads Migration ===\n');

  // Get token
  let token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    const envPath = '/Users/brucechoe/Projects/bruce-studio/bruce-studio-api/.env';
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf-8');
      const match = envContent.match(/THREADS_ACCESS_TOKEN=(.+)/);
      if (match) token = match[1].trim();
    }
  }
  if (!token) {
    console.log('  No THREADS_ACCESS_TOKEN found, skipping');
    return;
  }

  const userId = '25025228587141567';
  const baseUrl = `https://graph.threads.net/v1.0/${userId}/threads`;
  let allPosts = [];
  let url = `${baseUrl}?fields=id,text,timestamp,media_type,permalink,shortcode&limit=50&access_token=${token}`;

  while (url) {
    console.log(`  Fetching page... (${allPosts.length} so far)`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  API error: ${res.status} ${await res.text()}`);
      break;
    }
    const data = await res.json();
    if (data.data) allPosts.push(...data.data);
    url = data.paging?.next || null;
  }

  console.log(`  Total posts fetched: ${allPosts.length}`);

  const insertPub = db.prepare(`INSERT OR IGNORE INTO publications (id, content_id, channel, channel_post_id, url, published_at)
    VALUES (?, ?, 'threads', ?, ?, ?)`);
  const insertContent = db.prepare(`INSERT OR IGNORE INTO contents (id, title, slug, status, body_md, media_type, created_at, updated_at)
    VALUES (?, ?, ?, 'published', ?, ?, ?, ?)`);

  let pubCount = 0, contentCount = 0;
  for (const post of allPosts) {
    const postId = post.id;
    const text = post.text || '';
    const permalink = post.permalink || '';
    const publishedAt = post.timestamp || new Date().toISOString();
    const mediaType = (post.media_type || 'TEXT_POST').toLowerCase().includes('image') ? 'image'
      : (post.media_type || '').toLowerCase().includes('video') ? 'video' : 'text';

    // Check if publication already exists
    const existingPub = db.prepare('SELECT id FROM publications WHERE channel_post_id = ?').get(postId);
    if (existingPub) continue;

    let contentId = null;

    // Only create content for text posts
    if (text && text.trim().length > 0) {
      const title = text.slice(0, 80).replace(/\n/g, ' ');
      const slug = slugify(title) || `threads-${postId}`;

      // Check if content with same slug exists
      const existing = db.prepare('SELECT id FROM contents WHERE slug = ?').get(slug);
      if (existing) {
        contentId = existing.id;
      } else {
        contentId = crypto.randomUUID();
        insertContent.run(contentId, title, slug, text, mediaType, publishedAt, publishedAt);
        contentCount++;
      }
    }

    const pubId = crypto.randomUUID();
    insertPub.run(pubId, contentId, postId, permalink, publishedAt);
    pubCount++;
  }

  console.log(`  Created ${contentCount} contents, ${pubCount} publications`);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Run
migrateObsidian();
await migrateThreads();
console.log('\n=== Migration Complete ===');
