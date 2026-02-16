"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import GenerateModal from "@/components/campaign/GenerateModal";
import VariantCompare from "@/components/campaign/VariantCompare";
import FactCheckPanel from "@/components/campaign/FactCheckPanel";
import ScheduleModal from "@/components/campaign/ScheduleModal";
import type { Campaign, CampaignAtom, CampaignVariant, GenerationConfig, FactCheckFlag } from "@/lib/campaign/types";
import IdBadge from "@/components/IdBadge";

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
  const [showContentPreview, setShowContentPreview] = useState(false);
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

  function renderAtomCard(atom: CampaignAtom) {
    const atomVariants = variants[atom.id] || [];
    const isExpanded = expandedAtom === atom.id;
    const selectedVariant = atomVariants.find(v => v.is_selected);

    return (
      <div key={atom.id} className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
        <div className="p-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => setExpandedAtom(isExpanded ? null : atom.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{CHANNEL_ICONS[atom.channel] || "📄"}</span>
              <span className="text-sm font-medium text-[#fafafa]">{atom.channel}</span>
              <IdBadge id={atom.id} />
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{FORMAT_LABELS[atom.format]}</span>
              {atom.is_pillar && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#3B82F6] font-medium">PILLAR</span>}
              <span className={`text-xs px-2 py-0.5 rounded ${ATOM_STATUS_COLORS[atom.status]}`}>{atom.status}</span>
              {atom.status === 'generating' && <span className="text-xs text-yellow-400 animate-pulse">⏳ 생성 중...</span>}
              {atomVariants.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); router.push(`/campaigns/${id}/compare/${atom.id}`); }} className="text-xs text-[#4ECDC4] bg-transparent border-none cursor-pointer hover:underline">
                  {atomVariants.length}개 variant →
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedVariant && (
                <span className="text-xs text-[#888] max-w-[200px] truncate">
                  {selectedVariant.output?.body?.substring(0, 50)}...
                </span>
              )}
              <span className="text-xs text-[#555]">{atom.publish_method === "auto" ? "🤖" : "📋"}</span>
              <span className="text-[#555] text-sm">{isExpanded ? '▼' : '▶'}</span>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="border-t border-[#222] p-4">
            <div className="flex gap-2 mb-4">
              {(atom.status === 'pending' || atom.status === 'selected') && (
                <button onClick={(e) => { e.stopPropagation(); setGenerateAtom(atom); }} className="px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs cursor-pointer border-none hover:bg-[#e55a2b]">🚀 생성하기</button>
              )}
              {atom.status === 'selected' && (
                <button onClick={() => updateAtomStatus(atom.id, "fact_check")} className="px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 text-xs cursor-pointer bg-transparent hover:bg-orange-500/10">📋 팩트체크</button>
              )}
              {atom.status === 'fact_check' && (
                <button onClick={() => updateAtomStatus(atom.id, "approved")} className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 text-xs cursor-pointer bg-transparent hover:bg-emerald-500/10">✅ 승인</button>
              )}
              {atom.status === 'approved' && (
                <button onClick={() => setScheduleAtom(atom)} className="px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 text-xs cursor-pointer bg-transparent hover:bg-indigo-500/10">📅 스케줄</button>
              )}
            </div>
            {atomVariants.length > 0 && (
              <div className="mb-4">
                <VariantCompare variants={atomVariants} atomId={atom.id} onSelect={(vid) => handleVariantSelect(atom.id, vid)} onBranch={(vid, feedback) => handleBranch(atom.id, vid, feedback)} />
              </div>
            )}
            {atom.fact_check_flags && atom.fact_check_flags.length > 0 && (
              <FactCheckPanel atomId={atom.id} flags={atom.fact_check_flags} onUpdate={(flags) => { setAtoms(prev => prev.map(a => a.id === atom.id ? { ...a, fact_check_flags: flags } : a)); }} />
            )}
            {atom.error_log && (
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-400">{atom.error_log}</div>
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

      {/* Source content */}
      {sourceContent && (
        <div className="mb-6 p-4 bg-[#141414] border border-[#222] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#555]">원본 콘텐츠</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${sourceContent.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {sourceContent.status}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{sourceContent.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowContentPreview(!showContentPreview)}
                className="text-xs text-[#4ECDC4] bg-transparent border-none cursor-pointer hover:underline"
              >
                {showContentPreview ? '접기' : '미리보기'}
              </button>
              <button
                onClick={() => router.push(`/contents/${sourceContent.id}`)}
                className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
              >
                편집 →
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[#fafafa]">{sourceContent.title}</span>
            <IdBadge id={sourceContent.id} />
          </div>
          <div className="text-xs text-[#666]">{sourceContent.body_md.length.toLocaleString()}자 · {sourceContent.slug}</div>
          {showContentPreview && (
            <div className="mt-3 p-3 bg-[#0a0a0a] border border-[#222] rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs text-[#999] whitespace-pre-wrap font-sans leading-relaxed">{sourceContent.body_md.substring(0, 2000)}{sourceContent.body_md.length > 2000 ? '\n\n... (더보기는 편집에서)' : ''}</pre>
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
          {/* Pillar section */}
          {pillarAtom && (
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                Pillar Content
                <span className="text-[#555] normal-case font-normal">— 기준 콘텐츠 (먼저 확정)</span>
              </div>
              <div className="border-l-2 border-[#3B82F6]/30 pl-4">
                {renderAtomCard(pillarAtom)}
              </div>
            </div>
          )}

          {/* Derivative section */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Derivatives
              <span className="text-[#555] normal-case font-normal">— Pillar에서 파생</span>
              {!pillarReady && <span className="text-[10px] text-yellow-500 font-normal">(Pillar 확정 후 생성 가능)</span>}
            </div>
            <div className="border-l-2 border-[#06B6D4]/30 pl-4">
              {derivatives.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {derivatives.map(atom => renderAtomCard(atom))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-[#333] rounded-xl text-center">
                  <span className="text-xs text-[#555]">
                    {pillarReady ? "파생 콘텐츠를 추가하세요" : "Pillar 확정 후 파생 생성 가능"}
                  </span>
                </div>
              )}
            </div>
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
