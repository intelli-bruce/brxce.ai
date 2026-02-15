"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    topic: "",
    brief: "",
    funnel_stage: "tofu",
    cta_type: "guide_read",
    cta_target: "",
    origin_direction: "top_down",
    series_id: "",
    seo_keywords: "",
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  async function handleSave() {
    if (!form.title.trim() || !form.topic.trim()) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    const payload: any = {
      title: form.title,
      topic: form.topic,
      brief: form.brief || null,
      funnel_stage: form.funnel_stage,
      cta_type: form.cta_type,
      cta_target: form.cta_target || null,
      origin_direction: form.origin_direction,
      series_id: form.series_id || null,
      seo_keywords: form.seo_keywords ? form.seo_keywords.split(",").map(s => s.trim()).filter(Boolean) : null,
    };
    const { data, error } = await sb.from("campaigns").insert(payload).select("id").single();
    if (data) {
      router.push(`/campaigns/${data.id}`);
    } else {
      console.error(error);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">새 캠페인</h1>

      <div className="flex flex-col gap-5">
        <Field label="제목 *">
          <input
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="캠페인 제목"
            className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
          />
        </Field>

        <Field label="주제 *">
          <input
            value={form.topic}
            onChange={e => set("topic", e.target.value)}
            placeholder="핵심 주제"
            className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
          />
        </Field>

        <Field label="브리프">
          <textarea
            value={form.brief}
            onChange={e => set("brief", e.target.value)}
            rows={4}
            placeholder="캠페인 브리프 (선택)"
            className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-y"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="퍼널 스테이지">
            <select value={form.funnel_stage} onChange={e => set("funnel_stage", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
              <option value="tofu">TOFU (인지)</option>
              <option value="mofu">MOFU (고려)</option>
              <option value="bofu">BOFU (전환)</option>
            </select>
          </Field>

          <Field label="CTA 타입">
            <select value={form.cta_type} onChange={e => set("cta_type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
              <option value="guide_read">가이드 읽기</option>
              <option value="newsletter_sub">뉴스레터 구독</option>
              <option value="consult">상담 신청</option>
              <option value="free_trial">무료 체험</option>
            </select>
          </Field>
        </div>

        <Field label="CTA 타겟 URL">
          <input
            value={form.cta_target}
            onChange={e => set("cta_target", e.target.value)}
            placeholder="https://"
            className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
          />
        </Field>

        <Field label="SEO 키워드 (쉼표 구분)">
          <input
            value={form.seo_keywords}
            onChange={e => set("seo_keywords", e.target.value)}
            placeholder="에이전틱 워크플로우, AI 에이전트, 업무 자동화"
            className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
          />
          <p className="text-[10px] text-[#555] mt-1">서브에이전트가 추가 키워드 리서치를 수행합니다</p>
        </Field>

        <Field label="오리진 방향">
          <div className="flex gap-3">
            {[
              { value: "top_down", label: "🔽 Top-Down (전략 → 콘텐츠)" },
              { value: "bottom_up", label: "🔼 Bottom-Up (콘텐츠 → 캠페인)" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => set("origin_direction", opt.value)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  form.origin_direction === opt.value
                    ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                    : "border-[#333] bg-[#0a0a0a] text-[#888] hover:border-[#555]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.topic.trim()}
            className="px-6 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "캠페인 생성"}
          </button>
          <button
            onClick={() => router.push("/campaigns")}
            className="px-6 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa] hover:border-[#555]"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-[#888] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
