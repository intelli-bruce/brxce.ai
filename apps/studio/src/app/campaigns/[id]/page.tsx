"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import GenerateModal from "@/components/campaign/GenerateModal";
import VariantCompare from "@/components/campaign/VariantCompare";
import FactCheckPanel from "@/components/campaign/FactCheckPanel";
import ScheduleModal from "@/components/campaign/ScheduleModal";
import BlockEditor from "@/components/BlockEditor";
import { ProseBody } from "@brxce/ui";
import type { Campaign, CampaignAtom, CampaignVariant, GenerationConfig, FactCheckFlag } from "@/lib/campaign/types";
import IdBadge from "@/components/IdBadge";
import ChannelPreview, { CHANNEL_SPECS } from "@/components/campaign/ChannelPreview";
// VersionCanvas is now a separate page: /campaigns/[id]/canvas

const FUNNEL_COLORS: Record<string, string> = {
  tofu: "bg-green-500/20 text-green-400 border-green-500/30",
  mofu: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bofu: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  ideation: "text-[#888]", seo_research: "text-yellow-500", producing: "text-blue-400",
  fact_check: "text-orange-400", approval: "text-cyan-400", ready: "text-emerald-400",
  scheduled: "text-indigo-400", published: "text-green-400", analyzing: "text-pink-400",
};

const ATOM_STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#333] text-[#888]",
  generating: "bg-yellow-500/20 text-yellow-400",
  comparing: "bg-blue-500/20 text-blue-400",
  selected: "bg-cyan-500/20 text-cyan-400",
  fact_check: "bg-orange-500/20 text-orange-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  scheduled: "bg-indigo-500/20 text-indigo-400",
  published: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const PIPELINE_STAGES = ["pending", "generating", "comparing", "selected", "fact_check", "approved", "scheduled", "published"];

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", newsletter: "📧", brxce_guide: "🦞",
};

const FORMAT_LABELS: Record<string, string> = {
  long_text: "Long", medium_text: "Med", short_text: "Short",
  carousel: "Carousel", image: "Image", video: "Video",
};

const CHANNELS = ["brxce_guide", "newsletter", "threads", "x", "linkedin", "instagram", "youtube"];
const FORMATS = ["long_text", "medium_text", "short_text", "carousel", "image", "video"];

export default function CampaignCockpitPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [atoms, setAtoms] = useState<CampaignAtom[]>([]);
  const [variants, setVariants] = useState<Record<string, CampaignVariant[]>>({});
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addChannel, setAddChannel] = useState("threads");
  const [addFormat, setAddFormat] = useState("short_text");
  const [generateAtom, setGenerateAtom] = useState<CampaignAtom | null>(null);
  const [scheduleAtom, setScheduleAtom] = useState<CampaignAtom | null>(null);
  const [expandedAtom, setExpandedAtom] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState<{ id: string; title: string; slug: string; status: string; category: string; body_md: string } | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(true);
  const [pillarEditMode, setPillarEditMode] = useState(false);
  const [snapshots, setSnapshots] = useState<{ id: string; created_at: string; label: string }[]>([]);
  const [showSnapshots, setShowSnapshots] = useState(false);
  // Version canvas is now a separate full page
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const sb = createSupabaseBrowser();

  const loadData = useCallback(async () => {
    const { data: camp } = await sb.from("campaigns").select("*").eq("id", id).single();
    if (!camp) return;
    setCampaign(camp as Campaign);
    setTitleDraft(camp.title);

    const { data: atomsData } = await sb
      .from("campaign_atoms")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: true });

    const atomsList = (atomsData || []) as CampaignAtom[];
    setAtoms(atomsList);

    // Load source content
    const contentId = camp.source_content_id || atomsList.find(a => a.content_id)?.content_id;
    if (contentId) {
      const { data: content } = await sb
        .from("contents")
        .select("id, title, slug, status, category, body_md")
        .eq("id", contentId)
        .single();
      if (content) setSourceContent(content);
    }

    // Load snapshots for source content
    if (contentId) {
      const { data: snaps } = await sb
        .from("document_snapshots")
        .select("id, created_at, label")
        .eq("content_id", contentId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (snaps) setSnapshots(snaps);
    }

    // Load variants for all atoms
    const atomIds = atomsList.map(a => a.id);
    if (atomIds.length > 0) {
      const { data: variantsData } = await sb
        .from("campaign_variants")
        .select("*")
        .in("atom_id", atomIds)
        .order("generation", { ascending: true });

      const grouped: Record<string, CampaignVariant[]> = {};
      (variantsData || []).forEach((v: CampaignVariant) => {
        if (!grouped[v.atom_id]) grouped[v.atom_id] = [];
        grouped[v.atom_id].push(v);
      });
      setVariants(grouped);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll for generating atoms
  useEffect(() => {
    const hasGenerating = atoms.some(a => a.status === 'generating');
    if (hasGenerating) {
      pollingRef.current = setInterval(() => { loadData(); }, 5000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [atoms, loadData]);

  async function saveTitle() {
    if (!campaign || !titleDraft.trim()) return;
    await sb.from("campaigns").update({ title: titleDraft }).eq("id", campaign.id);
    setCampaign({ ...campaign, title: titleDraft });
    setEditTitle(false);
  }

  async function updateAtomStatus(atomId: string, newStatus: string) {
    await sb.from("campaign_atoms").update({ status: newStatus }).eq("id", atomId);
    setAtoms(prev => prev.map(a => a.id === atomId ? { ...a, status: newStatus as any } : a));
  }

  async function handleGenerate(config: GenerationConfig) {
    if (!generateAtom) return;
    const atomId = generateAtom.id;
    setAtoms(prev => prev.map(a =>
      a.id === atomId ? { ...a, status: 'generating' as any, generation_config: config } : a
    ));
    setGenerateAtom(null);

    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "campaign", atom_id: atomId, config }),
      });
    } catch (e) {
      console.error("Generation trigger failed:", e);
    }
  }

  function handleVariantSelect(atomId: string, variantId: string) {
    setAtoms(prev => prev.map(a =>
      a.id === atomId ? { ...a, status: 'selected' as any, selected_variant_id: variantId } : a
    ));
    loadData();
  }

  async function handleBranch(atomId: string, parentVariantId: string, feedback: string) {
    // generation_config에 base_variant_id + feedback 설정 → generating
    const config: GenerationConfig = {
      variant_count: 2,
      diversity: 'narrow',
      base_variant_id: parentVariantId,
      feedback,
    };
    await sb.from("campaign_atoms").update({
      status: "generating",
      generation_config: config,
    }).eq("id", atomId);

    setAtoms(prev => prev.map(a =>
      a.id === atomId ? { ...a, status: 'generating' as any, generation_config: config } : a
    ));
  }

  async function addAtom() {
    const pillar = atoms.find(a => a.is_pillar);
    await sb.from("campaign_atoms").insert({
      campaign_id: id,
      channel: addChannel,
      format: addFormat,
      status: "pending",
      is_pillar: false,
      pillar_atom_id: pillar?.id || null,
    });
    setShowAddModal(false);
    loadData();
  }

  async function bulkAction(action: "generate" | "approve" | "schedule") {
    if (action === "generate") {
      const pendingIds = atoms.filter(a => a.status === "pending").map(a => a.id);
      if (pendingIds.length === 0) return;
      await sb.from("campaign_atoms").update({ status: "generating" }).in("id", pendingIds);
    } else if (action === "approve") {
      const fcIds = atoms.filter(a => a.status === "fact_check").map(a => a.id);
      if (fcIds.length === 0) return;
      await sb.from("campaign_atoms").update({ status: "approved" }).in("id", fcIds);
    } else if (action === "schedule") {
      const approvedIds = atoms.filter(a => a.status === "approved").map(a => a.id);
      if (approvedIds.length === 0) return;
      await sb.from("campaign_atoms").update({ status: "scheduled", scheduled_at: new Date().toISOString() }).in("id", approvedIds);
    }
    loadData();
  }

  async function saveSnapshot(reason?: string) {
    if (!sourceContent) return;
    await sb.from("document_snapshots").insert({
      content_id: sourceContent.id,
      body_md: sourceContent.body_md,
      label: reason || "manual snapshot",
    });
    loadData();
  }

  async function restoreSnapshot(snapshotId: string) {
    if (!sourceContent) return;
    const { data: snap } = await sb
      .from("document_snapshots")
      .select("body_md")
      .eq("id", snapshotId)
      .single();
    if (!snap?.body_md) return;
    // Save current as snapshot first
    await saveSnapshot("auto: before restore");
    // Restore
    await sb.from("contents").update({
      body_md: snap.body_md,
    }).eq("id", sourceContent.id);
    loadData();
    setPillarEditMode(false);
  }

  function renderVariantCard(atom: CampaignAtom, variant: CampaignVariant) {
    const spec = CHANNEL_SPECS[atom.channel];
    const body = variant.output?.body || variant.output?.text || "";
    const charLen = body.length;
    const charPct = spec ? Math.round((charLen / spec.charLimit) * 100) : 0;
    const isSelected = variant.is_selected;

    return (
      <div
        key={variant.id}
        className={`bg-[#141414] rounded-xl overflow-hidden transition-all ${isSelected ? "border-2 border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.15)]" : "border border-[#222]"}`}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left: Channel mockup preview */}
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-[#222] flex-shrink-0">
            <ChannelPreview channel={atom.channel} variant={variant} />
          </div>

          {/* Right: Meta info */}
          <div className="p-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {isSelected && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-bold">✓ SELECTED</span>}
              {variant.params?.tone && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{variant.params.tone}</span>}
              <IdBadge id={variant.id} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
              <div><span className="text-[#666]">Generation:</span> <span className="text-[#aaa]">#{variant.generation}</span></div>
              <div><span className="text-[#666]">Model:</span> <span className="text-[#aaa]">{variant.model || "—"}</span></div>
              <div><span className="text-[#666]">글자수:</span> <span className={`${charPct > 100 ? "text-red-400 font-bold" : "text-[#aaa]"}`}>{charLen.toLocaleString()}자</span></div>
              <div><span className="text-[#666]">제한 대비:</span> <span className={`${charPct > 100 ? "text-red-400 font-bold" : charPct > 90 ? "text-yellow-400" : "text-[#aaa]"}`}>{charPct}%</span></div>
              {variant.score != null && <div><span className="text-[#666]">Score:</span> <span className="text-[#aaa]">{variant.score}/5</span></div>}
              {variant.cost_tokens > 0 && <div><span className="text-[#666]">Cost:</span> <span className="text-[#aaa]">{variant.cost_tokens.toLocaleString()} tok</span></div>}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {!isSelected && (
                <button
                  onClick={() => handleVariantSelect(atom.id, variant.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs cursor-pointer border-none hover:bg-[#e55a2b]"
                >
                  ✓ 선택
                </button>
              )}
              <button
                onClick={() => {
                  const fb = prompt("피드백 (분기 이유):");
                  if (fb) handleBranch(atom.id, variant.id, fb);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#333] text-[#888] text-xs cursor-pointer bg-transparent hover:text-[#fafafa] hover:border-[#555]"
              >
                🔀 분기
              </button>
              <button
                onClick={() => router.push(`/campaigns/${id}/compare/${atom.id}`)}
                className="px-3 py-1.5 rounded-lg border border-[#333] text-[#4ECDC4] text-xs cursor-pointer bg-transparent hover:border-[#4ECDC4]/50"
              >
                비교 →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAtomCard(atom: CampaignAtom) {
    const atomVariants = variants[atom.id] || [];
    const isExpanded = expandedAtom === atom.id;

    return (
      <div key={atom.id} className="mb-4">
        {/* Atom header */}
        <div
          className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg cursor-pointer hover:bg-[#161616] transition-colors"
          onClick={() => setExpandedAtom(isExpanded ? null : atom.id)}
        >
          <IdBadge id={atom.id} />
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{FORMAT_LABELS[atom.format]}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${ATOM_STATUS_COLORS[atom.status]}`}>{atom.status}</span>
          {atom.status === 'generating' && <span className="text-xs text-yellow-400 animate-pulse">⏳ 생성 중...</span>}
          <span className="text-[10px] text-[#555]">{atomVariants.length}개 variant</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {(atom.status === 'pending' || atom.status === 'selected') && (
              <button onClick={(e) => { e.stopPropagation(); setGenerateAtom(atom); }} className="px-2.5 py-1 rounded-lg bg-[#FF6B35] text-white text-[11px] cursor-pointer border-none hover:bg-[#e55a2b]">🚀 생성</button>
            )}
            {atom.status === 'selected' && (
              <button onClick={(e) => { e.stopPropagation(); updateAtomStatus(atom.id, "fact_check"); }} className="px-2.5 py-1 rounded-lg border border-orange-500/30 text-orange-400 text-[11px] cursor-pointer bg-transparent hover:bg-orange-500/10">📋 팩트체크</button>
            )}
            {atom.status === 'fact_check' && (
              <button onClick={(e) => { e.stopPropagation(); updateAtomStatus(atom.id, "approved"); }} className="px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 text-[11px] cursor-pointer bg-transparent hover:bg-emerald-500/10">✅ 승인</button>
            )}
            {atom.status === 'approved' && (
              <button onClick={(e) => { e.stopPropagation(); setScheduleAtom(atom); }} className="px-2.5 py-1 rounded-lg border border-indigo-500/30 text-indigo-400 text-[11px] cursor-pointer bg-transparent hover:bg-indigo-500/10">📅 스케줄</button>
            )}
            <span className="text-[#555] text-sm">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>

        {/* Expanded: variant cards */}
        {isExpanded && (
          <div className="mt-3 flex flex-col gap-3">
            {atomVariants.length > 0 ? (
              atomVariants.map(v => renderVariantCard(atom, v))
            ) : (
              <div className="p-4 border border-dashed border-[#333] rounded-xl text-center text-xs text-[#555]">
                variant 없음 — 생성하기를 눌러주세요
              </div>
            )}
            {atom.fact_check_flags && atom.fact_check_flags.length > 0 && (
              <FactCheckPanel atomId={atom.id} flags={atom.fact_check_flags} onUpdate={(flags) => { setAtoms(prev => prev.map(a => a.id === atom.id ? { ...a, fact_check_flags: flags } : a)); }} />
            )}
            {atom.error_log && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-400">{atom.error_log}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!campaign) return <div className="text-[#888]">Loading...</div>;

  // Pipeline stats
  const pipelineCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach(s => { pipelineCounts[s] = atoms.filter(a => a.status === s).length; });
  const totalAtoms = atoms.length || 1;

  return (
    <div>
      {/* Meta header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveTitle()}
                className="text-2xl font-bold bg-transparent border-b border-[#555] outline-none text-[#fafafa]"
                autoFocus
              />
              <button onClick={saveTitle} className="text-xs text-[#4ECDC4] bg-transparent border-none cursor-pointer">✓</button>
              <button onClick={() => { setEditTitle(false); setTitleDraft(campaign.title); }} className="text-xs text-[#888] bg-transparent border-none cursor-pointer">✗</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold cursor-pointer hover:text-[#FF6B35] transition-colors" onClick={() => setEditTitle(true)}>
                {campaign.title}
              </h1>
              <IdBadge id={campaign.id} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-xs border ${FUNNEL_COLORS[campaign.funnel_stage]}`}>
            {campaign.funnel_stage.toUpperCase()}
          </span>
          <select
            value={campaign.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              await sb.from("campaigns").update({ status: newStatus }).eq("id", campaign.id);
              setCampaign({ ...campaign, status: newStatus as any });
            }}
            style={{ WebkitAppearance: "menulist" }}
            className={`text-sm font-medium bg-[#1a1a1a] border border-[#444] rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-[#666] transition-colors ${STATUS_COLORS[campaign.status]}`}
          >
            {["ideation","seo_research","producing","fact_check","approval","ready","scheduled","published","analyzing"].map(s => (
              <option key={s} value={s} style={{ backgroundColor: "#1a1a1a", color: "#ccc", padding: "8px" }}>{s}</option>
            ))}
          </select>
          {campaign.cta_type && <span className="text-xs text-[#666]">CTA: {campaign.cta_type}</span>}
          {campaign.cta_target && (
            <a href={campaign.cta_target} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4ECDC4] no-underline hover:underline">
              🔗 {campaign.cta_target}
            </a>
          )}
          {campaign.total_cost_usd > 0 && (
            <span className="text-xs text-[#888]">💰 {campaign.total_cost_tokens.toLocaleString()} tok · ${campaign.total_cost_usd.toFixed(2)}</span>
          )}
        </div>
        {campaign.topic && (
          <div className="text-sm text-[#888] mt-2">주제: {campaign.topic}</div>
        )}
        {campaign.brief && (
          <div className="text-xs text-[#666] mt-1 max-w-2xl">📋 {campaign.brief}</div>
        )}
        {campaign.seo_keywords && campaign.seo_keywords.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {campaign.seo_keywords.map((kw, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#222] text-[#888]">🔍 {kw}</span>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline bar */}
      <div className="mb-6 p-4 bg-[#141414] border border-[#222] rounded-xl">
        <div className="text-xs text-[#888] mb-2">파이프라인</div>
        <div className="flex rounded-lg overflow-hidden h-6">
          {PIPELINE_STAGES.map(stage => {
            const count = pipelineCounts[stage];
            if (count === 0) return null;
            const width = (count / totalAtoms) * 100;
            const colorClass = ATOM_STATUS_COLORS[stage] || "bg-[#333]";
            return (
              <div
                key={stage}
                className={`flex items-center justify-center text-[10px] font-medium ${colorClass}`}
                style={{ width: `${width}%` }}
                title={`${stage}: ${count}`}
              >
                {width > 8 ? `${stage} ${count}` : count}
              </div>
            );
          })}
          {atoms.length === 0 && <div className="flex-1 bg-[#222] flex items-center justify-center text-xs text-[#555]">콘텐츠 없음</div>}
        </div>
      </div>

      {/* Pillar Content — inline full view */}
      {sourceContent && (
        <div className="mb-6 bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">📝 Pillar 콘텐츠</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${sourceContent.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {sourceContent.status}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{sourceContent.category}</span>
                <span className="text-[10px] text-[#555]">{sourceContent.body_md.length.toLocaleString()}자</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSnapshots(!showSnapshots)}
                  className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
                >
                  📋 히스토리 ({snapshots.length})
                </button>
                <button
                  onClick={() => router.push(`/campaigns/${id}/canvas`)}
                  className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
                >
                  🗺️ 캔버스
                </button>
                <button
                  onClick={() => saveSnapshot("manual")}
                  className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
                >
                  💾 스냅샷
                </button>
                <button
                  onClick={() => {
                    if (!pillarEditMode) saveSnapshot("auto: before edit");
                    setPillarEditMode(!pillarEditMode);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer ${pillarEditMode ? 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/10' : 'border-[#333] text-[#4ECDC4] bg-transparent hover:border-[#4ECDC4]/30'}`}
                >
                  {pillarEditMode ? '✏️ 편집 중' : '✏️ 편집'}
                </button>
                <button
                  onClick={() => setShowContentPreview(!showContentPreview)}
                  className="text-xs text-[#555] bg-transparent border-none cursor-pointer hover:text-[#888]"
                >
                  {showContentPreview ? '▼' : '▶'}
                </button>
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#fafafa]">{sourceContent.title}</h2>
          </div>

          {/* Snapshot history panel */}
          {showSnapshots && (
            <div className="border-b border-[#222] p-4 bg-[#0f0f0f]">
              <div className="text-xs font-medium text-[#888] mb-2">스냅샷 히스토리</div>
              {snapshots.length === 0 ? (
                <div className="text-xs text-[#555]">스냅샷 없음</div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {snapshots.map(s => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#666]">{new Date(s.created_at).toLocaleString("ko-KR")}</span>
                        <span className="text-[#555]">{s.label || ""}</span>
                      </div>
                      <button
                        onClick={() => { if (confirm("이 스냅샷으로 복원할까요?")) restoreSnapshot(s.id); }}
                        className="text-[#4ECDC4] bg-transparent border-none cursor-pointer hover:underline"
                      >
                        복원
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content body */}
          {showContentPreview && (
            <div className="p-6">
              {pillarEditMode ? (
                <BlockEditor
                  contentId={sourceContent.id}
                  bodyMd={sourceContent.body_md}
                  onBodySync={(md) => {
                    setSourceContent({ ...sourceContent, body_md: md });
                  }}
                />
              ) : (
                <ProseBody content={sourceContent.body_md} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Pillar / Derivative sections */}
      {(() => {
        const pillarAtom = atoms.find(a => a.is_pillar);
        const derivatives = atoms.filter(a => !a.is_pillar && a.pillar_atom_id);
        const otherAtoms = atoms.filter(a => !a.is_pillar && !a.pillar_atom_id);
        const pillarReady = pillarAtom && ['selected','fact_check','approved','scheduled','published'].includes(pillarAtom.status);
        return (<>
          {/* Pillar atom status — compact, no variants */}
          {pillarAtom && (
            <div className="mb-6">
              <div className="flex items-center gap-3 p-3 bg-[#141414] border border-[#222] rounded-xl">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="text-xs font-medium text-[#3B82F6]">PILLAR</span>
                <span className="text-xs text-[#888]">{CHANNEL_ICONS[pillarAtom.channel]} {pillarAtom.channel} · {FORMAT_LABELS[pillarAtom.format]}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${ATOM_STATUS_COLORS[pillarAtom.status]}`}>{pillarAtom.status}</span>
                <div className="flex-1" />
                {pillarAtom.status === 'selected' && (
                  <button onClick={() => updateAtomStatus(pillarAtom.id, "fact_check")} className="px-2.5 py-1 rounded-lg border border-orange-500/30 text-orange-400 text-[11px] cursor-pointer bg-transparent hover:bg-orange-500/10">📋 팩트체크</button>
                )}
                {pillarAtom.status === 'fact_check' && (
                  <button onClick={() => updateAtomStatus(pillarAtom.id, "approved")} className="px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 text-[11px] cursor-pointer bg-transparent hover:bg-emerald-500/10">✅ 승인</button>
                )}
                {pillarAtom.status === 'approved' && (
                  <button onClick={() => setScheduleAtom(pillarAtom)} className="px-2.5 py-1 rounded-lg border border-indigo-500/30 text-indigo-400 text-[11px] cursor-pointer bg-transparent hover:bg-indigo-500/10">📅 스케줄</button>
                )}
              </div>
            </div>
          )}

          {/* Derivative section — channel-grouped */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Derivatives
              <span className="text-[#555] normal-case font-normal">— Pillar에서 파생</span>
              {!pillarReady && <span className="text-[10px] text-yellow-500 font-normal">(Pillar 확정 후 생성 가능)</span>}
            </div>

            {derivatives.length > 0 ? (() => {
              // Group by channel
              const channelGroups: Record<string, CampaignAtom[]> = {};
              derivatives.forEach(a => {
                if (!channelGroups[a.channel]) channelGroups[a.channel] = [];
                channelGroups[a.channel].push(a);
              });

              return (
                <div className="flex flex-col gap-6">
                  {Object.entries(channelGroups).map(([channel, channelAtoms]) => {
                    const spec = CHANNEL_SPECS[channel];
                    const totalVariants = channelAtoms.reduce((sum, a) => sum + (variants[a.id]?.length || 0), 0);
                    const statusCounts: Record<string, number> = {};
                    channelAtoms.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

                    return (
                      <div key={channel} className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
                        {/* Channel group header */}
                        <div className="p-4 border-b border-[#222]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{CHANNEL_ICONS[channel] || "📄"}</span>
                              <span className="text-sm font-bold text-[#fafafa] capitalize">{channel}</span>
                              <span className="text-[10px] text-[#666]">{channelAtoms.length}개 atom · {totalVariants}개 variant</span>
                              {/* Status badges */}
                              <div className="flex gap-1">
                                {Object.entries(statusCounts).map(([st, cnt]) => (
                                  <span key={st} className={`text-[10px] px-1.5 py-0.5 rounded ${ATOM_STATUS_COLORS[st]}`}>
                                    {st} {cnt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Channel spec summary */}
                          {spec && (
                            <div className="mt-2 flex gap-4 text-[10px] text-[#555]">
                              <span>📝 {spec.charLimit.toLocaleString()}자</span>
                              <span>🖼 {spec.imageRatio} ({spec.imagePx})</span>
                              <span>📎 최대 {spec.maxImages}장</span>
                            </div>
                          )}
                        </div>

                        {/* Atoms within this channel */}
                        <div className="p-4">
                          {channelAtoms.map(atom => renderAtomCard(atom))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
              <div className="p-4 border border-dashed border-[#333] rounded-xl text-center">
                <span className="text-xs text-[#555]">
                  {pillarReady ? "파생 콘텐츠를 추가하세요" : "Pillar 확정 후 파생 생성 가능"}
                </span>
              </div>
            )}
          </div>

          {/* Other atoms (legacy, no pillar link) */}
          {otherAtoms.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#888] mb-2">기타 콘텐츠</div>
              <div className="flex flex-col gap-3">
                {otherAtoms.map(atom => renderAtomCard(atom))}
              </div>
            </div>
          )}
        </>);
      })()}

      {/* Bottom action bar */}
      <div className="flex items-center gap-3 p-4 bg-[#141414] border border-[#222] rounded-xl sticky bottom-4">
        {(() => {
          const pillar = atoms.find(a => a.is_pillar);
          const pillarReady = pillar && ['selected','fact_check','approved','scheduled','published'].includes(pillar.status);
          return (<>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!pillarReady}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer ${pillarReady ? 'bg-[#06B6D4] text-white hover:bg-[#0891b2]' : 'bg-[#333] text-[#666] cursor-not-allowed'}`}
              title={pillarReady ? "파생 콘텐츠 추가" : "Pillar 확정 후 추가 가능"}
            >
              + 파생 추가
            </button>
          </>);
        })()}
        <button
          onClick={() => router.push(`/campaigns/${id}/canvas`)}
          className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa] hover:border-[#555]"
        >
          🎨 캔버스
        </button>
        <button onClick={() => bulkAction("generate")} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa] hover:border-[#555]">
          전체 생성
        </button>
        <button onClick={() => bulkAction("approve")} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa] hover:border-[#555]">
          전체 승인
        </button>
        <button onClick={() => bulkAction("schedule")} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa] hover:border-[#555]">
          스케줄 발행
        </button>
      </div>

      {/* Generate modal */}
      {generateAtom && (
        <GenerateModal
          atomId={generateAtom.id}
          channel={generateAtom.channel}
          format={generateAtom.format}
          onGenerate={handleGenerate}
          onClose={() => setGenerateAtom(null)}
        />
      )}

      {/* Schedule modal */}
      {scheduleAtom && (
        <ScheduleModal
          atomId={scheduleAtom.id}
          channel={scheduleAtom.channel}
          onSchedule={async (scheduledAt) => {
            await sb.from("campaign_atoms").update({ status: "scheduled", scheduled_at: scheduledAt }).eq("id", scheduleAtom.id);
            setScheduleAtom(null);
            loadData();
          }}
          onClose={() => setScheduleAtom(null)}
        />
      )}

      {/* Add atom modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">파생 콘텐츠 추가</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-1.5">채널</label>
                <select value={addChannel} onChange={e => setAddChannel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
                  {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-1.5">포맷</label>
                <select value={addFormat} onChange={e => setAddFormat(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
                  {FORMATS.map(f => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={addAtom} className="flex-1 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-medium border-none cursor-pointer hover:bg-[#e55a2b]">추가</button>
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#888] text-sm cursor-pointer hover:text-[#fafafa]">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
