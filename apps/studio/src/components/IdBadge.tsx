"use client";

import { useState } from "react";

/**
 * Clickable ID badge — shows first 8 chars of UUID, copies full ID on click.
 * Usage: <IdBadge id={campaign.id} />
 */
export default function IdBadge({ id, prefix }: { id: string; prefix?: string }) {
  const [copied, setCopied] = useState(false);
  const short = id.substring(0, 8);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(id);
    } else {
      // fallback for non-secure contexts (HTTP localhost)
      const ta = document.createElement("textarea");
      ta.value = id;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      title={`${id}\n클릭하여 복사`}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#333] text-[10px] font-mono text-[#555] hover:text-[#888] hover:border-[#555] cursor-pointer transition-colors"
    >
      {prefix && <span className="text-[#444]">{prefix}</span>}
      <span>{copied ? "✓ copied" : short}</span>
    </button>
  );
}
