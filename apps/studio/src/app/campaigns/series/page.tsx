"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

interface Series {
  id: string;
  title: string;
  description: string | null;
  funnel_flow: any;
  created_at: string;
  campaign_count: number;
}

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const sb = createSupabaseBrowser();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: series } = await sb.from("campaign_series").select("*").order("created_at", { ascending: false });
    if (!series) return;

    const { data: campaigns } = await sb.from("campaigns").select("id, series_id").not("series_id", "is", null);
    const counts: Record<string, number> = {};
    (campaigns || []).forEach(c => {
      counts[c.series_id] = (counts[c.series_id] || 0) + 1;
    });

    setSeriesList(series.map(s => ({ ...s, campaign_count: counts[s.id] || 0 })));
  }

  async function handleCreate() {
    if (!form.title.trim()) return;
    await sb.from("campaign_series").insert({ title: form.title, description: form.description || null });
    setShowNew(false);
    setForm({ title: "", description: "" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("시리즈를 삭제하시겠습니까? (캠페인은 유지됩니다)")) return;
    await sb.from("campaign_series").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">시리즈</h1>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b]"
        >
          + 새 시리즈
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seriesList.map(s => (
          <div key={s.id} className="p-5 bg-[#141414] border border-[#222] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-[#fafafa]">📚 {s.title}</span>
              <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 bg-transparent border-none cursor-pointer hover:underline">삭제</button>
            </div>
            {s.description && <p className="text-sm text-[#888] mb-3">{s.description}</p>}
            <div className="flex items-center justify-between text-xs text-[#555]">
              <span>🚀 {s.campaign_count}개 캠페인</span>
              <span>{new Date(s.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
          </div>
        ))}
        {seriesList.length === 0 && (
          <div className="col-span-2 text-center py-12 text-[#555]">
            <p className="text-lg mb-2">📚</p>
            <p className="text-sm">시리즈가 없습니다</p>
            <p className="text-xs mt-1">관련 캠페인을 묶어 시리즈로 관리하세요</p>
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNew(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">새 시리즈</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-1.5">제목</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="에이전틱 워크플로우 시리즈" className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-1.5">설명</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none resize-y" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={!form.title.trim()} className="flex-1 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-medium border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50">생성</button>
                <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
