"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";

const STATUSES = ["idea", "draft", "fact-check", "ready", "published"];
const MEDIA_TYPES = ["text", "image", "video", "carousel"];
const FUNNEL_STAGES = ["awareness", "interest", "trust", "conversion"];
const CASHFLOW_LINES = ["consulting", "course", "service", "community"];

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[가-힣]+/g, (m) => m.split("").join("-"))
    .replace(/[^a-z0-9가-힣-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "";
}

export default function NewContentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", status: "idea", category: "", hook: "", body_md: "",
    core_message: "", media_type: "", tags: "", funnel_stage: "", cashflow_line: "",
    cta: "", fact_checked: false, fact_check_notes: "",
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slug) next.slug = toSlug(value as string);
      return next;
    });
  }

  const inputClass = "w-full p-2.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const { data, error } = await sb.from("contents").insert({
      title: form.title,
      slug: form.slug || null,
      status: form.status,
      category: form.category || null,
      hook: form.hook || null,
      body_md: form.body_md || null,
      core_message: form.core_message || null,
      media_type: form.media_type || null,
      tags,
      funnel_stage: form.funnel_stage || null,
      cashflow_line: form.cashflow_line || null,
      cta: form.cta || null,
      fact_checked: form.fact_checked,
      fact_check_notes: form.fact_check_notes || null,
    }).select("id").single();
    setSaving(false);
    if (!error && data) router.push(`/admin/contents/${data.id}`);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">새 콘텐츠</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[#888] block mb-1">제목 *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Slug</label>
          <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} placeholder="자동 생성" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[#888] block mb-1">상태</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">카테고리</label>
            <input value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">미디어 타입</label>
            <select value={form.media_type} onChange={(e) => set("media_type", e.target.value)} className={inputClass}>
              <option value="">-</option>
              {MEDIA_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">퍼널 단계</label>
            <select value={form.funnel_stage} onChange={(e) => set("funnel_stage", e.target.value)} className={inputClass}>
              <option value="">-</option>
              {FUNNEL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">캐시플로우 라인</label>
            <select value={form.cashflow_line} onChange={(e) => set("cashflow_line", e.target.value)} className={inputClass}>
              <option value="">-</option>
              {CASHFLOW_LINES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#888] block mb-1">Hook</label>
          <input value={form.hook} onChange={(e) => set("hook", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Core Message</label>
          <textarea value={form.core_message} onChange={(e) => set("core_message", e.target.value)} className={`${inputClass} min-h-[80px]`} />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">CTA</label>
          <input value={form.cta} onChange={(e) => set("cta", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Tags (쉼표 구분)</label>
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputClass} placeholder="태그1, 태그2" />
        </div>

        {/* Body with preview */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <label className="text-xs text-[#888]">본문 (Markdown)</label>
            <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-[#666] hover:text-[#fafafa]">
              {preview ? "편집" : "프리뷰"}
            </button>
          </div>
          {preview ? (
            <div className="p-6 bg-[#111] border border-[#222] rounded-[10px] min-h-[300px] prose-dark">
              <Markdown>{form.body_md || "*내용 없음*"}</Markdown>
            </div>
          ) : (
            <textarea value={form.body_md} onChange={(e) => set("body_md", e.target.value)} className={`${inputClass} min-h-[300px] font-mono text-[13px]`} />
          )}
        </div>

        {/* Fact check */}
        <div className="flex items-center gap-4 p-4 bg-[#141414] border border-[#222] rounded-[10px]">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.fact_checked} onChange={(e) => set("fact_checked", e.target.checked)} className="accent-green-500" />
            팩트체크 완료
          </label>
          <input value={form.fact_check_notes} onChange={(e) => set("fact_check_notes", e.target.value)} placeholder="팩트체크 메모" className={`${inputClass} flex-1`} />
        </div>

        <button type="submit" disabled={saving} className="px-6 py-3 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50 self-start">
          {saving ? "생성 중..." : "생성"}
        </button>
      </form>
    </div>
  );
}
