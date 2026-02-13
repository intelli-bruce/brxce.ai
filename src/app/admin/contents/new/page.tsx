"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function NewContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("idea");
  const [category, setCategory] = useState("");
  const [hook, setHook] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full p-2.5 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    const { data, error } = await sb.from("contents").insert({
      title,
      slug: slug || null,
      status,
      category: category || null,
      hook: hook || null,
      body_md: bodyMd || null,
    }).select("id").single();
    setSaving(false);
    if (!error && data) {
      router.push(`/admin/contents/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">새 콘텐츠</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[#888] block mb-1">제목 *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="자동 생성됨" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#888] block mb-1">상태</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {["idea", "draft", "fact-check", "ready", "published"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">카테고리</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Hook</label>
          <input value={hook} onChange={(e) => setHook(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">본문 (Markdown)</label>
          <textarea value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} className={`${inputClass} min-h-[300px] font-mono text-[13px]`} />
        </div>
        <button type="submit" disabled={saving} className="px-6 py-3 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50 self-start">
          {saving ? "생성 중..." : "생성"}
        </button>
      </form>
    </div>
  );
}
