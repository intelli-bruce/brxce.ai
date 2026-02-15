"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Content {
  id: string;
  title: string;
}

interface Variant {
  id: string;
  content_id: string;
  version_label: string;
  body_md: string;
  tone: string | null;
  angle: string | null;
  is_selected: boolean;
  created_at: string;
}

export default function ShowcasePage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ version_label: "", body_md: "", tone: "", angle: "" });
  const [loading, setLoading] = useState(false);

  const sb = createSupabaseBrowser();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load draft contents
  useEffect(() => {
    sb.from("contents")
      .select("id, title")
      .in("status", ["draft", "idea", "fact-check", "ready"])
      .order("created_at", { ascending: false })
      .then(({ data }) => setContents(data || []));
  }, []);

  // Load variants for selected content
  const loadVariants = useCallback(async () => {
    if (!selectedContentId) { setVariants([]); return; }
    const { data } = await sb
      .from("content_variants")
      .select("*")
      .eq("content_id", selectedContentId)
      .order("created_at", { ascending: true });
    setVariants(data || []);
  }, [selectedContentId]);

  useEffect(() => { loadVariants(); }, [loadVariants]);

  const handleSelect = async (variant: Variant) => {
    setLoading(true);
    // Update content body_md
    await sb.from("contents").update({ body_md: variant.body_md }).eq("id", variant.content_id);
    // Reset all variants
    await sb.from("content_variants").update({ is_selected: false }).eq("content_id", variant.content_id);
    // Mark selected
    await sb.from("content_variants").update({ is_selected: true }).eq("id", variant.id);
    await loadVariants();
    setLoading(false);
    showToast(`✅ ${variant.version_label}가 본문으로 반영되었습니다`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 버전을 삭제하시겠습니까?")) return;
    await sb.from("content_variants").delete().eq("id", id);
    await loadVariants();
    showToast("🗑️ 삭제되었습니다");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId || !form.version_label || !form.body_md) return;
    setLoading(true);
    await sb.from("content_variants").insert({
      content_id: selectedContentId,
      version_label: form.version_label,
      body_md: form.body_md,
      tone: form.tone || null,
      angle: form.angle || null,
    });
    setForm({ version_label: "", body_md: "", tone: "", angle: "" });
    setShowForm(false);
    await loadVariants();
    setLoading(false);
    showToast("➕ 버전이 추가되었습니다");
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#333] text-sm text-[#fafafa] shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎨 쇼케이스</h1>
      </div>

      {/* Content selector */}
      <div className="mb-6">
        <select
          value={selectedContentId}
          onChange={(e) => setSelectedContentId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] w-full max-w-md"
        >
          <option value="">콘텐츠를 선택하세요...</option>
          {contents.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Variants grid */}
      {selectedContentId && (
        <>
          {variants.length === 0 ? (
            <p className="text-[#666] text-sm mb-6">아직 버전이 없습니다. 아래에서 추가하세요.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className={`relative p-5 rounded-[14px] border transition-colors ${
                    v.is_selected
                      ? "bg-[#111] border-[#6c7bff]"
                      : "bg-[#111] border-[#222] hover:border-[#444]"
                  }`}
                >
                  {v.is_selected && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-[#6c7bff]/20 text-[#6c7bff]">
                      ✓ 확정됨
                    </span>
                  )}
                  <h3 className="text-base font-semibold mb-2">{v.version_label}</h3>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {v.tone && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#6c7bff]">
                        {v.tone}
                      </span>
                    )}
                    {v.angle && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2e1a] text-[#66cc66]">
                        {v.angle}
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mb-4 text-sm text-[#ccc] prose prose-invert prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{v.body_md}</Markdown>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelect(v)}
                      disabled={loading || v.is_selected}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#fafafa] text-[#0a0a0a] hover:bg-[#e0e0e0] disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    >
                      이걸로 확정
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-transparent border border-[#333] text-[#888] hover:text-red-400 hover:border-red-400/50 cursor-pointer"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-xl border border-dashed border-[#333] text-sm text-[#888] hover:text-[#fafafa] hover:border-[#555] bg-transparent cursor-pointer w-full"
            >
              + 버전 추가
            </button>
          ) : (
            <form onSubmit={handleAdd} className="p-5 rounded-[14px] border border-[#222] bg-[#111] space-y-4">
              <h3 className="text-base font-semibold">새 버전 추가</h3>
              <input
                type="text"
                placeholder="버전 라벨 (예: 버전 A — 도발형)"
                value={form.version_label}
                onChange={(e) => setForm({ ...form, version_label: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="톤 (예: 도발적)"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
                />
                <input
                  type="text"
                  placeholder="앵글 (예: 반전)"
                  value={form.angle}
                  onChange={(e) => setForm({ ...form, angle: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
                />
              </div>
              <textarea
                placeholder="마크다운 본문"
                value={form.body_md}
                onChange={(e) => setForm({ ...form, body_md: e.target.value })}
                required
                rows={10}
                className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-y font-mono"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#fafafa] text-[#0a0a0a] hover:bg-[#e0e0e0] cursor-pointer disabled:opacity-40"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-transparent border border-[#333] text-[#888] hover:text-[#fafafa] cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
