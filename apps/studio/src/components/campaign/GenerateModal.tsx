"use client";

import { useState } from "react";
import type { GenerationConfig } from "@/lib/campaign/types";

interface Props {
  atomId: string;
  channel: string;
  format: string;
  onGenerate: (config: GenerationConfig) => void;
  onClose: () => void;
}

export default function GenerateModal({ atomId, channel, format, onGenerate, onClose }: Props) {
  const [variantCount, setVariantCount] = useState(3);
  const [diversity, setDiversity] = useState<'wide' | 'normal' | 'narrow'>('normal');
  const [feedback, setFeedback] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-[480px]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">콘텐츠 생성</h3>
        <p className="text-xs text-[#888] mb-5">{channel} · {format}</p>

        <div className="flex flex-col gap-4">
          {/* Variant count */}
          <div>
            <label className="block text-sm text-[#888] mb-2">버전 수</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6, 8].map(n => (
                <button
                  key={n}
                  onClick={() => setVariantCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm border cursor-pointer transition-colors ${
                    variantCount === n
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'border-[#333] bg-[#0a0a0a] text-[#888] hover:border-[#555]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Diversity */}
          <div>
            <label className="block text-sm text-[#888] mb-2">다양화</label>
            <div className="flex gap-2">
              {([
                { value: 'wide' as const, label: '넓게', desc: '완전히 다른 접근' },
                { value: 'normal' as const, label: '보통', desc: '균형 잡힌 변형' },
                { value: 'narrow' as const, label: '좁게', desc: '미세 조정' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDiversity(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors text-left ${
                    diversity === opt.value
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'border-[#333] bg-[#0a0a0a] text-[#888] hover:border-[#555]'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm text-[#888] mb-2">피드백 (선택)</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="예: 훅 더 강하게, 마지막에 반전 추가"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => onGenerate({
                variant_count: variantCount,
                diversity,
                feedback: feedback || undefined,
              })}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#e55a2b]"
            >
              🚀 생성 시작
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa]"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
