"use client";

import { useState } from "react";
import type { CampaignVariant } from "@/lib/campaign/types";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Props {
  variants: CampaignVariant[];
  atomId: string;
  onSelect: (variantId: string) => void;
  onBranch: (variantId: string, feedback: string) => void;
}

type ViewMode = 'side' | 'diff';

export default function VariantCompare({ variants, atomId, onSelect, onBranch }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('side');
  const [branchTarget, setBranchTarget] = useState<string | null>(null);
  const [branchFeedback, setBranchFeedback] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const sb = createSupabaseBrowser();

  // 세대별 그룹
  const generations = [...new Set(variants.map(v => v.generation))].sort();

  async function handleScore(variantId: string, score: number) {
    setScores(prev => ({ ...prev, [variantId]: score }));
    await sb.from('campaign_variants').update({ score }).eq('id', variantId);
  }

  async function handleSelect(variantId: string) {
    // 이전 선택 해제
    await sb.from('campaign_variants').update({ is_selected: false }).eq('atom_id', atomId);
    // 새 선택
    await sb.from('campaign_variants').update({ is_selected: true }).eq('id', variantId);
    await sb.from('campaign_atoms').update({ selected_variant_id: variantId, status: 'selected' }).eq('id', atomId);
    onSelect(variantId);
  }

  function handleBranch(variantId: string) {
    if (branchTarget === variantId && branchFeedback) {
      onBranch(variantId, branchFeedback);
      setBranchTarget(null);
      setBranchFeedback('');
    } else {
      setBranchTarget(variantId);
    }
  }

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-[#555]">
        <p className="text-sm">생성된 variant가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[#888]">
          {variants.length}개 variant · {generations.length}세대
        </div>
        <div className="flex rounded-lg border border-[#333] overflow-hidden">
          <button
            onClick={() => setViewMode('side')}
            className={`px-3 py-1 text-xs border-none cursor-pointer transition-colors ${
              viewMode === 'side' ? 'bg-[#FF6B35] text-white' : 'bg-[#0a0a0a] text-[#888]'
            }`}
          >
            나란히
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 text-xs border-none cursor-pointer transition-colors ${
              viewMode === 'diff' ? 'bg-[#FF6B35] text-white' : 'bg-[#0a0a0a] text-[#888]'
            }`}
          >
            목록
          </button>
        </div>
      </div>

      {/* Variants */}
      {viewMode === 'side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {variants.map(v => (
            <VariantCard
              key={v.id}
              variant={v}
              score={scores[v.id] ?? v.score}
              onScore={(s) => handleScore(v.id, s)}
              onSelect={() => handleSelect(v.id)}
              onBranch={() => handleBranch(v.id)}
              isBranching={branchTarget === v.id}
              branchFeedback={branchFeedback}
              onBranchFeedback={setBranchFeedback}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {variants.map(v => (
            <VariantCard
              key={v.id}
              variant={v}
              score={scores[v.id] ?? v.score}
              onScore={(s) => handleScore(v.id, s)}
              onSelect={() => handleSelect(v.id)}
              onBranch={() => handleBranch(v.id)}
              isBranching={branchTarget === v.id}
              branchFeedback={branchFeedback}
              onBranchFeedback={setBranchFeedback}
              wide
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VariantCard({
  variant: v,
  score,
  onScore,
  onSelect,
  onBranch,
  isBranching,
  branchFeedback,
  onBranchFeedback,
  wide,
}: {
  variant: CampaignVariant;
  score: number | null;
  onScore: (s: number) => void;
  onSelect: () => void;
  onBranch: () => void;
  isBranching: boolean;
  branchFeedback: string;
  onBranchFeedback: (f: string) => void;
  wide?: boolean;
}) {
  const body = v.output?.body || '';
  const wordCount = v.output?.word_count || body.length;
  const params = v.params || {};

  return (
    <div className={`p-4 bg-[#141414] border rounded-xl ${v.is_selected ? 'border-[#FF6B35]' : 'border-[#222]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#222] text-[#888]">
            G{v.generation}
          </span>
          {params.tone && <span className="text-xs text-[#555]">{params.tone}</span>}
          {params.hook_type && <span className="text-xs text-[#4ECDC4]">{params.hook_type}</span>}
          {v.is_selected && <span className="text-xs text-[#FF6B35] font-medium">✓ 선택됨</span>}
        </div>
        <span className="text-xs text-[#555]">{wordCount}자</span>
      </div>

      {/* Body preview */}
      <div className={`text-sm text-[#ccc] whitespace-pre-wrap mb-3 ${wide ? '' : 'max-h-[200px] overflow-y-auto'}`}>
        {body || JSON.stringify(v.output, null, 2).substring(0, 500)}
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => onScore(s)}
            className={`text-sm cursor-pointer bg-transparent border-none ${
              score && s <= score ? 'text-yellow-400' : 'text-[#333]'
            }`}
          >
            ★
          </button>
        ))}
        {v.cost_usd > 0 && (
          <span className="text-xs text-[#555] ml-auto">${v.cost_usd.toFixed(3)}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {!v.is_selected && (
          <button
            onClick={onSelect}
            className="px-3 py-1 rounded-lg border border-[#FF6B35]/30 text-[#FF6B35] text-xs cursor-pointer bg-transparent hover:bg-[#FF6B35]/10"
          >
            선택
          </button>
        )}
        <button
          onClick={onBranch}
          className="px-3 py-1 rounded-lg border border-[#4ECDC4]/30 text-[#4ECDC4] text-xs cursor-pointer bg-transparent hover:bg-[#4ECDC4]/10"
        >
          분기
        </button>
      </div>

      {/* Branch feedback input */}
      {isBranching && (
        <div className="mt-3 flex gap-2">
          <input
            value={branchFeedback}
            onChange={e => onBranchFeedback(e.target.value)}
            placeholder="피드백: 훅 더 강하게..."
            className="flex-1 px-2 py-1 rounded border border-[#333] bg-[#0a0a0a] text-xs text-[#fafafa] outline-none"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && branchFeedback && onBranch()}
          />
          <button
            onClick={onBranch}
            disabled={!branchFeedback}
            className="px-3 py-1 rounded bg-[#4ECDC4] text-black text-xs cursor-pointer border-none disabled:opacity-30"
          >
            생성
          </button>
        </div>
      )}
    </div>
  );
}
