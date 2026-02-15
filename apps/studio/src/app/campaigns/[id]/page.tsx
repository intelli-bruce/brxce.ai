"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Campaign {
  id: string;
  title: string;
  topic: string;
  brief: string | null;
  funnel_stage: string;
  status: string;
  cta_type: string;
  cta_target: string | null;
  origin_direction: string;
  total_cost_tokens: number;
  total_cost_usd: number;
  series_id: string | null;
}

interface Atom {
  id: string;
  campaign_id: string;
  format: string;
  channel: string;
  status: string;
  publish_method: string;
  optimal_publish_time: string | null;
  scheduled_at: string | null;
  selected_variant_id: string | null;
  variant_preview?: string;
}

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
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addChannel, setAddChannel] = useState("threads");
  const [addFormat, setAddFormat] = useState("short_text");

  const loadData = useCallback(async () => {
    const sb = createSupabaseBrowser();
    const { data: camp } = await sb.from("campaigns").select("*").eq("id", id).single();
    if (!camp) return;
    setCampaign(camp);
    setTitleDraft(camp.title);

    const { data: atomsData } = await sb
      .from("campaign_atoms")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: true });

    // Get selected variant previews
    const atomsList = atomsData || [];
    const variantIds = atomsList.filter(a => a.selected_variant_id).map(a => a.selected_variant_id);
    let variantMap: Record<string, string> = {};
    if (variantIds.length > 0) {
      const { data: variants } = await sb
        .from("campaign_variants")
        .select("id, output")
        .in("id", variantIds);
      (variants || []).forEach(v => {
        const output = v.output as any;
        variantMap[v.id] = output?.text?.substring(0, 100) || output?.title || "—";
      });
    }

    setAtoms(atomsList.map(a => ({
      ...a,
      variant_preview: a.selected_variant_id ? variantMap[a.selected_variant_id] : undefined,
    })));
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveTitle() {
    if (!campaign || !titleDraft.trim()) return;
    const sb = createSupabaseBrowser();
    await sb.from("campaigns").update({ title: titleDraft }).eq("id", campaign.id);
    setCampaign({ ...campaign, title: titleDraft });
    setEditTitle(false);
  }

  async function updateAtomStatus(atomId: string, newStatus: string) {
    const sb = createSupabaseBrowser();
    await sb.from("campaign_atoms").update({ status: newStatus }).eq("id", atomId);
    setAtoms(prev => prev.map(a => a.id === atomId ? { ...a, status: newStatus } : a));
  }

  async function addAtom() {
    const sb = createSupabaseBrowser();
    await sb.from("campaign_atoms").insert({
      campaign_id: id,
      channel: addChannel,
      format: addFormat,
      status: "pending",
    });
    setShowAddModal(false);
    loadData();
  }

  async function bulkAction(action: "generate" | "approve" | "schedule") {
    const sb = createSupabaseBrowser();
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
            <h1 className="text-2xl font-bold cursor-pointer hover:text-[#FF6B35] transition-colors" onClick={() => setEditTitle(true)}>
              {campaign.title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-xs border ${FUNNEL_COLORS[campaign.funnel_stage]}`}>
            {campaign.funnel_stage.toUpperCase()}
          </span>
          <span className={`text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>{campaign.status}</span>
          {campaign.cta_type && <span className="text-xs text-[#666]">CTA: {campaign.cta_type}</span>}
          {campaign.cta_target && (
            <a href={campaign.cta_target} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4ECDC4] no-underline hover:underline">
              🔗 {campaign.cta_target}
            </a>
          )}
          {campaign.total_cost_usd > 0 && (
            <span className="text-xs text-[#888]">💰 {campaign.total_cost_tokens.toLocaleString()} tokens (${campaign.total_cost_usd.toFixed(2)})</span>
          )}
        </div>
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
          {atoms.length === 0 && <div className="flex-1 bg-[#222] flex items-center justify-center text-xs text-[#555]">atom 없음</div>}
        </div>
      </div>

      {/* Atom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {atoms.map(atom => (
          <div key={atom.id} className="p-4 bg-[#141414] border border-[#222] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CHANNEL_ICONS[atom.channel] || "📄"}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{FORMAT_LABELS[atom.format] || atom.format}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${ATOM_STATUS_COLORS[atom.status]}`}>
                {atom.status}
              </span>
            </div>

            {atom.variant_preview && (
              <div className="text-xs text-[#888] mb-2 line-clamp-2">{atom.variant_preview}</div>
            )}

            <div className="flex items-center justify-between text-xs text-[#555] mb-3">
              {atom.optimal_publish_time && (
                <span>🕐 {new Date(atom.optimal_publish_time).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              )}
              <span>{atom.publish_method === "auto" ? "🤖 자동" : "📋 수동"}</span>
            </div>

            <div className="flex gap-2">
              {atom.status === "pending" && (
                <ActionBtn label="생성하기" onClick={() => updateAtomStatus(atom.id, "generating")} />
              )}
              {atom.status === "selected" && (
                <ActionBtn label="팩트체크" onClick={() => updateAtomStatus(atom.id, "fact_check")} />
              )}
              {atom.status === "fact_check" && (
                <ActionBtn label="승인" color="emerald" onClick={() => updateAtomStatus(atom.id, "approved")} />
              )}
              {atom.status === "approved" && (
                <ActionBtn label="스케줄" color="indigo" onClick={() => updateAtomStatus(atom.id, "scheduled")} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center gap-3 p-4 bg-[#141414] border border-[#222] rounded-xl sticky bottom-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-medium border-none cursor-pointer hover:bg-[#e55a2b]"
        >
          + Atom 추가
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

      {/* Add atom modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Atom 추가</h3>
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

function ActionBtn({ label, color, onClick }: { label: string; color?: string; onClick: () => void }) {
  const colorClasses = color === "emerald"
    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    : color === "indigo"
    ? "border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
    : "border-[#444] text-[#aaa] hover:bg-[#222]";
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-lg border text-xs cursor-pointer bg-transparent transition-colors ${colorClasses}`}>
      {label}
    </button>
  );
}
