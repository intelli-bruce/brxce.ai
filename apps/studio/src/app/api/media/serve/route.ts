import { NextRequest, NextResponse } from "next/server";
import { readFile, mkdtemp, rm } from "fs/promises";
import { resolve, basename, extname, join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

const MEDIA_DIR = "/Volumes/WorkSSD/Media";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".bmp": "image/bmp", ".heic": "image/heic", ".heif": "image/heif",
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
  ".avi": "video/x-msvideo", ".mkv": "video/x-matroska",
  ".pdf": "application/pdf", ".json": "application/json", ".html": "text/html",
  ".lrf": "application/octet-stream",
};

const IMAGE_CONVERT = new Set([".heic", ".heif", ".bmp", ".lrf"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".avi", ".mkv"]);

async function convertImageWithSips(inputPath: string, maxSize: number): Promise<Buffer> {
  const tmp = await mkdtemp(join(tmpdir(), "media-"));
  const outPath = join(tmp, "out.jpg");
  try {
    execSync(
      `sips -s format jpeg -Z ${maxSize} ${JSON.stringify(inputPath)} --out ${JSON.stringify(outPath)}`,
      { timeout: 15000, stdio: "pipe" },
    );
    return await readFile(outPath);
  } finally {
    rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}

async function extractVideoThumbnail(inputPath: string, maxSize: number): Promise<Buffer> {
  const tmp = await mkdtemp(join(tmpdir(), "media-"));
  const outPath = join(tmp, "thumb.jpg");
  try {
    execSync(
      `ffmpeg -i ${JSON.stringify(inputPath)} -vframes 1 -vf "scale=${maxSize}:-1" -update 1 -y ${JSON.stringify(outPath)}`,
      { timeout: 15000, stdio: "pipe" },
    );
    return await readFile(outPath);
  } finally {
    rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  const thumb = req.nextUrl.searchParams.get("thumb");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const resolved = resolve(filePath);
  if (!resolved.startsWith(MEDIA_DIR + "/") && resolved !== MEDIA_DIR) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const ext = extname(resolved).toLowerCase();
    const thumbSize = thumb ? parseInt(thumb) || 400 : 0;

    // Video thumbnail via ffmpeg
    if (VIDEO_EXTS.has(ext) && thumbSize > 0) {
      try {
        const buf = await extractVideoThumbnail(resolved, thumbSize);
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": buf.length.toString(),
            "Cache-Control": "public, max-age=86400",
          },
        });
      } catch {
        // Fall through to raw serve
      }
    }

    // Image conversion (HEIC/HEIF/BMP or thumb resize)
    const needsConvert = IMAGE_CONVERT.has(ext);
    if (needsConvert || (thumbSize > 0 && [".jpg", ".jpeg", ".png", ".heic", ".heif", ".bmp"].includes(ext))) {
      try {
        const buf = await convertImageWithSips(resolved, thumbSize || 1600);
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": buf.length.toString(),
            "Cache-Control": "public, max-age=86400",
          },
        });
      } catch {
        // Fall through
      }
    }

    // Raw serve
    const buffer = await readFile(resolved);
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${basename(resolved)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
