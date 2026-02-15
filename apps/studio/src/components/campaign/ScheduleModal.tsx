"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { ChannelScheduleRule } from "@/lib/campaign/types";

interface Props {
  atomId: string;
  channel: string;
  onSchedule: (scheduledAt: string) => void;
  onClose: () => void;
}

const DAY_LABELS = ["", "월", "화", "수", "목", "금", "토", "일"];

export default function ScheduleModal({ atomId, channel, onSchedule, onClose }: Props) {
  const [rule, setRule] = useState<ChannelScheduleRule | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [useOptimal, setUseOptimal] = useState(true);
  const sb = createSupabaseBrowser();

  useEffect(() => {
    sb.from("channel_schedule_rules").select("*").eq("channel", channel).single()
      .then(({ data }) => {
        if (data) {
          setRule(data as ChannelScheduleRule);
          // Set default to next optimal slot
          const now = new Date();
          const bestHour = (data as ChannelScheduleRule).best_hours?.[0] ?? 9;
          const target = new Date(now);
          target.setHours(bestHour, 0, 0, 0);
          if (target <= now) target.setDate(target.getDate() + 1);
          // Find next best day
          const bestDays = (data as ChannelScheduleRule).best_days || [];
          if (bestDays.length > 0) {
            while (!bestDays.includes(target.getDay() === 0 ? 7 : target.getDay())) {
              target.setDate(target.getDate() + 1);
            }
          }
          setDate(target.toISOString().slice(0, 10));
          setTime(`${String(bestHour).padStart(2, "0")}:00`);
        }
      });
  }, [channel]);

  function handleSchedule() {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}:00+09:00`).toISOString();
    onSchedule(scheduledAt);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-[420px]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">발행 스케줄</h3>
        <p className="text-xs text-[#888] mb-5">{channel}</p>

        {/* Optimal info */}
        {rule && (
          <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded-lg mb-4">
            <div className="text-xs text-[#888] mb-2">📊 채널 최적 시간</div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-[#666]">요일: </span>
                <span className="text-[#fafafa]">{rule.best_days?.map(d => DAY_LABELS[d]).join(", ") || "제한 없음"}</span>
              </div>
              <div>
                <span className="text-[#666]">시간: </span>
                <span className="text-[#fafafa]">{rule.best_hours?.map(h => `${h}시`).join(", ") || "제한 없음"}</span>
              </div>
            </div>
            <div className="flex gap-4 text-xs mt-1">
              <div>
                <span className="text-[#666]">발행: </span>
                <span className={rule.publish_method === "auto" ? "text-green-400" : "text-yellow-400"}>
                  {rule.publish_method === "auto" ? "🤖 자동" : "📋 수동"}
                </span>
              </div>
              <div>
                <span className="text-[#666]">API: </span>
                <span className={rule.api_status === "available" ? "text-green-400" : rule.api_status === "limited" ? "text-yellow-400" : "text-red-400"}>
                  {rule.api_status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Date/Time picker */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm text-[#888] mb-1.5">날짜</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#888] mb-1.5">시간 (KST)</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSchedule}
            disabled={!date || !time}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50"
          >
            📅 스케줄 등록
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
