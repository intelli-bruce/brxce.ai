"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { StyleProfile } from "@/lib/campaign/types";

export default function StyleProfilesPage() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", scope: "global" as const, patterns: "", anti_patterns: "", max_examples: 5 });
  const sb = createSupabaseBrowser();

  useEffect(() => {
    sb.from("style_profiles").select("*").order("updated_at", { ascending: false }).then(({ data }) => {
      if (data) setProfiles(data as StyleProfile[]);
    });
  }, []);

  async function handleSave() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      scope: form.scope,
      patterns: form.patterns || null,
      anti_patterns: form.anti_patterns || null,
      max_examples: form.max_examples,
    };

    if (editing) {
      await sb.from("style_profiles").update(payload).eq("id", editing);
    } else {
      await sb.from("style_profiles").insert(payload);
    }

    const { data } = await sb.from("style_profiles").select("*").order("updated_at", { ascending: false });
    if (data) setProfiles(data as StyleProfile[]);
    setEditing(null);
    setShowNew(false);
    setForm({ name: "", scope: "global", patterns: "", anti_patterns: "", max_examples: 5 });
  }

  function startEdit(p: StyleProfile) {
    setEditing(p.id);
    setForm({
      name: p.name,
      scope: p.scope as any,
      patterns: p.patterns || "",
      anti_patterns: p.anti_patterns || "",
      max_examples: p.max_examples,
    });
    setShowNew(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await sb.from("style_profiles").delete().eq("id", id);
    setProfiles(prev => prev.filter(p => p.id !== id));
  }

  const scopeLabels: Record<string, string> = { global: "🌐 전역", channel: "📺 채널별", format: "📝 포맷별" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">스타일 프로필</h1>
        <button
          onClick={() => { setShowNew(true); setEditing(null); setForm({ name: "", scope: "global", patterns: "", anti_patterns: "", max_examples: 5 }); }}
          className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b]"
        >
          + 새 프로필
        </button>
      </div>

      {/* Profile cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {profiles.map(p => (
          <div key={p.id} className="p-5 bg-[#141414] border border-[#222] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#fafafa]">{p.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#222] text-[#888]">{scopeLabels[p.scope]}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-xs text-[#4ECDC4] bg-transparent border-none cursor-pointer hover:underline">편집</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 bg-transparent border-none cursor-pointer hover:underline">삭제</button>
              </div>
            </div>

            {p.patterns && (
              <div className="mb-3">
                <div className="text-xs text-[#888] mb-1">✅ 패턴 (따를 것)</div>
                <div className="text-sm text-[#ccc] whitespace-pre-wrap max-h-[120px] overflow-y-auto">{p.patterns}</div>
              </div>
            )}

            {p.anti_patterns && (
              <div className="mb-3">
                <div className="text-xs text-[#888] mb-1">❌ 안티패턴 (하지 말 것)</div>
                <div className="text-sm text-[#aaa] whitespace-pre-wrap max-h-[120px] overflow-y-auto">{p.anti_patterns}</div>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-[#555]">
              <span>예시: {p.examples?.length || 0}개 (max {p.max_examples})</span>
              {p.top_performers?.length ? <span>🏆 {p.top_performers.length}개</span> : null}
              <span className="ml-auto">{new Date(p.updated_at).toLocaleDateString("ko-KR")}</span>
            </div>

            {p.examples_summary && (
              <div className="mt-3 p-3 bg-[#0a0a0a] rounded-lg text-xs text-[#888]">
                <span className="text-[#666]">요약:</span> {p.examples_summary}
              </div>
            )}
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="col-span-2 text-center py-12 text-[#555]">
            <p className="text-lg mb-2">🎨</p>
            <p className="text-sm">스타일 프로필이 없습니다</p>
            <p className="text-xs mt-1">프로필을 만들면 AI 생성 시 톤, 패턴, 완성작 레퍼런스가 자동 적용됩니다</p>
          </div>
        )}
      </div>

      {/* New/Edit form */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNew(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-[560px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editing ? "프로필 편집" : "새 스타일 프로필"}</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888] mb-1.5">이름</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="default, threads, guide..."
                    className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-1.5">범위</label>
                  <select
                    value={form.scope}
                    onChange={e => setForm(p => ({ ...p, scope: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
                  >
                    <option value="global">🌐 전역</option>
                    <option value="channel">📺 채널별</option>
                    <option value="format">📝 포맷별</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#888] mb-1.5">패턴 (따를 것)</label>
                <textarea
                  value={form.patterns}
                  onChange={e => setForm(p => ({ ...p, patterns: e.target.value }))}
                  rows={5}
                  placeholder="짧고 끊어치는 문장. 독백/일기체. 해본 것만 담백하게..."
                  className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888] mb-1.5">안티패턴 (하지 말 것)</label>
                <textarea
                  value={form.anti_patterns}
                  onChange={e => setForm(p => ({ ...p, anti_patterns: e.target.value }))}
                  rows={4}
                  placeholder="번역체 금지. 이모지 남발 금지. 과장 금지..."
                  className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888] mb-1.5">프롬프트 포함 예시 수</label>
                <input
                  type="number" min={1} max={10}
                  value={form.max_examples}
                  onChange={e => setForm(p => ({ ...p, max_examples: parseInt(e.target.value) || 5 }))}
                  className="w-24 px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50">
                  {editing ? "저장" : "생성"}
                </button>
                <button onClick={() => setShowNew(false)} className="px-4 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
