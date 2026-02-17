"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { parseMarkdownToBlocks, blocksToMarkdown } from "@/lib/block-parser";
import Markdown from "react-markdown";
import { ProseBody } from "@brxce/ui";

/* ─── types ─── */
interface Block {
  id: string;
  content_id: string;
  block_type: string;
  body: string;
  position: number;
  current_version: number;
  meta: Record<string, unknown>;
}

interface Revision {
  id: string;
  block_id: string;
  version: number;
  body: string;
  trigger: string | null;
  actor: string;
  created_at: string;
}

interface Props {
  contentId: string;
  bodyMd: string;
  onBodySync?: (md: string) => void;
}

const BLOCK_ICONS: Record<string, string> = {
  heading: "H",
  paragraph: "¶",
  list: "☰",
  code: "</>",
  blockquote: "❝",
  image: "🖼",
  divider: "—",
};

/* ─── component ─── */
export default function BlockEditor({ contentId, bodyMd, onBodySync }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [revisions, setRevisions] = useState<Record<string, Revision[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [showRevisions, setShowRevisions] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState<number | null>(null);
  const [aiTask, setAiTask] = useState<{ blockIndex: number; task: string } | null>(null);

  const sb = createSupabaseBrowser();

  /* ─── load blocks from DB ─── */
  const loadBlocks = useCallback(async () => {
    const { data } = await sb
      .from("content_blocks")
      .select("*")
      .eq("content_id", contentId)
      .order("position");
    if (data?.length) {
      setBlocks(data);
    }
    setLoading(false);
  }, [contentId]);

  /* ─── initial parse or load ─── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Check if blocks exist
      const { count } = await sb
        .from("content_blocks")
        .select("*", { count: "exact", head: true })
        .eq("content_id", contentId);

      if (cancelled) return;

      if (count && count > 0) {
        // Load existing blocks, then check if body_md has diverged
        const { data: existingBlocks } = await sb
          .from("content_blocks")
          .select("*")
          .eq("content_id", contentId)
          .order("position");
        if (cancelled) return;
        if (existingBlocks?.length) {
          const blocksMarkdown = blocksToMarkdown(existingBlocks.map(b => ({
            block_type: b.block_type, body: b.body, meta: b.meta,
          })));
          // If body_md changed externally, re-parse
          if (bodyMd?.trim() && blocksMarkdown.trim() !== bodyMd.trim()) {
            await sb.from("content_blocks").delete().eq("content_id", contentId);
            await initializeBlocks(bodyMd);
          } else {
            setBlocks(existingBlocks);
            setLoading(false);
          }
        }
      } else if (bodyMd?.trim()) {
        // First time: parse markdown into blocks
        await initializeBlocks(bodyMd);
      } else {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contentId]);

  /* ─── parse & save blocks for first time ─── */
  async function initializeBlocks(md: string) {
    // Double-check to prevent React strict mode duplication
    const { count: recheck } = await sb
      .from("content_blocks")
      .select("*", { count: "exact", head: true })
      .eq("content_id", contentId);
    if (recheck && recheck > 0) {
      await loadBlocks();
      return;
    }

    const parsed = parseMarkdownToBlocks(md);
    const rows = parsed.map((p, i) => ({
      content_id: contentId,
      block_type: p.block_type,
      body: p.body,
      position: (i + 1) * 10,
      current_version: 1,
      meta: p.meta,
    }));

    const { data } = await sb.from("content_blocks").insert(rows).select();
    if (data) {
      // Create initial revisions
      const revRows = data.map((b) => ({
        block_id: b.id,
        version: 1,
        body: b.body,
        trigger: "초기 파싱",
        actor: "system",
      }));
      await sb.from("block_revisions").insert(revRows);
      setBlocks(data);
    }
    setLoading(false);
  }

  /* ─── load revisions for a block ─── */
  async function loadRevisions(blockId: string) {
    const { data } = await sb
      .from("block_revisions")
      .select("*")
      .eq("block_id", blockId)
      .order("version", { ascending: false });
    if (data) {
      setRevisions((prev) => ({ ...prev, [blockId]: data }));
    }
  }

  /* ─── save block edit ─── */
  async function saveBlockEdit(block: Block) {
    if (editText === block.body) {
      setEditingBlock(null);
      return;
    }

    const newVersion = block.current_version + 1;

    // Update block
    await sb
      .from("content_blocks")
      .update({ body: editText, current_version: newVersion, updated_at: new Date().toISOString() })
      .eq("id", block.id);

    // Add revision
    await sb.from("block_revisions").insert({
      block_id: block.id,
      version: newVersion,
      body: editText,
      trigger: commentTexts[block.id] || "수동 편집",
      actor: "user",
    });

    setEditingBlock(null);
    setCommentTexts(prev => { const next = { ...prev }; delete next[block.id]; return next; });
    await loadBlocks();
    syncBodyMd();
  }

  /* ─── restore revision ─── */
  async function restoreRevision(block: Block, rev: Revision) {
    const newVersion = block.current_version + 1;

    await sb
      .from("content_blocks")
      .update({ body: rev.body, current_version: newVersion })
      .eq("id", block.id);

    await sb.from("block_revisions").insert({
      block_id: block.id,
      version: newVersion,
      body: rev.body,
      trigger: `v${rev.version}로 롤백`,
      actor: "user",
    });

    setShowRevisions(null);
    await loadBlocks();
    syncBodyMd();
  }

  /* ─── add block after ─── */
  const [insertMenu, setInsertMenu] = useState<string | null>(null);

  const BLOCK_TYPES = [
    { type: "paragraph", label: "텍스트", icon: "¶", defaultBody: "" },
    { type: "heading", label: "제목", icon: "H", defaultBody: "", meta: { level: 2 } },
    { type: "list", label: "리스트", icon: "☰", defaultBody: "- " },
    { type: "blockquote", label: "인용", icon: "❝", defaultBody: "" },
    { type: "image", label: "이미지", icon: "🖼", defaultBody: "" },
    { type: "divider", label: "구분선", icon: "—", defaultBody: "---" },
    { type: "code", label: "코드", icon: "</>", defaultBody: "" },
  ] as const;

  async function addBlockAfter(afterBlock: Block, blockType = "paragraph", meta: Record<string, unknown> = {}) {
    const newPos = afterBlock.position + 5;
    const template = BLOCK_TYPES.find(t => t.type === blockType);
    const defaultBody = template?.defaultBody ?? "";
    const blockMeta = { ...meta, ...(template && "meta" in template ? template.meta : {}) };
    const isImmediate = blockType === "divider";

    const { data } = await sb
      .from("content_blocks")
      .insert({
        content_id: contentId,
        block_type: blockType,
        body: isImmediate ? "---" : defaultBody,
        position: newPos,
        current_version: 1,
        meta: blockMeta,
      })
      .select()
      .single();

    if (data) {
      await sb.from("block_revisions").insert({
        block_id: data.id,
        version: 1,
        body: data.body,
        trigger: "블록 추가",
        actor: "user",
      });
      await loadBlocks();
      if (!isImmediate) {
        setEditingBlock(data.id);
        setEditText(data.body);
      } else {
        syncBodyMd();
      }
    }
    setInsertMenu(null);
  }

  /* ─── delete block ─── */
  async function deleteBlock(blockId: string) {
    if (!confirm("이 블록을 삭제하시겠습니까?")) return;
    await sb.from("content_blocks").delete().eq("id", blockId);
    await loadBlocks();
    syncBodyMd();
  }

  /* ─── sync blocks → body_md ─── */
  async function syncBodyMd() {
    const { data } = await sb
      .from("content_blocks")
      .select("block_type, body, meta")
      .eq("content_id", contentId)
      .order("position");
    if (data) {
      const md = blocksToMarkdown(data);
      await sb.from("contents").update({ body_md: md }).eq("id", contentId);
      onBodySync?.(md);
    }
  }

  /* ─── create snapshot ─── */
  async function createSnapshot(label: string) {
    const blocksData = blocks.map((b) => ({
      id: b.id,
      block_type: b.block_type,
      body: b.body,
      position: b.position,
      meta: b.meta,
      current_version: b.current_version,
    }));

    await sb.from("document_snapshots").insert({
      content_id: contentId,
      label,
      blocks: blocksData,
    });

    alert(`스냅샷 "${label}" 저장 완료`);
  }

  /* ─── block label (B1, B2...) ─── */
  function blockLabel(index: number) {
    return `B${index + 1}`;
  }

  if (loading) return <div className="text-[#888] py-8">블록 로딩 중...</div>;

  if (!blocks.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888] mb-4">블록이 없습니다.</p>
        {bodyMd?.trim() && (
          <button
            onClick={() => initializeBlocks(bodyMd)}
            className="px-4 py-2 rounded-[10px] bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a2a]"
          >
            본문을 블록으로 파싱
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#888]">{blocks.length}개 블록</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const label = prompt("스냅샷 이름", `스냅샷 ${new Date().toLocaleDateString("ko-KR")}`);
              if (label) createSnapshot(label);
            }}
            className="px-3 py-1.5 rounded-[10px] border border-[#333] text-xs text-[#888] hover:text-[#fafafa] hover:border-[#555]"
          >
            📸 스냅샷
          </button>
          <button
            onClick={syncBodyMd}
            className="px-3 py-1.5 rounded-[10px] border border-[#333] text-xs text-[#888] hover:text-[#fafafa] hover:border-[#555]"
          >
            🔄 body_md 동기화
          </button>
        </div>
      </div>

      {/* Blocks */}
      <div className="flex flex-col gap-0">
        {blocks.map((block, idx) => {
          const isActive = activeBlock === block.id;
          const isEditing = editingBlock === block.id;
          const hasRevisions = showRevisions === block.id;
          const isAiInput = showAiInput === block.id;
          const blockRevs = revisions[block.id] || [];

          return (
            <div key={block.id}>
              <div
                className={`group relative flex gap-1 rounded-lg border transition-colors ${
                  isActive
                    ? "border-[#FF6B35]/30 bg-[#FF6B35]/5"
                    : "border-transparent hover:border-[#222]"
                }`}
                onClick={() => { setActiveBlock(block.id); setInsertMenu(null); }}
              >
                {/* Block label */}
                <div className="flex-shrink-0 w-8 pt-1 pl-1 text-center">
                  <span className="text-[9px] font-mono text-[#444] group-hover:text-[#888] leading-none">
                    {blockLabel(idx)}
                  </span>
                </div>

                {/* Block content */}
                <div className="flex-1 py-0.5 pr-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      {block.block_type === "image" ? (
                        <div className="space-y-2">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="이미지 URL (https://...)"
                            className="w-full p-2.5 rounded-lg border border-[#444] bg-[#0a0a0a] text-sm text-[#fafafa] font-mono outline-none focus:border-[#FF6B35]"
                            autoFocus
                          />
                          {editText && (
                            <img src={editText} alt="미리보기" className="max-h-48 rounded-lg border border-[#222]" />
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-[#444] bg-[#0a0a0a] text-sm text-[#fafafa] font-mono outline-none focus:border-[#FF6B35] min-h-[80px] resize-y"
                          autoFocus
                        />
                      )}
                      <input
                        value={commentTexts[block.id] || ""}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [block.id]: e.target.value }))}
                        placeholder="변경 사유 (선택)"
                        className="w-full p-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-xs text-[#ccc] outline-none focus:border-[#555]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveBlockEdit(block)}
                          className="px-3 py-1 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold hover:bg-[#e55a2a]"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingBlock(null)}
                          className="px-3 py-1 rounded-lg border border-[#333] text-xs text-[#888] hover:text-[#fafafa]"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onDoubleClick={() => {
                        setEditingBlock(block.id);
                        setEditText(block.body);
                      }}
                    >
                      {block.block_type === "divider" ? (
                        <hr className="border-[#333] my-2" />
                      ) : block.block_type === "code" ? (
                        <pre className="text-xs text-[#ccc] bg-[#0a0a0a] p-2 rounded-lg overflow-x-auto font-mono">
                          <code>{block.body}</code>
                        </pre>
                      ) : block.block_type === "image" ? (
                        <img src={block.body} alt={(block.meta?.alt as string) || ""} className="max-h-48 rounded-lg" />
                      ) : (
                        <ProseBody
                          content={
                            block.block_type === "heading"
                              ? "#".repeat((block.meta?.level as number) || 1) + " " + block.body
                              : block.block_type === "blockquote"
                                ? block.body.split("\n").map((l) => "> " + l).join("\n")
                                : block.block_type === "list"
                                  ? block.body
                                  : block.body.replace(/\n/g, "  \n")
                          }
                          className="max-w-none [&>*]:my-0 [&>*]:py-0"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Side actions */}
                {isActive && !isEditing && (
                  <div className="flex-shrink-0 flex flex-row items-center gap-0.5 pr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBlock(block.id);
                        setEditText(block.body);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555]"
                      title="편집"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAiInput(isAiInput ? null : block.id);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-[#333] text-[#888] hover:text-[#FF6B35] hover:border-[#FF6B35]"
                      title="AI 수정"
                    >
                      ✨
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setShowRevisions(hasRevisions ? null : block.id);
                        if (!hasRevisions) await loadRevisions(block.id);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555]"
                      title={`v${block.current_version} 히스토리`}
                    >
                      v{block.current_version}
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsertMenu(insertMenu === block.id ? null : block.id);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555]"
                        title="아래에 블록 추가"
                      >
                        ＋
                      </button>
                      {insertMenu === block.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl py-1 min-w-[140px]">
                          {BLOCK_TYPES.map(bt => (
                            <button
                              key={bt.type}
                              onClick={(e) => {
                                e.stopPropagation();
                                addBlockAfter(block, bt.type);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#252525] hover:text-[#fafafa] flex items-center gap-2 bg-transparent border-none cursor-pointer"
                            >
                              <span className="w-4 text-center">{bt.icon}</span>
                              {bt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-red-800 text-red-400 hover:bg-red-900/30"
                      title="삭제"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              {/* AI Input */}
              {isAiInput && (
                <div className="ml-14 mr-2 mt-1 mb-2 p-3 rounded-[10px] border border-[#FF6B35]/30 bg-[#FF6B35]/5">
                  <div className="flex gap-2">
                    <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="수정 지시 입력... (예: 더 구체적으로, 예시 추가)"
                      className="flex-1 p-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#FF6B35]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setShowAiInput(null);
                      }}
                    />
                    <button
                      onClick={async () => {
                        const prompt = aiPrompt;
                        setShowAiInput(null);
                        setAiPrompt("");
                        setAiGenerating(idx);
                        try {
                          const res = await fetch("/api/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              type: "block",
                              content_id: contentId,
                              block_index: idx,
                              block_prompt: prompt,
                            }),
                          });
                          const data = await res.json();
                          if (data.ok && data.task) {
                            // Task built — show confirmation
                            setAiTask({ blockIndex: idx, task: data.task });
                          }
                        } catch (e) {
                          console.error("Generation failed:", e);
                        } finally {
                          setAiGenerating(null);
                        }
                      }}
                      disabled={aiGenerating === idx}
                      className="px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold hover:bg-[#e55a2a] disabled:opacity-50"
                    >
                      {aiGenerating === idx ? "⏳" : "생성"}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#888] mt-1.5">
                    블록 {blockLabel(idx)} ({block.block_type}) · 현재 {block.body.length}자
                  </p>
                </div>
              )}

              {/* Revisions */}
              {hasRevisions && (
                <div className="ml-14 mr-2 mt-1 mb-2 p-3 rounded-[10px] border border-[#333] bg-[#111]">
                  <div className="text-xs text-[#888] mb-2 font-semibold">
                    📜 {blockLabel(idx)} 히스토리 ({blockRevs.length}개 버전)
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                    {blockRevs.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-2 rounded-lg border text-xs ${
                          rev.version === block.current_version
                            ? "border-[#FF6B35]/40 bg-[#FF6B35]/5"
                            : "border-[#222] hover:border-[#444]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[#ccc]">
                            v{rev.version}
                            {rev.version === block.current_version && (
                              <span className="ml-1 text-[#FF6B35]">현재</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666]">
                              {rev.actor} · {new Date(rev.created_at).toLocaleString("ko-KR")}
                            </span>
                            {rev.version !== block.current_version && (
                              <button
                                onClick={() => restoreRevision(block, rev)}
                                className="px-1.5 py-0.5 rounded border border-[#444] text-[#888] hover:text-[#fafafa] hover:border-[#666]"
                              >
                                복원
                              </button>
                            )}
                          </div>
                        </div>
                        {rev.trigger && (
                          <div className="text-[#888] mb-1">💬 {rev.trigger}</div>
                        )}
                        <div className="text-[#ccc] line-clamp-2 whitespace-pre-wrap">{rev.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Task Panel */}
      {aiTask && (
        <div className="mt-4 p-4 rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[#FF6B35]">✨ AI 생성 태스크 (B{aiTask.blockIndex + 1})</h4>
            <button onClick={() => setAiTask(null)} className="text-[#888] hover:text-[#fafafa] text-xs">✕</button>
          </div>
          <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-[#1a1a1a] max-h-[200px] overflow-y-auto whitespace-pre-wrap">
            {aiTask.task}
          </pre>
          <p className="text-[10px] text-[#666] mt-2">
            OpenClaw 서브에이전트로 전달하여 생성합니다. 결과는 블록에 자동 반영됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
