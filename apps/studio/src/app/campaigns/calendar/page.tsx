"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

const CHANNEL_COLORS: Record<string, string> = {
  threads: "bg-purple-500", x: "bg-blue-500", linkedin: "bg-sky-600",
  instagram: "bg-pink-500", youtube: "bg-red-500", newsletter: "bg-amber-500", brxce_guide: "bg-[#FF6B35]",
};

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", newsletter: "📧", brxce_guide: "🦞",
};

interface CalendarAtom {
  id: string;
  channel: string;
  status: string;
  format: string;
  scheduled_at: string | null;
  published_at: string | null;
  campaign_id: string;
  campaign_title?: string;
}

type ViewType = "month" | "week";

export default function CalendarPage() {
  const [date, setDate] = useState(() => new Date());
  const [atoms, setAtoms] = useState<CalendarAtom[]>([]);
  const [viewType, setViewType] = useState<ViewType>("month");
  const [funnelRatio, setFunnelRatio] = useState({ tofu: 0, mofu: 0, bofu: 0, total: 0 });
  const sb = createSupabaseBrowser();
  const year = date.getFullYear();
  const month = date.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    // Load atoms with campaign info
    Promise.all([
      sb.from("campaign_atoms")
        .select("id, channel, status, format, scheduled_at, published_at, campaign_id")
        .or(`scheduled_at.gte.${start},published_at.gte.${start}`)
        .in("status", ["scheduled", "published", "approved"]),
      sb.from("campaigns")
        .select("id, title, funnel_stage"),
    ]).then(([{ data: atomsData }, { data: campaigns }]) => {
      const campMap: Record<string, { title: string; funnel: string }> = {};
      (campaigns || []).forEach(c => { campMap[c.id] = { title: c.title, funnel: c.funnel_stage }; });

      const enriched = (atomsData || []).map(a => ({
        ...a,
        campaign_title: campMap[a.campaign_id]?.title,
      })) as CalendarAtom[];
      setAtoms(enriched);

      // Funnel ratio
      const stages = { tofu: 0, mofu: 0, bofu: 0 };
      (campaigns || []).forEach(c => {
        if (c.funnel_stage in stages) (stages as any)[c.funnel_stage]++;
      });
      const total = Object.values(stages).reduce((a, b) => a + b, 0) || 1;
      setFunnelRatio({ ...stages, total });
    });
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const atomsByDay: Record<number, CalendarAtom[]> = {};
  atoms.forEach(a => {
    const d = new Date(a.scheduled_at || a.published_at || "");
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!atomsByDay[day]) atomsByDay[day] = [];
      atomsByDay[day].push(a);
    }
  });

  // Count content days vs empty days
  const contentDays = Object.keys(atomsByDay).length;
  const emptyDays = daysInMonth - contentDays;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠 캘린더</h1>
        <div className="flex rounded-lg border border-[#333] overflow-hidden">
          <button onClick={() => setViewType("month")} className={`px-3 py-1 text-xs border-none cursor-pointer ${viewType === "month" ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888]"}`}>월간</button>
          <button onClick={() => setViewType("week")} className={`px-3 py-1 text-xs border-none cursor-pointer ${viewType === "week" ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888]"}`}>주간</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">콘텐츠 일수</div>
          <div className="text-lg font-bold text-[#4ECDC4]">{contentDays}</div>
        </div>
        <div className="p-3 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">빈 날짜</div>
          <div className={`text-lg font-bold ${emptyDays > 15 ? "text-red-400" : "text-[#888]"}`}>{emptyDays}</div>
        </div>
        <div className="p-3 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">퍼널 비율</div>
          <div className="text-xs mt-1">
            <span className="text-green-400">T{Math.round((funnelRatio.tofu / funnelRatio.total) * 100)}%</span>
            {" / "}
            <span className="text-blue-400">M{Math.round((funnelRatio.mofu / funnelRatio.total) * 100)}%</span>
            {" / "}
            <span className="text-purple-400">B{Math.round((funnelRatio.bofu / funnelRatio.total) * 100)}%</span>
          </div>
          <div className="text-[10px] text-[#555] mt-0.5">목표 60/30/10</div>
        </div>
        <div className="p-3 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">총 발행</div>
          <div className="text-lg font-bold">{atoms.filter(a => a.status === "published").length}</div>
        </div>
      </div>

      {/* Calendar nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setDate(new Date(year, month - 1, 1))} className="px-3 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#888] text-sm cursor-pointer hover:text-[#fafafa]">←</button>
        <span className="text-lg font-bold">{year}년 {month + 1}월</span>
        <button onClick={() => setDate(new Date(year, month + 1, 1))} className="px-3 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#888] text-sm cursor-pointer hover:text-[#fafafa]">→</button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {["일","월","화","수","목","금","토"].map(d => (
          <div key={d} className="text-center text-xs text-[#555] py-2">{d}</div>
        ))}
        {days.map((day, i) => {
          const dayAtoms = day ? atomsByDay[day] || [] : [];
          const isEmpty = day && dayAtoms.length === 0;
          return (
            <div
              key={i}
              className={`min-h-[90px] p-2 rounded-lg border ${
                !day ? "border-transparent" :
                isEmpty ? "border-[#222] bg-[#0a0a0a] opacity-40" :
                "border-[#333] bg-[#141414]"
              }`}
            >
              {day && (
                <>
                  <div className="text-xs text-[#888] mb-1">{day}</div>
                  <div className="flex flex-col gap-1">
                    {dayAtoms.map(a => (
                      <Link
                        key={a.id}
                        href={`/campaigns/${a.campaign_id}`}
                        className="flex items-center gap-1 text-[10px] no-underline hover:opacity-80"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${CHANNEL_COLORS[a.channel] || "bg-[#555]"}`} />
                        <span className="text-[#ccc] truncate">{a.campaign_title || a.channel}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {Object.entries(CHANNEL_COLORS).map(([ch, color]) => (
          <div key={ch} className="flex items-center gap-1.5 text-xs text-[#888]">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {ch}
          </div>
        ))}
      </div>
    </div>
  );
}
