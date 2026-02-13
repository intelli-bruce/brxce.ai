"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useState, useCallback } from "react";

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

export default function GuideBody({ content }: { content: string }) {
  return (
    <div className="prose-dark">
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
    </div>
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
