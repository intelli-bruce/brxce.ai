"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const CHANNEL_COLORS: Record<string, string> = {
  threads: "bg-purple-500", x: "bg-blue-500", linkedin: "bg-sky-600",
  instagram: "bg-pink-500", youtube: "bg-red-500", newsletter: "bg-amber-500", brxce_guide: "bg-[#FF6B35]",
};

export default function CalendarPage() {
  const [date, setDate] = useState(() => new Date());
  const [atoms, setAtoms] = useState<any[]>([]);
  const year = date.getFullYear();
  const month = date.getMonth();

  useEffect(() => {
    const sb = createSupabaseBrowser();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    sb.from("campaign_atoms")
      .select("id, channel, status, scheduled_at, published_at, campaign_id")
      .or(`scheduled_at.gte.${start},published_at.gte.${start}`)
      .in("status", ["scheduled", "published"])
      .then(({ data }) => setAtoms(data || []));
  }, [year, month]);

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
      <h1 className="text-2xl font-bold mb-6">캘린더</h1>
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
          <div key={i} className={`min-h-[80px] p-2 rounded-lg border ${day ? "border-[#333] bg-[#0a0a0a]" : "border-transparent"} ${day && !atomsByDay[day!] ? "opacity-50" : ""}`}>
            {day && (
              <>
                <div className="text-xs text-[#888] mb-1">{day}</div>
                <div className="flex flex-wrap gap-1">
                  {(atomsByDay[day] || []).map((a: any) => (
                    <div key={a.id} className={`w-2.5 h-2.5 rounded-full ${CHANNEL_COLORS[a.channel] || "bg-[#555]"}`} title={`${a.channel} (${a.status})`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
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
