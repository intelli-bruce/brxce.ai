#!/usr/bin/env node
/**
 * Convert .excalidraw JSON → dark-mode SVG
 * Uses Puppeteer + @excalidraw/excalidraw ESM from CDN
 * Usage: node scripts/excalidraw-to-svg.mjs input.excalidraw output.svg
 */
import { readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";

const [,, inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node excalidraw-to-svg.mjs input.excalidraw output.svg");
  process.exit(1);
}

const sceneJSON = readFileSync(inputPath, "utf-8");

const html = `<!DOCTYPE html>
<html><head>
<script type="module">
import { exportToSvg } from "https://esm.run/@excalidraw/excalidraw";

const data = ${sceneJSON};

const svg = await exportToSvg({
  elements: data.elements || [],
  appState: {
    exportWithDarkMode: true,
    exportBackground: true,
    viewBackgroundColor: "#0a0a0a",
  },
  files: data.files || null,
});

svg.removeAttribute("filter");
window.__SVG_RESULT__ = new XMLSerializer().serializeToString(svg);
document.title = "DONE";
</script>
</head><body></body></html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });

// Wait for title to change to "DONE"
await page.waitForFunction(() => document.title === "DONE", { timeout: 30000 });

const svgStr = await page.evaluate(() => window.__SVG_RESULT__);
await browser.close();

if (!svgStr) {
  console.error("❌ No SVG output");
  process.exit(1);
}

writeFileSync(outputPath, svgStr);
console.log(`✅ ${outputPath} (${(svgStr.length / 1024).toFixed(1)}KB)`);
