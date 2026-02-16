/**
 * Markdown → Block 파서
 * body_md를 주소 지정 가능한 블록으로 분해
 */

export interface ParsedBlock {
  block_type: "heading" | "paragraph" | "list" | "code" | "blockquote" | "image" | "divider";
  body: string;
  meta: Record<string, unknown>;
}

/**
 * Markdown 텍스트를 블록 배열로 파싱
 */
export function parseMarkdownToBlocks(md: string): ParsedBlock[] {
  if (!md?.trim()) return [];

  const lines = md.split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄 스킵
    if (!line.trim()) {
      i++;
      continue;
    }

    // --- divider
    if (/^---+\s*$/.test(line.trim())) {
      blocks.push({ block_type: "divider", body: "---", meta: {} });
      i++;
      continue;
    }

    // # heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        block_type: "heading",
        body: headingMatch[2],
        meta: { level: headingMatch[1].length },
      });
      i++;
      continue;
    }

    // ```code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        block_type: "code",
        body: codeLines.join("\n"),
        meta: { language: lang || undefined },
      });
      continue;
    }

    // > blockquote (collect consecutive)
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        block_type: "blockquote",
        body: quoteLines.join("\n"),
        meta: {},
      });
      continue;
    }

    // ![image](url)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({
        block_type: "image",
        body: imgMatch[2],
        meta: { alt: imgMatch[1] },
      });
      i++;
      continue;
    }

    // - / * / 1. list (collect consecutive)
    if (/^(\s*[-*+]|\s*\d+\.)\s/.test(line)) {
      const listLines: string[] = [];
      while (i < lines.length && (/^(\s*[-*+]|\s*\d+\.)\s/.test(lines[i]) || (lines[i].startsWith("  ") && listLines.length > 0))) {
        listLines.push(lines[i]);
        i++;
      }
      const ordered = /^\s*\d+\./.test(listLines[0]);
      blocks.push({
        block_type: "list",
        body: listLines.join("\n"),
        meta: { ordered },
      });
      continue;
    }

    // paragraph (collect until blank line or special line)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^---+\s*$/.test(lines[i].trim()) &&
      !lines[i].trim().match(/^!\[/) &&
      !/^(\s*[-*+]|\s*\d+\.)\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({
        block_type: "paragraph",
        body: paraLines.join("\n"),
        meta: {},
      });
    }
  }

  return blocks;
}

/**
 * 블록 배열 → Markdown 텍스트로 역변환
 */
export function blocksToMarkdown(blocks: { block_type: string; body: string; meta?: Record<string, unknown> }[]): string {
  return blocks
    .map((b) => {
      switch (b.block_type) {
        case "heading": {
          const level = (b.meta?.level as number) || 1;
          return "#".repeat(level) + " " + b.body;
        }
        case "paragraph":
          return b.body;
        case "list":
          return b.body;
        case "code": {
          const lang = (b.meta?.language as string) || "";
          return "```" + lang + "\n" + b.body + "\n```";
        }
        case "blockquote":
          return b.body
            .split("\n")
            .map((l) => "> " + l)
            .join("\n");
        case "image": {
          const alt = (b.meta?.alt as string) || "";
          return `![${alt}](${b.body})`;
        }
        case "divider":
          return "---";
        default:
          return b.body;
      }
    })
    .join("\n\n");
}
