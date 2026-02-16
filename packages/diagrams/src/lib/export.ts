/**
 * Diagram export — renders diagram at exact export dimensions as PNG blob.
 * Uses html-to-image (dynamically imported for Next.js compat).
 */
import { RATIO_PRESETS, type RatioPreset } from "../tokens";

export interface ExportOptions {
  element: HTMLElement;
  ratio: RatioPreset;
  format?: "png" | "jpeg";
  quality?: number;
  pixelRatio?: number;
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
  console.log("[export] starting...", { ratio, format });

  const preset = RATIO_PRESETS[ratio];
  const width = preset.exportWidth;
  const height = preset.exportHeight;

  console.log("[export] target size:", width, "x", height);

  // Dynamic import (avoids SSR issues)
  const htmlToImage = await import("html-to-image");
  console.log("[export] html-to-image loaded");

  // Store original styles
  const orig = {
    width: element.style.width,
    aspectRatio: element.style.aspectRatio,
    height: element.style.height,
    borderRadius: element.style.borderRadius,
  };

  // Force export dimensions
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.aspectRatio = "unset";
  element.style.borderRadius = "0";

  // Wait for reflow
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  console.log("[export] reflow done, rendering...");

  const fn = format === "jpeg" ? htmlToImage.toJpeg : htmlToImage.toPng;

  try {
    const dataUrl = await fn(element, {
      width,
      height,
      pixelRatio,
      quality: format === "jpeg" ? quality : undefined,
      backgroundColor: "#0A0A0A",
    });

    console.log("[export] rendered, dataUrl length:", dataUrl.length);

    // Convert dataUrl to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    console.log("[export] blob size:", blob.size);

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("[export] download triggered");
    return blob;
  } finally {
    // Restore original styles
    element.style.width = orig.width;
    element.style.aspectRatio = orig.aspectRatio;
    element.style.height = orig.height;
    element.style.borderRadius = orig.borderRadius;
    console.log("[export] styles restored");
  }
}
