import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

/**
 * POST /api/media/edit
 *
 * Server-side image editing via sharp.
 * Accepts JSON body with operations array.
 *
 * Body:
 * {
 *   sourceUrl: string,          // public URL of source image
 *   operations: Operation[],    // ordered list of edits
 *   outputFormat?: "png" | "jpeg" | "webp",
 *   quality?: number            // 1-100 for jpeg/webp
 * }
 *
 * Operation types:
 * - { type: "resize", width?: number, height?: number, fit?: "cover"|"contain"|"fill"|"inside"|"outside" }
 * - { type: "crop", left: number, top: number, width: number, height: number }
 * - { type: "rotate", angle: number, background?: string }
 * - { type: "flip" } | { type: "flop" }
 * - { type: "blur", sigma: number }
 * - { type: "sharpen", sigma?: number }
 * - { type: "grayscale" }
 * - { type: "tint", r: number, g: number, b: number }
 * - { type: "brightness", factor: number }  // 0.5 = darker, 1.5 = brighter
 * - { type: "saturation", factor: number }
 * - { type: "contrast", factor: number }    // linear stretch
 * - { type: "negate" }
 * - { type: "normalize" }                   // auto levels
 * - { type: "gamma", value: number }
 * - { type: "border", width: number, color: string }
 * - { type: "text", text: string, x: number, y: number, fontSize?: number, color?: string, fontWeight?: string }
 * - { type: "watermark", text: string, position?: "bottom-right"|"bottom-left"|"top-right"|"top-left"|"center", opacity?: number, fontSize?: number, color?: string }
 * - { type: "overlay", url: string, x?: number, y?: number, width?: number, height?: number, opacity?: number }
 * - { type: "roundCorners", radius: number }
 * - { type: "shadow", blur?: number, x?: number, y?: number, color?: string }
 *
 * Returns: image binary with appropriate content-type
 */

interface Operation {
  type: string;
  [key: string]: unknown;
}

function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const alpha = h.length === 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1;
  return { r, g, b, alpha };
}

async function createTextSvg(
  text: string,
  fontSize: number,
  color: string,
  fontWeight: string = "normal",
  maxWidth?: number,
): Promise<Buffer> {
  const lines = text.split("\n");
  const lineHeight = fontSize * 1.3;
  const height = Math.ceil(lines.length * lineHeight + fontSize * 0.3);
  const width = maxWidth || Math.ceil(fontSize * Math.max(...lines.map((l) => l.length)) * 0.65);

  const svgLines = lines
    .map(
      (line, i) =>
        `<text x="0" y="${fontSize + i * lineHeight}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" font-family="sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgLines}</svg>`;
  return Buffer.from(svg);
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceUrl, operations = [], outputFormat, quality } = body as {
      sourceUrl: string;
      operations: Operation[];
      outputFormat?: "png" | "jpeg" | "webp";
      quality?: number;
    };

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 });
    }

    // Fetch source image
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${res.status}` }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await res.arrayBuffer());
    let img = sharp(inputBuffer);

    // Get metadata for operations that need dimensions
    const meta = await img.metadata();
    const imgWidth = meta.width || 1;
    const imgHeight = meta.height || 1;

    // Apply operations in order
    for (const op of operations) {
      switch (op.type) {
        case "resize":
          img = img.resize({
            width: op.width as number | undefined,
            height: op.height as number | undefined,
            fit: (op.fit as string as keyof sharp.FitEnum) || "inside",
            withoutEnlargement: true,
          });
          break;

        case "crop":
        case "extract":
          img = img.extract({
            left: Math.round(op.left as number),
            top: Math.round(op.top as number),
            width: Math.round(op.width as number),
            height: Math.round(op.height as number),
          });
          break;

        case "rotate":
          img = img.rotate(op.angle as number, {
            background: op.background
              ? hexToRgba(op.background as string)
              : { r: 0, g: 0, b: 0, alpha: 0 },
          });
          break;

        case "flip":
          img = img.flip();
          break;

        case "flop":
          img = img.flop();
          break;

        case "blur":
          img = img.blur(Math.max(0.3, op.sigma as number));
          break;

        case "sharpen":
          img = img.sharpen({ sigma: (op.sigma as number) || 1 });
          break;

        case "grayscale":
          img = img.grayscale();
          break;

        case "tint":
          img = img.tint({ r: op.r as number, g: op.g as number, b: op.b as number });
          break;

        case "brightness": {
          const bf = op.factor as number;
          img = img.modulate({ brightness: bf });
          break;
        }

        case "saturation": {
          const sf = op.factor as number;
          img = img.modulate({ saturation: sf });
          break;
        }

        case "contrast": {
          // linear contrast via levels
          const cf = op.factor as number;
          img = img.linear(cf, -(128 * cf) + 128);
          break;
        }

        case "negate":
          img = img.negate();
          break;

        case "normalize":
          img = img.normalize();
          break;

        case "gamma":
          img = img.gamma(op.value as number);
          break;

        case "border": {
          const bw = op.width as number;
          const bc = hexToRgba((op.color as string) || "#000000");
          img = img.extend({
            top: bw,
            bottom: bw,
            left: bw,
            right: bw,
            background: bc,
          });
          break;
        }

        case "text": {
          const fontSize = (op.fontSize as number) || 32;
          const color = (op.color as string) || "#ffffff";
          const fontWeight = (op.fontWeight as string) || "bold";
          const textSvg = await createTextSvg(op.text as string, fontSize, color, fontWeight);
          const x = Math.round(op.x as number);
          const y = Math.round(op.y as number);
          img = img.composite([{ input: textSvg, left: x, top: y }]);
          break;
        }

        case "watermark": {
          const wText = op.text as string;
          const wFontSize = (op.fontSize as number) || 24;
          const wColor = (op.color as string) || "#ffffff";
          const wOpacity = (op.opacity as number) || 0.5;
          const wPos = (op.position as string) || "bottom-right";

          // Create watermark with opacity
          const wSvg = await createTextSvg(wText, wFontSize, wColor, "bold");
          let wImg = sharp(wSvg);
          const wMeta = await wImg.metadata();
          const ww = wMeta.width || 100;
          const wh = wMeta.height || 30;

          // Ensure alpha
          wImg = wImg.ensureAlpha().composite([
            {
              input: Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${ww}" height="${wh}"><rect width="${ww}" height="${wh}" fill="rgba(0,0,0,${wOpacity})"/></svg>`,
              ),
              blend: "dest-in",
            },
          ]);

          const wBuf = await wImg.png().toBuffer();
          const pad = 20;
          let left = pad,
            top = pad;
          if (wPos.includes("right")) left = imgWidth - ww - pad;
          if (wPos.includes("bottom")) top = imgHeight - wh - pad;
          if (wPos === "center") {
            left = Math.round((imgWidth - ww) / 2);
            top = Math.round((imgHeight - wh) / 2);
          }

          img = img.composite([{ input: wBuf, left: Math.max(0, left), top: Math.max(0, top) }]);
          break;
        }

        case "overlay": {
          const oRes = await fetch(op.url as string);
          if (oRes.ok) {
            let oBuf = Buffer.from(await oRes.arrayBuffer());
            let oImg = sharp(oBuf);
            if (op.width || op.height) {
              oImg = oImg.resize({
                width: op.width as number | undefined,
                height: op.height as number | undefined,
                fit: "inside",
              });
            }
            oBuf = await oImg.png().toBuffer();
            img = img.composite([
              {
                input: oBuf,
                left: Math.round((op.x as number) || 0),
                top: Math.round((op.y as number) || 0),
              },
            ]);
          }
          break;
        }

        case "roundCorners": {
          const radius = op.radius as number;
          const curMeta = await img.metadata();
          const cw = curMeta.width || imgWidth;
          const ch = curMeta.height || imgHeight;
          const mask = Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><rect x="0" y="0" width="${cw}" height="${ch}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
          );
          img = img.composite([{ input: mask, blend: "dest-in" }]);
          break;
        }

        default:
          // Unknown operation, skip
          break;
      }
    }

    // Output
    const fmt = outputFormat || (meta.format as "png" | "jpeg" | "webp") || "png";
    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };

    if (fmt === "jpeg") img = img.jpeg({ quality: quality || 90 });
    else if (fmt === "webp") img = img.webp({ quality: quality || 90 });
    else img = img.png();

    const outBuf = await img.toBuffer();

    return new NextResponse(outBuf, {
      headers: {
        "Content-Type": mimeMap[fmt] || "image/png",
        "Content-Length": outBuf.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
