"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Publication {
  id: string;
  channel: string;
  url: string | null;
  published_at: string | null;
  content_id: string;
  contents: { title: string } | null;
}

interface ContentOption {
  id: string;
  title: string;
}

const CHANNELS = ["threads", "x", "linkedin", "instagram", "youtube", "brxce-guide", "blog-naver", "blog-medium", "blog-brunch", "newsletter"];

export default function PublicationsPage() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [contents, setContents] = useState<ContentOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content_id: "", channel: "threads", url: "", published_at: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const sb = createSupabaseBrowser();
    const [{ data: p }, { data: c }] = await Promise.all([
      sb.from("publications").select("id, channel, url, published_at, content_id, contents(title)").order("published_at", { ascending: false }),
      sb.from("contents").select("id, title").order("created_at", { ascending: false }),
    ]);
    setPubs((p as unknown as Publication[]) || []);
    setContents(c || []);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content_id) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    await sb.from("publications").insert({
      content_id: form.content_id,
      channel: form.channel,
      url: form.url || null,
      published_at: form.published_at || new Date().toISOString(),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ content_id: "", channel: "threads", url: "", published_at: "" });
    load();
  }

  const inputClass = "w-full p-2.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">발행 현황</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0]">
          {showForm ? "취소" : "+ 발행 기록"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-5 bg-[#141414] border border-[#222] rounded-[10px] mb-6 flex flex-col gap-3">
          <div>
            <label className="text-xs text-[#888] block mb-1">콘텐츠 *</label>
            <select value={form.content_id} onChange={(e) => setForm({ ...form, content_id: e.target.value })} className={inputClass} required>
              <option value="">선택...</option>
              {contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#888] block mb-1">채널</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={inputClass}>
                {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] block mb-1">발행일시</label>
              <input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">URL</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50 self-start">
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {pubs.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-[10px]">
            <div>
              <div className="text-sm text-[#fafafa] font-medium">{p.contents?.title || p.content_id}</div>
              <div className="text-xs text-[#666] mt-1">
                {p.channel} · {p.published_at ? new Date(p.published_at).toLocaleString("ko-KR") : "미발행"}
              </div>
            </div>
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener" className="text-xs text-[#8ab4f8] no-underline hover:underline">링크</a>
            )}
          </div>
        ))}
        {pubs.length === 0 && <p className="text-sm text-[#666]">발행 기록이 없습니다.</p>}
      </div>
    </div>
  );
}
