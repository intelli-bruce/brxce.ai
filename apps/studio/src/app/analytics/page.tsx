"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import CostDashboard from "@/components/campaign/CostDashboard";

interface MetricRow {
  id: string;
  atom_id: string;
  channel: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  conversions: number;
  engagement_rate: number | null;
  source: string;
  recorded_at: string;
  campaign_title?: string;
}

interface ChannelSummary {
  channel: string;
  total_impressions: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_clicks: number;
  total_conversions: number;
  avg_engagement: number;
  count: number;
}

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", newsletter: "📧", brxce_guide: "🦞",
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [summaries, setSummaries] = useState<ChannelSummary[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    atom_id: "", channel: "threads", impressions: 0, likes: 0,
    comments: 0, shares: 0, clicks: 0, conversions: 0,
  });
  const sb = createSupabaseBrowser();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await sb.from("campaign_metrics")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(100);

    const rows = (data || []) as MetricRow[];
    setMetrics(rows);

    // Build channel summaries
    const map: Record<string, ChannelSummary> = {};
    rows.forEach(r => {
      if (!map[r.channel]) {
        map[r.channel] = { channel: r.channel, total_impressions: 0, total_likes: 0, total_comments: 0, total_shares: 0, total_clicks: 0, total_conversions: 0, avg_engagement: 0, count: 0 };
      }
      const s = map[r.channel];
      s.total_impressions += r.impressions;
      s.total_likes += r.likes;
      s.total_comments += r.comments;
      s.total_shares += r.shares;
      s.total_clicks += r.clicks;
      s.total_conversions += r.conversions;
      if (r.engagement_rate) { s.avg_engagement += r.engagement_rate; s.count++; }
    });
    Object.values(map).forEach(s => { if (s.count) s.avg_engagement /= s.count; });
    setSummaries(Object.values(map).sort((a, b) => b.total_impressions - a.total_impressions));
  }

  async function handleAdd() {
    if (!addForm.atom_id) return;
    await sb.from("campaign_metrics").insert({
      atom_id: addForm.atom_id,
      channel: addForm.channel,
      impressions: addForm.impressions,
      likes: addForm.likes,
      comments: addForm.comments,
      shares: addForm.shares,
      clicks: addForm.clicks,
      conversions: addForm.conversions,
      engagement_rate: addForm.impressions > 0
        ? ((addForm.likes + addForm.comments + addForm.shares) / addForm.impressions) * 100
        : 0,
      source: "manual",
    });
    setShowAdd(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">성과</h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b]">
          + 수동 입력
        </button>
      </div>

      {/* Channel summary cards */}
      {summaries.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {summaries.map(s => (
              <div key={s.channel} className="p-4 bg-[#141414] border border-[#222] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{CHANNEL_ICONS[s.channel]}</span>
                  <span className="text-sm font-medium">{s.channel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[#888]">노출 </span><span className="text-[#fafafa]">{s.total_impressions.toLocaleString()}</span></div>
                  <div><span className="text-[#888]">좋아요 </span><span className="text-[#fafafa]">{s.total_likes.toLocaleString()}</span></div>
                  <div><span className="text-[#888]">댓글 </span><span className="text-[#fafafa]">{s.total_comments.toLocaleString()}</span></div>
                  <div><span className="text-[#888]">클릭 </span><span className="text-[#fafafa]">{s.total_clicks.toLocaleString()}</span></div>
                </div>
                {s.avg_engagement > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-[#888]">참여율 </span>
                    <span className="text-[#4ECDC4] font-medium">{s.avg_engagement.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recent metrics table */}
          <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] text-sm font-medium">최근 기록</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#222] text-[#888]">
                    <th className="px-4 py-2 text-left">채널</th>
                    <th className="px-4 py-2 text-right">노출</th>
                    <th className="px-4 py-2 text-right">좋아요</th>
                    <th className="px-4 py-2 text-right">댓글</th>
                    <th className="px-4 py-2 text-right">클릭</th>
                    <th className="px-4 py-2 text-right">참여율</th>
                    <th className="px-4 py-2 text-right">소스</th>
                    <th className="px-4 py-2 text-right">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 20).map(m => (
                    <tr key={m.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <td className="px-4 py-2">{CHANNEL_ICONS[m.channel]} {m.channel}</td>
                      <td className="px-4 py-2 text-right">{m.impressions.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{m.likes}</td>
                      <td className="px-4 py-2 text-right">{m.comments}</td>
                      <td className="px-4 py-2 text-right">{m.clicks}</td>
                      <td className="px-4 py-2 text-right text-[#4ECDC4]">{m.engagement_rate?.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right text-[#888]">{m.source}</td>
                      <td className="px-4 py-2 text-right text-[#888]">{new Date(m.recorded_at).toLocaleDateString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-[#555]">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="text-lg">성과 데이터가 없습니다</p>
          <p className="text-sm mt-2">발행 후 수동으로 입력하거나 API에서 자동 수집됩니다</p>
        </div>
      )}

      {/* Cost dashboard */}
      <CostDashboard />

      {/* Manual input modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-[420px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">성과 수동 입력</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-[#888] mb-1">콘텐츠 ID</label>
                <input value={addForm.atom_id} onChange={e => setAddForm(p => ({ ...p, atom_id: e.target.value }))} placeholder="atom UUID" className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#888] mb-1">채널</label>
                <select value={addForm.channel} onChange={e => setAddForm(p => ({ ...p, channel: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
                  {Object.entries(CHANNEL_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["impressions", "likes", "comments", "shares", "clicks", "conversions"] as const).map(key => (
                  <div key={key}>
                    <label className="block text-[10px] text-[#888] mb-1">{key}</label>
                    <input type="number" value={(addForm as any)[key]} onChange={e => setAddForm(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-1.5 rounded border border-[#333] bg-[#0a0a0a] text-xs text-[#fafafa] outline-none" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={handleAdd} disabled={!addForm.atom_id} className="flex-1 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50">저장</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
