import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve, basename, extname } from "path";
import sharp from "sharp";

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

// Formats that browsers can't display natively → convert to JPEG
const NEEDS_CONVERT = new Set([".heic", ".heif", ".bmp", ".lrf"]);

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  const thumb = req.nextUrl.searchParams.get("thumb"); // ?thumb=300 for thumbnail
  
  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Path traversal prevention
  const resolved = resolve(filePath);
  if (!resolved.startsWith(MEDIA_DIR + "/") && resolved !== MEDIA_DIR) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const buffer = await readFile(resolved);
    const ext = extname(resolved).toLowerCase();
    
    // If thumbnail requested or format needs conversion
    const thumbSize = thumb ? parseInt(thumb) || 300 : 0;
    const needsConvert = NEEDS_CONVERT.has(ext);
    
    if (thumbSize > 0 || needsConvert) {
      try {
        let img = sharp(buffer);
        
        if (thumbSize > 0) {
          img = img.resize({
            width: thumbSize,
            height: thumbSize,
            fit: "cover",
            withoutEnlargement: true,
          });
        }
        
        const outBuf = await img.jpeg({ quality: 80 }).toBuffer();
        
        return new NextResponse(outBuf, {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": outBuf.length.toString(),
            "Cache-Control": "public, max-age=86400",
            "Content-Disposition": `inline; filename="${basename(resolved, ext)}.jpg"`,
          },
        });
      } catch {
        // If sharp conversion fails, fall through to raw serve
      }
    }
    
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
