import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync, copyFileSync, existsSync, readdirSync } from "fs";
import { execSync } from "child_process";

const DATA_DIR = join(process.cwd(), ".data");
const DB_PATH = join(DATA_DIR, "references.db");
const REF_DIR = join(DATA_DIR, "references");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(REF_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      bio TEXT,
      follower_count INTEGER,
      category TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      post_date TEXT NOT NULL,
      post_type TEXT NOT NULL DEFAULT 'carousel',
      slide_count INTEGER DEFAULT 1,
      like_count INTEGER,
      comment_count INTEGER,
      caption TEXT,
      layout_pattern TEXT,
      hook_type TEXT,
      cta_type TEXT,
      topic_tags TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL REFERENCES posts(id),
      slide_index INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      template_type TEXT,
      has_text_overlay INTEGER DEFAULT 0,
      dominant_color TEXT,
      notes TEXT,
      UNIQUE(post_id, slide_index)
    );
    CREATE INDEX IF NOT EXISTS idx_posts_account ON posts(account_id);
    CREATE INDEX IF NOT EXISTS idx_posts_layout ON posts(layout_pattern);
    CREATE INDEX IF NOT EXISTS idx_posts_hook ON posts(hook_type);
    CREATE INDEX IF NOT EXISTS idx_slides_post ON slides(post_id);
  `);
  ensureVideoTables(_db);
  return _db;
}

// === Video References tables ===
function ensureVideoTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_accounts (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      platform TEXT DEFAULT 'instagram',
      follower_count INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS video_posts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      post_date TEXT,
      platform TEXT DEFAULT 'instagram',
      url TEXT,
      duration_sec INTEGER,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      view_count INTEGER,
      caption TEXT,
      thumbnail_path TEXT,
      video_path TEXT,
      style_tags TEXT,
      transition_tags TEXT,
      music_tags TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_video_posts_account ON video_posts(account_id);
  `);
}

// === Accounts ===

export function getAccounts() {
  const db = getDb();
  return db.prepare("SELECT * FROM accounts ORDER BY id").all();
}

export function createAccount(data: {
  id: string;
  display_name?: string;
  bio?: string;
  follower_count?: number;
  category?: string;
  notes?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, display_name, bio, follower_count, category, notes)
    VALUES (@id, @display_name, @bio, @follower_count, @category, @notes)
  `).run({
    id: data.id,
    display_name: data.display_name ?? null,
    bio: data.bio ?? null,
    follower_count: data.follower_count ?? null,
    category: data.category ?? null,
    notes: data.notes ?? null,
  });
}

// === Posts ===

export interface PostFilters {
  account?: string;
  layout?: string;
  hook?: string;
  cta?: string;
  sort?: "latest" | "likes" | "comments";
  limit?: number;
  offset?: number;
}

export function getPosts(filters: PostFilters = {}) {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.account) {
    conditions.push("account_id = @account");
    params.account = filters.account;
  }
  if (filters.layout) {
    conditions.push("layout_pattern = @layout");
    params.layout = filters.layout;
  }
  if (filters.hook) {
    conditions.push("hook_type = @hook");
    params.hook = filters.hook;
  }
  if (filters.cta) {
    conditions.push("cta_type = @cta");
    params.cta = filters.cta;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderMap: Record<string, string> = {
    latest: "post_date DESC",
    likes: "like_count DESC",
    comments: "comment_count DESC",
  };
  const order = orderMap[filters.sort ?? "latest"] ?? "post_date DESC";
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const rows = db
    .prepare(`SELECT * FROM posts ${where} ORDER BY ${order} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });

  const total = db
    .prepare(`SELECT COUNT(*) as cnt FROM posts ${where}`)
    .get(params) as { cnt: number };

  return { posts: rows, total: total.cnt };
}

export function getPost(id: string) {
  const db = getDb();
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (!post) return null;
  const slides = db.prepare("SELECT * FROM slides WHERE post_id = ? ORDER BY slide_index").all(id);
  return { ...post, slides };
}

export function updatePost(id: string, patch: Record<string, any>) {
  const db = getDb();
  const allowed = ["layout_pattern", "hook_type", "cta_type", "topic_tags", "notes"];
  const sets: string[] = [];
  const params: Record<string, any> = { id };
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = patch[key];
    }
  }
  if (!sets.length) return getPost(id);
  sets.push("updated_at = datetime('now')");
  db.prepare(`UPDATE posts SET ${sets.join(", ")} WHERE id = @id`).run(params);
  return getPost(id);
}

export function updateSlide(postId: string, slideIndex: number, patch: Record<string, any>) {
  const db = getDb();
  const allowed = ["template_type", "has_text_overlay", "dominant_color", "notes"];
  const sets: string[] = [];
  const params: Record<string, any> = { post_id: postId, slide_index: slideIndex };
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = patch[key];
    }
  }
  if (!sets.length) return;
  db.prepare(`UPDATE slides SET ${sets.join(", ")} WHERE post_id = @post_id AND slide_index = @slide_index`).run(params);
}

// === Import ===

export function importFromInstaloader(source: string, accountId: string, limit?: number) {
  const db = getDb();

  // Ensure account exists
  createAccount({ id: accountId });

  // Find all .json.xz files
  const files = readdirSync(source)
    .filter((f) => f.endsWith(".json.xz") && !f.includes("profile_pic"))
    .sort()
    .reverse();

  const toProcess = limit ? files.slice(0, limit) : files;
  let imported = 0;
  let skipped = 0;

  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (id, account_id, post_date, post_type, slide_count, like_count, comment_count, caption)
    VALUES (@id, @account_id, @post_date, @post_type, @slide_count, @like_count, @comment_count, @caption)
  `);

  const insertSlide = db.prepare(`
    INSERT OR IGNORE INTO slides (post_id, slide_index, image_path)
    VALUES (@post_id, @slide_index, @image_path)
  `);

  const importMany = db.transaction((items: typeof toProcess) => {
    for (const file of items) {
      try {
        const jsonPath = join(source, file);
        const raw = execSync(`xz -dc "${jsonPath}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
        const data = JSON.parse(raw);
        const node = data.node || data;

        const shortcode = node.shortcode;
        if (!shortcode) { skipped++; continue; }

        // Check duplicate
        const existing = db.prepare("SELECT id FROM posts WHERE id = ?").get(shortcode);
        if (existing) { skipped++; continue; }

        const timestamp = node.taken_at_timestamp;
        const postDate = timestamp
          ? new Date(timestamp * 1000).toISOString().split("T")[0]
          : file.split("_UTC")[0].replace(/_/g, " ");

        const typename = node.__typename || "";
        const postType = typename === "GraphVideo" ? "reel" : typename === "GraphSidecar" ? "carousel" : "single";

        const likeCount = node.edge_media_preview_like?.count ?? 0;
        const commentCount = node.edge_media_to_comment?.count ?? 0;
        const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";

        // Find image files for this post
        const basePrefix = file.replace(".json.xz", "");
        const imageFiles = readdirSync(source)
          .filter((f) => f.startsWith(basePrefix) && f.endsWith(".jpg") && !f.includes("profile_pic"))
          .sort((a, b) => {
            const numA = parseInt(a.match(/_(\d+)\.jpg$/)?.[1] ?? "0");
            const numB = parseInt(b.match(/_(\d+)\.jpg$/)?.[1] ?? "0");
            return numA - numB;
          });

        const slideCount = imageFiles.length || 1;

        // Copy images
        const destDir = join(REF_DIR, accountId, shortcode);
        mkdirSync(destDir, { recursive: true });

        for (let i = 0; i < imageFiles.length; i++) {
          const srcPath = join(source, imageFiles[i]);
          const destPath = join(destDir, `slide-${i + 1}.jpg`);
          if (!existsSync(destPath)) {
            copyFileSync(srcPath, destPath);
          }
        }

        // Insert post
        insertPost.run({
          id: shortcode,
          account_id: accountId,
          post_date: postDate,
          post_type: postType,
          slide_count: slideCount,
          like_count: likeCount,
          comment_count: commentCount,
          caption,
        });

        // Insert slides
        for (let i = 0; i < imageFiles.length; i++) {
          insertSlide.run({
            post_id: shortcode,
            slide_index: i + 1,
            image_path: `${accountId}/${shortcode}/slide-${i + 1}.jpg`,
          });
        }

        imported++;
      } catch (e) {
        skipped++;
      }
    }
  });

  importMany(toProcess);

  return { imported, skipped, total: toProcess.length };
}

// === Image path resolver ===

export function getSlideImagePath(postId: string, slideIndex: number): string | null {
  const db = getDb();
  const slide = db.prepare("SELECT image_path FROM slides WHERE post_id = ? AND slide_index = ?").get(postId, slideIndex) as { image_path: string } | undefined;
  if (!slide) return null;
  return join(REF_DIR, slide.image_path);
}

// ============================================================
// === Video References ===
// ============================================================

const VIDEO_REF_DIR = join(DATA_DIR, "video-references");

export function getVideoAccounts() {
  const db = getDb();
  return db.prepare("SELECT * FROM video_accounts ORDER BY id").all();
}

export interface VideoPostFilters {
  account?: string;
  platform?: string;
  style?: string;
  sort?: "latest" | "views" | "likes" | "comments";
  limit?: number;
  offset?: number;
}

export function getVideoPosts(filters: VideoPostFilters = {}) {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.account) {
    conditions.push("account_id = @account");
    params.account = filters.account;
  }
  if (filters.platform) {
    conditions.push("platform = @platform");
    params.platform = filters.platform;
  }
  if (filters.style) {
    conditions.push("style_tags LIKE @style");
    params.style = `%${filters.style}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderMap: Record<string, string> = {
    latest: "post_date DESC, created_at DESC",
    views: "view_count DESC",
    likes: "like_count DESC",
    comments: "comment_count DESC",
  };
  const order = orderMap[filters.sort ?? "latest"] ?? "post_date DESC";
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const rows = db
    .prepare(`SELECT * FROM video_posts ${where} ORDER BY ${order} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });
  const total = db
    .prepare(`SELECT COUNT(*) as cnt FROM video_posts ${where}`)
    .get(params) as { cnt: number };

  return { videos: rows, total: total.cnt };
}

export function getVideoPost(id: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM video_posts WHERE id = ?").get(id) ?? null;
}

export function updateVideoPost(id: string, patch: Record<string, any>) {
  const db = getDb();
  const allowed = ["style_tags", "transition_tags", "music_tags", "notes"];
  const sets: string[] = [];
  const params: Record<string, any> = { id };
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = patch[key];
    }
  }
  if (!sets.length) return getVideoPost(id);
  sets.push("updated_at = datetime('now')");
  db.prepare(`UPDATE video_posts SET ${sets.join(", ")} WHERE id = @id`).run(params);
  return getVideoPost(id);
}

export function importVideoFromUrl(url: string): { id: string; message: string } {
  const db = getDb();
  mkdirSync(VIDEO_REF_DIR, { recursive: true });

  // Use yt-dlp to fetch metadata
  let meta: any;
  try {
    const raw = execSync(
      `yt-dlp --dump-json --no-download "${url}" 2>/dev/null`,
      { maxBuffer: 10 * 1024 * 1024 }
    ).toString();
    meta = JSON.parse(raw);
  } catch (e: any) {
    throw new Error("yt-dlp 메타데이터 가져오기 실패. URL을 확인하세요.");
  }

  const videoId = meta.id || meta.display_id || Date.now().toString();

  // Check duplicate
  const existing = db.prepare("SELECT id FROM video_posts WHERE id = ?").get(videoId);
  if (existing) {
    return { id: videoId, message: "이미 존재하는 영상입니다." };
  }

  // Determine account
  const uploader = meta.uploader_id || meta.uploader || meta.channel || "unknown";
  const uploaderName = meta.uploader || meta.channel || uploader;

  // Detect platform
  let platform = "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";
  else if (url.includes("tiktok.com")) platform = "tiktok";
  else if (url.includes("threads.net")) platform = "threads";

  // Ensure account
  db.prepare(`
    INSERT OR IGNORE INTO video_accounts (id, display_name, platform)
    VALUES (@id, @display_name, @platform)
  `).run({ id: uploader, display_name: uploaderName, platform });

  // Download thumbnail + video
  const destDir = join(VIDEO_REF_DIR, uploader);
  mkdirSync(destDir, { recursive: true });
  const thumbPath = join(destDir, `${videoId}.jpg`);
  let savedThumb: string | null = null;
  let savedVideo: string | null = null;

  // Thumbnail
  if (meta.thumbnail) {
    try {
      execSync(`curl -sL -o "${thumbPath}" "${meta.thumbnail}"`, { timeout: 15000 });
      savedThumb = `${uploader}/${videoId}.jpg`;
    } catch { /* ignore */ }
  }

  // Video file
  const videoPath = join(destDir, `${videoId}.mp4`);
  try {
    execSync(
      `yt-dlp -f "best[ext=mp4]/best" --no-playlist -o "${videoPath}" "${url}" 2>/dev/null`,
      { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
    );
    if (existsSync(videoPath)) {
      savedVideo = `${uploader}/${videoId}.mp4`;
    }
  } catch { /* video download failed, thumbnail-only mode */ }

  // Post date
  const uploadDate = meta.upload_date; // YYYYMMDD
  const postDate = uploadDate
    ? `${uploadDate.slice(0, 4)}-${uploadDate.slice(4, 6)}-${uploadDate.slice(6, 8)}`
    : new Date().toISOString().split("T")[0];

  // Insert
  db.prepare(`
    INSERT INTO video_posts (id, account_id, post_date, platform, url, duration_sec,
      like_count, comment_count, view_count, caption, thumbnail_path, video_path)
    VALUES (@id, @account_id, @post_date, @platform, @url, @duration_sec,
      @like_count, @comment_count, @view_count, @caption, @thumbnail_path, @video_path)
  `).run({
    id: videoId,
    account_id: uploader,
    post_date: postDate,
    platform,
    url,
    duration_sec: meta.duration ? Math.round(meta.duration) : null,
    like_count: meta.like_count ?? 0,
    comment_count: meta.comment_count ?? 0,
    view_count: meta.view_count ?? null,
    caption: meta.description || meta.title || "",
    thumbnail_path: savedThumb,
    video_path: savedVideo,
  });

  return { id: videoId, message: "임포트 완료" };
}

export function backfillVideoFiles(): { updated: number; failed: number } {
  const db = getDb();
  mkdirSync(VIDEO_REF_DIR, { recursive: true });
  const rows = db.prepare("SELECT id, account_id, url FROM video_posts WHERE video_path IS NULL AND url IS NOT NULL").all() as { id: string; account_id: string; url: string }[];
  let updated = 0, failed = 0;
  for (const row of rows) {
    const destDir = join(VIDEO_REF_DIR, row.account_id);
    mkdirSync(destDir, { recursive: true });
    const videoPath = join(destDir, `${row.id}.mp4`);
    try {
      execSync(
        `yt-dlp -f "best[ext=mp4]/best" --no-playlist -o "${videoPath}" "${row.url}" 2>/dev/null`,
        { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
      );
      if (existsSync(videoPath)) {
        db.prepare("UPDATE video_posts SET video_path = ? WHERE id = ?").run(`${row.account_id}/${row.id}.mp4`, row.id);
        updated++;
      } else { failed++; }
    } catch { failed++; }
  }
  return { updated, failed };
}

export function getVideoFilePath(postId: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT video_path FROM video_posts WHERE id = ?").get(postId) as { video_path: string } | undefined;
  if (!row?.video_path) return null;
  return join(VIDEO_REF_DIR, row.video_path);
}

export function getVideoThumbnailPath(postId: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT thumbnail_path FROM video_posts WHERE id = ?").get(postId) as { thumbnail_path: string } | undefined;
  if (!row?.thumbnail_path) return null;
  return join(VIDEO_REF_DIR, row.thumbnail_path);
}
