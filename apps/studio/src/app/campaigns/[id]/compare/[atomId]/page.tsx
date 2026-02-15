"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import FactCheckPanel from "@/components/campaign/FactCheckPanel";
import ChannelPreview from "@/components/campaign/ChannelPreview";
import type { Campaign, CampaignAtom, CampaignVariant, GenerationConfig, FactCheckFlag } from "@/lib/campaign/types";

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", newsletter: "📧", brxce_guide: "🦞",
};

type ViewMode = "side" | "full" | "diff" | "preview";

export default function ComparePageWrapper() {
  const { id, atomId } = useParams<{ id: string; atomId: string }>();
  const router = useRouter();
  const sb = createSupabaseBrowser();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [atom, setAtom] = useState<CampaignAtom | null>(null);
  const [variants, setVariants] = useState<CampaignVariant[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("side");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [branchTarget, setBranchTarget] = useState<string | null>(null);
  const [branchFeedback, setBranchFeedback] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    const [{ data: camp }, { data: atomData }, { data: vars }] = await Promise.all([
      sb.from("campaigns").select("*").eq("id", id).single(),
      sb.from("campaign_atoms").select("*").eq("id", atomId).single(),
      sb.from("campaign_variants").select("*").eq("atom_id", atomId).order("generation").order("created_at"),
    ]);
    if (camp) setCampaign(camp as Campaign);
    if (atomData) setAtom(atomData as CampaignAtom);
    if (vars) {
      setVariants(vars as CampaignVariant[]);
      const s: Record<string, number> = {};
      (vars as CampaignVariant[]).forEach(v => { if (v.score) s[v.id] = v.score; });
      setScores(s);
    }
  }, [id, atomId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Polling if generating
  useEffect(() => {
    if (atom?.status !== "generating") return;
    const timer = setInterval(loadData, 4000);
    return () => clearInterval(timer);
  }, [atom?.status, loadData]);

  async function handleScore(variantId: string, score: number) {
    setScores(prev => ({ ...prev, [variantId]: score }));
    await sb.from("campaign_variants").update({ score }).eq("id", variantId);
  }

  async function handleSelect(variantId: string) {
    await sb.from("campaign_variants").update({ is_selected: false }).eq("atom_id", atomId);
    await sb.from("campaign_variants").update({ is_selected: true }).eq("id", variantId);
    await sb.from("campaign_atoms").update({ selected_variant_id: variantId, status: "selected" }).eq("id", atomId);
    loadData();
  }

  async function handleBranch() {
    if (!branchTarget || !branchFeedback) return;
    const config: GenerationConfig = {
      variant_count: 2,
      diversity: "narrow",
      base_variant_id: branchTarget,
      feedback: branchFeedback,
    };
    await sb.from("campaign_atoms").update({ status: "generating", generation_config: config }).eq("id", atomId);
    setBranchTarget(null);
    setBranchFeedback("");
    loadData();
  }

  if (!campaign || !atom) return <div className="text-[#888] p-8">Loading...</div>;

  // Build tree structure
  const tree = buildTree(variants);
  const generations = [...new Set(variants.map(v => v.generation))].sort();

  // Filter for side-by-side: show selected or all from latest gen
  const displayVariants = viewMode === "diff" && selectedIds.size >= 2
    ? variants.filter(v => selectedIds.has(v.id))
    : variants;

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-0">
      {/* Left panel: version tree */}
      <div className="w-64 shrink-0 border-r border-[#222] overflow-y-auto p-4 bg-[#0c0c0c]">
        <button
          onClick={() => router.push(`/campaigns/${id}`)}
          className="text-xs text-[#888] hover:text-[#fafafa] mb-4 bg-transparent border-none cursor-pointer"
        >
          ← 콕핏으로
        </button>
        <h3 className="text-sm font-bold mb-1">{campaign.title}</h3>
        <div className="text-xs text-[#888] mb-4">
          {CHANNEL_ICONS[atom.channel]} {atom.channel} · {atom.format}
        </div>

        {/* Tree view */}
        <div className="text-xs text-[#888] uppercase mb-2">버전 트리</div>
        {tree.map(node => (
          <TreeNode
            key={node.variant.id}
            node={node}
            depth={0}
            selectedIds={selectedIds}
            onToggle={(vid) => {
              setSelectedIds(prev => {
                const next = new Set(prev);
                next.has(vid) ? next.delete(vid) : next.add(vid);
                return next;
              });
            }}
            currentSelected={atom.selected_variant_id}
          />
        ))}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2">
          {atom.status === "comparing" && (
            <div className="text-[10px] text-[#888]">variant를 선택하세요</div>
          )}
          {atom.status === "generating" && (
            <div className="text-xs text-yellow-400 animate-pulse">⏳ 생성 중...</div>
          )}
        </div>
      </div>

      {/* Right panel: compare view */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* View controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-[#888]">
            {variants.length}개 variant · {generations.length}세대
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-[#333] overflow-hidden">
              {(["side", "full", "diff", "preview"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 text-xs border-none cursor-pointer transition-colors ${
                    viewMode === m ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888]"
                  }`}
                >
                  {m === "side" ? "나란히" : m === "full" ? "전문" : m === "diff" ? "비교" : "📱 프리뷰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variants display */}
        {viewMode === "preview" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayVariants.map(v => (
              <div key={v.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#888]">
                    G{v.generation} {v.params?.tone && `· ${v.params.tone}`} {v.params?.hook_type && `· ${v.params.hook_type}`}
                  </span>
                  <div className="flex gap-2">
                    {!v.is_selected && (
                      <button onClick={() => handleSelect(v.id)} className="text-xs text-[#FF6B35] bg-transparent border-none cursor-pointer hover:underline">선택</button>
                    )}
                    {v.is_selected && <span className="text-xs text-[#FF6B35]">✓ 선택됨</span>}
                  </div>
                </div>
                <ChannelPreview variant={v} channel={atom!.channel} />
              </div>
            ))}
          </div>
        ) : viewMode === "side" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayVariants.map(v => (
              <VariantPanel
                key={v.id}
                variant={v}
                score={scores[v.id] ?? v.score}
                onScore={s => handleScore(v.id, s)}
                onSelect={() => handleSelect(v.id)}
                onBranch={() => setBranchTarget(v.id)}
                maxHeight="max-h-[60vh]"
              />
            ))}
          </div>
        ) : viewMode === "full" ? (
          <div className="flex flex-col gap-6">
            {displayVariants.map(v => (
              <VariantPanel
                key={v.id}
                variant={v}
                score={scores[v.id] ?? v.score}
                onScore={s => handleScore(v.id, s)}
                onSelect={() => handleSelect(v.id)}
                onBranch={() => setBranchTarget(v.id)}
                full
              />
            ))}
          </div>
        ) : (
          // Diff view — 2 selected variants side by side
          selectedIds.size < 2 ? (
            <div className="text-center py-12 text-[#555]">
              <p>좌측 트리에서 2개 이상 선택하세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {displayVariants.map(v => (
                <VariantPanel
                  key={v.id}
                  variant={v}
                  score={scores[v.id] ?? v.score}
                  onScore={s => handleScore(v.id, s)}
                  onSelect={() => handleSelect(v.id)}
                  onBranch={() => setBranchTarget(v.id)}
                  full
                />
              ))}
            </div>
          )
        )}

        {/* Fact check */}
        {atom.fact_check_flags && atom.fact_check_flags.length > 0 && (
          <div className="mt-6">
            <FactCheckPanel
              atomId={atom.id}
              flags={atom.fact_check_flags}
              onUpdate={(flags) => setAtom(prev => prev ? { ...prev, fact_check_flags: flags } : null)}
            />
          </div>
        )}

        {/* Branch modal */}
        {branchTarget && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setBranchTarget(null)}>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-[480px]" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-1">분기 생성</h3>
              <p className="text-xs text-[#888] mb-4">선택한 버전을 기반으로 개선된 variant를 생성합니다</p>
              <textarea
                value={branchFeedback}
                onChange={e => setBranchFeedback(e.target.value)}
                placeholder="피드백: 훅 더 강하게, 마지막에 반전..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none mb-4 resize-y"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBranch}
                  disabled={!branchFeedback}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#4ECDC4] text-black text-sm font-medium border-none cursor-pointer hover:bg-[#3dbdb5] disabled:opacity-30"
                >
                  🌿 분기 생성
                </button>
                <button
                  onClick={() => setBranchTarget(null)}
                  className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Tree building ---

interface TreeNodeData {
  variant: CampaignVariant;
  children: TreeNodeData[];
}

function buildTree(variants: CampaignVariant[]): TreeNodeData[] {
  const map = new Map<string, TreeNodeData>();
  const roots: TreeNodeData[] = [];

  variants.forEach(v => map.set(v.id, { variant: v, children: [] }));
  variants.forEach(v => {
    const node = map.get(v.id)!;
    if (v.parent_id && map.has(v.parent_id)) {
      map.get(v.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function TreeNode({
  node,
  depth,
  selectedIds,
  onToggle,
  currentSelected,
}: {
  node: TreeNodeData;
  depth: number;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  currentSelected: string | null;
}) {
  const v = node.variant;
  const isSelected = selectedIds.has(v.id);
  const isCurrent = v.id === currentSelected;

  return (
    <>
      <div
        className={`flex items-center gap-1.5 py-1 cursor-pointer rounded px-1.5 text-xs transition-colors ${
          isSelected ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "text-[#888] hover:text-[#fafafa]"
        }`}
        style={{ paddingLeft: `${depth * 16 + 6}px` }}
        onClick={() => onToggle(v.id)}
      >
        {depth > 0 && <span className="text-[#333]">└</span>}
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          isCurrent ? "bg-[#FF6B35]" : v.is_selected ? "bg-[#4ECDC4]" : "bg-[#333]"
        }`} />
        <span className="truncate">
          G{v.generation}
          {v.params?.tone ? ` · ${v.params.tone}` : ""}
          {v.params?.hook_type ? ` · ${v.params.hook_type}` : ""}
        </span>
        {v.score && <span className="text-yellow-400 ml-auto shrink-0">{"★".repeat(v.score)}</span>}
      </div>
      {node.children.map(child => (
        <TreeNode
          key={child.variant.id}
          node={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onToggle={onToggle}
          currentSelected={currentSelected}
        />
      ))}
    </>
  );
}

// --- Variant panel ---

function VariantPanel({
  variant: v,
  score,
  onScore,
  onSelect,
  onBranch,
  maxHeight,
  full,
}: {
  variant: CampaignVariant;
  score: number | null;
  onScore: (s: number) => void;
  onSelect: () => void;
  onBranch: () => void;
  maxHeight?: string;
  full?: boolean;
}) {
  const body = v.output?.body || v.output?.text || (typeof v.output === 'string' ? v.output : '');
  const wordCount = v.output?.word_count || body.length;

  return (
    <div className={`bg-[#141414] border rounded-xl p-5 ${v.is_selected ? "border-[#FF6B35]" : "border-[#222]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#222] text-[#888]">G{v.generation}</span>
          {v.params?.tone && <span className="text-xs text-[#555]">{v.params.tone}</span>}
          {v.params?.hook_type && <span className="text-xs text-[#4ECDC4]">{v.params.hook_type}</span>}
          {v.is_selected && <span className="text-xs text-[#FF6B35] font-medium">✓ 선택됨</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#555]">
          <span>{wordCount}자</span>
          {v.model && <span>{v.model.split("/").pop()}</span>}
          {v.cost_usd > 0 && <span>${v.cost_usd.toFixed(3)}</span>}
        </div>
      </div>

      {/* Body */}
      <div className={`text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed ${full ? "" : maxHeight || "max-h-[300px]"} overflow-y-auto mb-4`}>
        {body || JSON.stringify(v.output, null, 2)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => onScore(s)}
              className={`text-sm cursor-pointer bg-transparent border-none transition-colors ${
                score && s <= score ? "text-yellow-400" : "text-[#333] hover:text-[#555]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {!v.is_selected && (
            <button onClick={onSelect} className="px-3 py-1 rounded-lg border border-[#FF6B35]/30 text-[#FF6B35] text-xs cursor-pointer bg-transparent hover:bg-[#FF6B35]/10">
              선택
            </button>
          )}
          <button onClick={onBranch} className="px-3 py-1 rounded-lg border border-[#4ECDC4]/30 text-[#4ECDC4] text-xs cursor-pointer bg-transparent hover:bg-[#4ECDC4]/10">
            분기
          </button>
        </div>
      </div>
    </div>
  );
}
