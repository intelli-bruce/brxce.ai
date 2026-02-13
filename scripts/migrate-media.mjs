#!/usr/bin/env node
/**
 * Migrate obsidian media to Supabase Storage content-media bucket
 * and update contents table references.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const SUPABASE_URL = "https://euhxmmiqfyptvsvvbbvp.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHhtbWlxZnlwdHZzdnZiYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkxNTkwMywiZXhwIjoyMDg2NDkxOTAzfQ.lkJCQ3y6QZ_TjNPUh187iELorIj64hyvmcfOhZ8zfuk";
const BUCKET = "content-media";
const VAULT_ROOT = "/Volumes/WorkSSD/Projects/bruce";

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Find file in vault
function findFile(name) {
  try {
    const result = execSync(
      `find "${VAULT_ROOT}" -name "${name}" -not -path "*/.git/*" 2>/dev/null | head -1`,
      { encoding: "utf-8" }
    ).trim();
    return result || null;
  } catch { return null; }
}

function publicUrl(name) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;
}

async function main() {
  console.log("=== Media Migration ===\n");

  // 1. Get all contents with body_md containing image refs
  const { data: contents, error } = await sb
    .from("contents")
    .select("id, title, body_md, media_urls, obsidian_path")
    .not("body_md", "is", null);

  if (error) { console.error("DB error:", error); return; }
  console.log(`Found ${contents.length} contents with body_md\n`);

  // Also collect image refs from obsidian source files
  const imageRefs = new Map(); // imageName -> localPath
  const obsidianDir = `${VAULT_ROOT}/1-Projects/Content-Creator`;

  // Extract all ![[image]] refs from obsidian markdown
  try {
    const grepOutput = execSync(
      `grep -roh '!\\[\\[[^]]*\\]\\]' "${obsidianDir}" --include="*.md" 2>/dev/null`,
      { encoding: "utf-8" }
    );
    for (const match of grepOutput.split("\n").filter(Boolean)) {
      const name = match.replace("![[", "").replace("]]", "").split("|")[0];
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) {
        const path = findFile(name);
        if (path) imageRefs.set(name, path);
      }
    }
  } catch {}

  console.log(`Found ${imageRefs.size} unique images in obsidian files\n`);

  // 2. Upload images to Supabase Storage
  let uploaded = 0;
  let skipped = 0;
  const urlMap = new Map(); // originalName -> publicUrl

  // Check existing files in bucket
  const { data: existing } = await sb.storage.from(BUCKET).list("", { limit: 1000 });
  const existingNames = new Set((existing || []).map(f => f.name));

  for (const [name, localPath] of imageRefs) {
    const storageName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (existingNames.has(storageName)) {
      urlMap.set(name, publicUrl(storageName));
      skipped++;
      continue;
    }

    try {
      const fileBuffer = readFileSync(localPath);
      const ext = name.split(".").pop().toLowerCase();
      const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };

      const { error: uploadError } = await sb.storage.from(BUCKET).upload(storageName, fileBuffer, {
        contentType: mimeMap[ext] || "application/octet-stream",
        cacheControl: "3600",
        upsert: true,
      });

      if (uploadError) {
        console.error(`  ✗ ${name}: ${uploadError.message}`);
      } else {
        urlMap.set(name, publicUrl(storageName));
        uploaded++;
        console.log(`  ✓ ${name} → ${storageName}`);
      }
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  }

  console.log(`\nUploaded: ${uploaded}, Skipped (exists): ${skipped}\n`);

  // 3. Update contents body_md and media_urls
  let updatedContents = 0;
  for (const content of contents) {
    if (!content.body_md) continue;

    let newBody = content.body_md;
    const mediaUrls = [];
    let changed = false;

    // Replace ![[image.jpg]] and ![[image.jpg|size]] patterns
    newBody = newBody.replace(/!\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g, (match, name) => {
      const url = urlMap.get(name);
      if (url) {
        mediaUrls.push(url);
        changed = true;
        return `![${name}](${url})`;
      }
      return match;
    });

    // Replace ![](relative/path) if they point to local files
    newBody = newBody.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, path) => {
      const fileName = path.split("/").pop();
      const url = urlMap.get(fileName);
      if (url) {
        mediaUrls.push(url);
        changed = true;
        return `![${alt}](${url})`;
      }
      return match;
    });

    if (changed) {
      const existingUrls = Array.isArray(content.media_urls) ? content.media_urls : [];
      const allUrls = [...new Set([...existingUrls, ...mediaUrls])];

      const { error: updateError } = await sb
        .from("contents")
        .update({ body_md: newBody, media_urls: allUrls })
        .eq("id", content.id);

      if (updateError) {
        console.error(`  ✗ Content "${content.title}": ${updateError.message}`);
      } else {
        updatedContents++;
        console.log(`  ✓ Updated: "${content.title}" (${mediaUrls.length} images)`);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Images uploaded: ${uploaded}`);
  console.log(`Images skipped: ${skipped}`);
  console.log(`Contents updated: ${updatedContents}`);
  console.log(`Total images mapped: ${urlMap.size}`);
}

main().catch(console.error);
