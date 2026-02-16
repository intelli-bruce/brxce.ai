/**
 * Diagram export — renders a diagram at exact export dimensions as PNG/JPEG blob.
 *
 * Uses html-to-image for pixel-perfect DOM→canvas conversion.
 * The flow:
 *   1. Clone the #diagram-export element into an offscreen container
 *   2. Force exportMode dimensions (from RATIO_PRESETS)
 *   3. Render to canvas via html-to-image
 *   4. Return blob + trigger download
 */
import { toPng, toJpeg } from "html-to-image";
import { RATIO_PRESETS, type RatioPreset } from "../tokens";

export interface ExportOptions {
  /** Target element (must have id="diagram-export") */
  element: HTMLElement;
  /** Ratio preset key */
  ratio: RatioPreset;
  /** Output format */
  format?: "png" | "jpeg";
  /** JPEG quality (0-1) */
  quality?: number;
  /** Pixel scale (2 = 2x resolution) */
  pixelRatio?: number;
  /** Filename without extension */
  filename?: string;
}

export async function exportDiagram({
  element,
  ratio,
  format = "png",
  quality = 0.95,
  pixelRatio = 2,
  filename = "diagram",
}: ExportOptions): Promise<Blob> {
  const preset = RATIO_PRESETS[ratio];
  const { exportWidth: width, exportHeight: height } = preset;

  // Store original styles
  const origWidth = element.style.width;
  const origAspectRatio = element.style.aspectRatio;
  const origHeight = element.style.height;
  const origBorderRadius = element.style.borderRadius;

  // Force export dimensions
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.aspectRatio = "unset";
  element.style.borderRadius = "0";

  // Wait for reflow
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const fn = format === "jpeg" ? toJpeg : toPng;

  try {
    const dataUrl = await fn(element, {
      width,
      height,
      pixelRatio,
      quality: format === "jpeg" ? quality : undefined,
      backgroundColor: "#0A0A0A",
      style: {
        transform: "none",
        transformOrigin: "top left",
      },
    });

    // Convert dataUrl to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return blob;
  } finally {
    // Restore original styles
    element.style.width = origWidth;
    element.style.aspectRatio = origAspectRatio;
    element.style.height = origHeight;
    element.style.borderRadius = origBorderRadius;
  }
}
