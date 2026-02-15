"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

const ExcalidrawViewer = dynamic(() => import("./ExcalidrawViewer"), {
  ssr: false,
  loading: () => (
    <div className="my-6 rounded-xl border border-[#222] bg-[#0a0a0a] h-[450px] flex items-center justify-center text-[#555] text-sm">
      다이어그램 로딩 중…
    </div>
  ),
});

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555] cursor-pointer transition-colors"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

const EXCALIDRAW_RE = /^::excalidraw\[(.+?)\]$/;

export default function GuideBody({ content }: { content: string }) {
  const segments = useMemo(() => {
    const lines = content.split("\n");
    const result: { type: "md" | "excalidraw"; value: string }[] = [];
    let mdBuf: string[] = [];

    const flushMd = () => {
      if (mdBuf.length) {
        result.push({ type: "md", value: mdBuf.join("\n") });
        mdBuf = [];
      }
    };

    for (const line of lines) {
      const m = line.trim().match(EXCALIDRAW_RE);
      if (m) {
        flushMd();
        result.push({ type: "excalidraw", value: m[1] });
      } else {
        mdBuf.push(line);
      }
    }
    flushMd();
    return result;
  }, [content]);

  return (
    <div className="prose-dark">
      {segments.map((seg, i) =>
        seg.type === "excalidraw" ? (
          <ExcalidrawViewer key={i} src={seg.value} />
        ) : (
          <MarkdownBlock key={i} content={seg.value} />
        )
      )}
    </div>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children, ...props }) => {
            const text = extractText(children);
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, "")
              .replace(/\s+/g, "-");
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = extractText(children);
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, "")
              .replace(/\s+/g, "-");
            return <h3 id={id} {...props}>{children}</h3>;
          },
          pre: ({ children, ...props }) => {
            const code = extractCodeFromPre(children);
            return (
              <div className="relative">
                <CopyButton code={code} />
                <pre {...props}>{children}</pre>
              </div>
            );
          },
        }}
      >
        {content}
      </Markdown>
  );
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function extractCodeFromPre(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (children && typeof children === "object" && "props" in children) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}
