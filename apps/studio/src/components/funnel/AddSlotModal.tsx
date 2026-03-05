"use client";

import { useState } from "react";
import { type FunnelStage, type Priority, FUNNEL_STAGES, STAGE_ORDER, CHANNEL_LABELS } from "@/lib/funnel";

interface AddSlotModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CHANNELS = Object.keys(CHANNEL_LABELS);
const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

export default function AddSlotModal({ onClose, onCreated }: AddSlotModalProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [funnelStage, setFunnelStage] = useState<FunnelStage>("tofu");
  const [channel, setChannel] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [phase, setPhase] = useState("1");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/funnel-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase() || null,
          title: title.trim(),
          description: description.trim() || null,
          funnel_stage: funnelStage,
          channel: channel || null,
          priority,
          phase: phase ? Number(phase) : null,
          status: "planned",
        }),
      });
      if (!res.ok) throw new Error("Failed to create slot");
      onCreated();
    } catch {
      alert("슬롯 생성에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-md mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-[#fafafa] mb-4">슬롯 추가</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Code + Title row */}
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">코드</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="T8"
                maxLength={5}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm font-mono placeholder:text-[#444] outline-none focus:border-[#FF6B35] uppercase"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">제목 *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: Threads 숏텍스트 시리즈"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm placeholder:text-[#444] outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] text-[#888] mb-1 block">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm placeholder:text-[#444] outline-none focus:border-[#FF6B35] resize-none"
            />
          </div>

          {/* Stage + Channel row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">퍼널 단계</label>
              <select
                value={funnelStage}
                onChange={(e) => setFunnelStage(e.target.value as FunnelStage)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm outline-none"
              >
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {FUNNEL_STAGES[s].icon} {FUNNEL_STAGES[s].label} — {FUNNEL_STAGES[s].sublabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">채널</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm outline-none"
              >
                <option value="">선택 안함</option>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {CHANNEL_LABELS[ch]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority + Phase row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#888] mb-1 block">Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-[#fafafa] text-sm outline-none"
              >
                {[1, 2, 3, 4].map((p) => (
                  <option key={p} value={p}>Phase {p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-[#888] text-sm hover:text-[#fafafa] transition-colors border-none cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-sm font-medium transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
