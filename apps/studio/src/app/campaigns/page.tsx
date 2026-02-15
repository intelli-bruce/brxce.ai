"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import IdBadge from "@/components/IdBadge";

interface Campaign {
  id: string;
  title: string;
  funnel_stage: string;
  status: string;
  total_cost_usd: number;
  series_id: string | null;
  created_at: string;
  atom_count: number;
  published_count: number;
  series_title?: string;
}

const FUNNEL_COLORS: Record<string, string> = {
  tofu: "bg-green-500/20 text-green-400 border-green-500/30",
  mofu: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bofu: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  ideation: "text-[#888]",
  seo_research: "text-yellow-500",
  producing: "text-blue-400",
  fact_check: "text-orange-400",
  approval: "text-cyan-400",
  ready: "text-emerald-400",
  scheduled: "text-indigo-400",
  published: "text-green-400",
  analyzing: "text-pink-400",
};

const FUNNEL_TARGETS = { tofu: 60, mofu: 30, bofu: 10 };

type ViewMode = "funnel" | "calendar";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<ViewMode>("funnel");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFunnel, setFilterFunnel] = useState("all");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarAtoms, setCalendarAtoms] = useState<any[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    async function load() {
      const { data: camps } = await sb
        .from("campaigns")
        .select("id, title, funnel_stage, status, total_cost_usd, series_id, created_at")
        .order("created_at", { ascending: false });

      if (!camps) return;

      // Get atom counts per campaign
      const { data: atoms } = await sb
        .from("campaign_atoms")
        .select("campaign_id, status");

      // Get series titles
      const seriesIds = [...new Set(camps.filter(c => c.series_id).map(c => c.series_id))];
      let seriesMap: Record<string, string> = {};
      if (seriesIds.length > 0) {
        const { data: series } = await sb
          .from("campaign_series")
          .select("id, title")
          .in("id", seriesIds);
        (series || []).forEach(s => { seriesMap[s.id] = s.title; });
      }

      const enriched = camps.map(c => {
        const cAtoms = (atoms || []).filter(a => a.campaign_id === c.id);
        return {
          ...c,
          atom_count: cAtoms.length,
          published_count: cAtoms.filter(a => a.status === "published").length,
          series_title: c.series_id ? seriesMap[c.series_id] : undefined,
        };
      });

      setCampaigns(enriched);
    }
    load();
  }, []);

  useEffect(() => {
    if (view !== "calendar") return;
    const sb = createSupabaseBrowser();
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    sb.from("campaign_atoms")
      .select("id, channel, status, scheduled_at, published_at")
      .or(`scheduled_at.gte.${start},published_at.gte.${start}`)
      .or(`scheduled_at.lte.${end},published_at.lte.${end}`)
      .in("status", ["scheduled", "published"])
      .then(({ data }) => setCalendarAtoms(data || []));
  }, [view, calendarDate]);

  const filtered = campaigns.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterFunnel !== "all" && c.funnel_stage !== filterFunnel) return false;
    return true;
  });

  const funnelGroups = {
    tofu: filtered.filter(c => c.funnel_stage === "tofu"),
    mofu: filtered.filter(c => c.funnel_stage === "mofu"),
    bofu: filtered.filter(c => c.funnel_stage === "bofu"),
  };

  const total = filtered.length || 1;
  const funnelRatios = {
    tofu: Math.round((funnelGroups.tofu.length / total) * 100),
    mofu: Math.round((funnelGroups.mofu.length / total) * 100),
    bofu: Math.round((funnelGroups.bofu.length / total) * 100),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">캠페인</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[#333] overflow-hidden">
            <button
              onClick={() => setView("funnel")}
              className={`px-3 py-1.5 text-xs border-none cursor-pointer transition-colors ${view === "funnel" ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888] hover:text-[#fafafa]"}`}
            >
              퍼널
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 text-xs border-none cursor-pointer transition-colors ${view === "calendar" ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888] hover:text-[#fafafa]"}`}
            >
              캘린더
            </button>
          </div>
          <Link href="/campaigns/new" className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold no-underline hover:bg-[#e55a2b]">
            + 새 캠페인
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
        >
          <option value="all">전체 상태</option>
          {["ideation","seo_research","producing","fact_check","approval","ready","scheduled","published","analyzing"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterFunnel}
          onChange={e => setFilterFunnel(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
        >
          <option value="all">전체 퍼널</option>
          <option value="tofu">TOFU</option>
          <option value="mofu">MOFU</option>
          <option value="bofu">BOFU</option>
        </select>
      </div>

      {view === "funnel" ? (
        <>
          {/* Funnel ratio bar */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#141414] border border-[#222] rounded-xl">
            {(["tofu", "mofu", "bofu"] as const).map(stage => (
              <div key={stage} className="flex-1 text-center">
                <div className="text-xs text-[#888] uppercase mb-1">{stage}</div>
                <div className="text-lg font-bold">{funnelRatios[stage]}%</div>
                <div className="text-xs text-[#555]">목표 {FUNNEL_TARGETS[stage]}%</div>
              </div>
            ))}
          </div>

          {/* 3-column kanban */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["tofu", "mofu", "bofu"] as const).map(stage => (
              <div key={stage}>
                <div className="text-sm font-semibold text-[#888] uppercase mb-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs border ${FUNNEL_COLORS[stage]}`}>{stage}</span>
                  <span className="text-[#555]">{funnelGroups[stage].length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {funnelGroups[stage].map(c => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                  {funnelGroups[stage].length === 0 && (
                    <div className="text-xs text-[#555] p-4 border border-dashed border-[#333] rounded-xl text-center">없음</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <CalendarView date={calendarDate} setDate={setCalendarDate} atoms={calendarAtoms} />
      )}
    </div>
  );
}

function CampaignCard({ campaign: c }: { campaign: Campaign }) {
  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="block p-4 bg-[#141414] border border-[#222] rounded-xl no-underline hover:border-[#444] transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[15px] text-[#fafafa] font-medium">{c.title}</span>
        <IdBadge id={c.id} />
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-xs border ${FUNNEL_COLORS[c.funnel_stage]}`}>
          {c.funnel_stage.toUpperCase()}
        </span>
        <span className={`text-xs font-medium ${STATUS_COLORS[c.status] || "text-[#888]"}`}>
          {c.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#666]">
        <span>📦 {c.published_count}/{c.atom_count} 콘텐츠</span>
        {c.total_cost_usd > 0 && <span>${c.total_cost_usd.toFixed(2)}</span>}
      </div>
      {c.series_title && (
        <div className="text-xs text-[#4ECDC4] mt-1">📚 {c.series_title}</div>
      )}
    </Link>
  );
}

const CHANNEL_COLORS: Record<string, string> = {
  threads: "bg-purple-500",
  x: "bg-blue-500",
  linkedin: "bg-sky-600",
  instagram: "bg-pink-500",
  youtube: "bg-red-500",
  newsletter: "bg-amber-500",
  brxce_guide: "bg-[#FF6B35]",
};

function CalendarView({ date, setDate, atoms }: { date: Date; setDate: (d: Date) => void; atoms: any[] }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const atomsByDay: Record<number, any[]> = {};
  atoms.forEach(a => {
    const d = new Date(a.scheduled_at || a.published_at);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!atomsByDay[day]) atomsByDay[day] = [];
      atomsByDay[day].push(a);
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setDate(new Date(year, month - 1, 1))} className="px-3 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#888] text-sm cursor-pointer hover:text-[#fafafa]">←</button>
        <span className="text-lg font-bold">{year}년 {month + 1}월</span>
        <button onClick={() => setDate(new Date(year, month + 1, 1))} className="px-3 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#888] text-sm cursor-pointer hover:text-[#fafafa]">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["일","월","화","수","목","금","토"].map(d => (
          <div key={d} className="text-center text-xs text-[#555] py-2">{d}</div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`min-h-[80px] p-2 rounded-lg border ${
              day && !atomsByDay[day] ? "border-[#333] bg-[#0a0a0a]" :
              day && atomsByDay[day] ? "border-[#333] bg-[#141414]" :
              "border-transparent"
            } ${day && !atomsByDay[day] ? "opacity-50" : ""}`}
          >
            {day && (
              <>
                <div className="text-xs text-[#888] mb-1">{day}</div>
                <div className="flex flex-wrap gap-1">
                  {(atomsByDay[day] || []).map((a: any) => (
                    <div key={a.id} className={`w-2 h-2 rounded-full ${CHANNEL_COLORS[a.channel] || "bg-[#555]"}`} title={`${a.channel} (${a.status})`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
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
