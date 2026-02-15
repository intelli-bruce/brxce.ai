import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

const MEDIA_DIR = "/Volumes/WorkSSD/Media";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".avi", ".mkv"]);

interface MediaEntry {
  name: string;
  path: string;
  type: "image" | "video" | "other";
  size: number;
  modifiedAt: string;
}

export async function GET() {
  try {
    const entries = await readdir(MEDIA_DIR);
    const results: MediaEntry[] = [];

    for (const name of entries) {
      if (name.startsWith(".")) continue;
      const fullPath = join(MEDIA_DIR, name);
      try {
        const s = await stat(fullPath);
        if (!s.isFile()) continue;

        const ext = extname(name).toLowerCase();
        let type: MediaEntry["type"] = "other";
        if (IMAGE_EXTS.has(ext)) type = "image";
        else if (VIDEO_EXTS.has(ext)) type = "video";

        results.push({
          name,
          path: fullPath,
          type,
          size: s.size,
          modifiedAt: s.mtime.toISOString(),
        });
      } catch {
        // skip files we can't stat
      }
    }

    results.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));

    return NextResponse.json({ files: results, total: results.length });
  } catch {
    return NextResponse.json({ files: [], total: 0, error: "Cannot read media directory" });
  }
}
