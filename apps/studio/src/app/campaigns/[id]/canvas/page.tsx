"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import dynamic from "next/dynamic";
import type { Snapshot, Variant, Atom, MediaAsset } from "@/components/campaign/version-canvas/VersionCanvas";

const VersionCanvas = dynamic(
  () => import("@/components/campaign/version-canvas/VersionCanvas"),
  { ssr: false },
);

export default function CampaignCanvasPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sb = createSupabaseBrowser();

  const [title, setTitle] = useState("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [currentBodyMd, setCurrentBodyMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const load = useCallback(async () => {
    // Campaign
    const { data: camp } = await sb.from("campaigns").select("title,source_content_id").eq("id", id).single();
    if (!camp) return;
    setTitle(camp.title);

    // Source content body
    if (camp.source_content_id) {
      const { data: content } = await sb.from("contents").select("body_md").eq("id", camp.source_content_id).single();
      if (content) setCurrentBodyMd(content.body_md || "");

      // Snapshots
      const { data: snaps } = await sb
        .from("document_snapshots")
        .select("id,label,body_md,created_at")
        .eq("content_id", camp.source_content_id)
        .order("created_at", { ascending: true });
      setSnapshots((snaps || []) as Snapshot[]);
    }

    // Atoms
    const { data: atomsData } = await sb
      .from("campaign_atoms")
      .select("id,channel,format,is_pillar")
      .eq("campaign_id", id);
    const atomsList = (atomsData || []) as Atom[];
    setAtoms(atomsList);

    // Variants for all atoms
    if (atomsList.length > 0) {
      const { data: varsData } = await sb
        .from("campaign_variants")
        .select("id,atom_id,generation,model,params,output,is_selected,score,created_at,parent_variant_ids")
        .in("atom_id", atomsList.map((a) => a.id));
      setVariants((varsData || []) as Variant[]);
    }

    // Media assets for this campaign
    const { data: mediaData } = await sb
      .from("media_assets")
      .select("id,storage_url,file_name,asset_type,campaign_id,content_id,source_atom_id")
      .eq("campaign_id", id);
    setMediaAssets((mediaData || []) as MediaAsset[]);

    setLoading(false);
  }, [id, sb]);

  useEffect(() => { load(); }, []);

  const restoreSnapshot = async (snapId: string) => {
    const { data: snap } = await sb.from("document_snapshots").select("body_md").eq("id", snapId).single();
    if (!snap?.body_md) return;
    // Find source_content_id
    const { data: camp } = await sb.from("campaigns").select("source_content_id").eq("id", id).single();
    if (!camp?.source_content_id) return;
    await sb.from("contents").update({ body_md: snap.body_md }).eq("id", camp.source_content_id);
    await sb.from("content_blocks").delete().eq("content_id", camp.source_content_id);
    setCurrentBodyMd(snap.body_md);
  };

  // Hide sidebar for full-screen canvas
  useEffect(() => {
    const sidebar = document.querySelector("aside");
    const main = sidebar?.nextElementSibling as HTMLElement | null;
    if (sidebar) sidebar.style.display = "none";
    if (main) main.style.marginLeft = "0";
    return () => {
      if (sidebar) sidebar.style.display = "";
      if (main) main.style.marginLeft = "";
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414] text-[#888] fixed inset-0 z-50">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#141414] fixed inset-0 z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
          >
            ← 콕핏
          </button>
          <span className="text-sm font-semibold text-[#fafafa]">{title}</span>
          <span className="text-[10px] text-[#555]">
            {snapshots.length} snapshots · {variants.length} variants · {atoms.length} atoms
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#555]">
          <span>📸 스냅샷</span>
          <span className="w-3 h-3 rounded-sm bg-[#FF6B35] inline-block" />
          <span>🧬 variant</span>
          <span className="w-3 h-3 rounded-sm bg-[#4ECDC4] inline-block" />
          <span>💬 메타</span>
          <span className="w-3 h-3 rounded-sm bg-[#666] inline-block" />
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1">
          <VersionCanvas
            snapshots={snapshots}
            variants={variants}
            atoms={atoms}
            mediaAssets={mediaAssets}
            currentBodyMd={currentBodyMd}
            onSnapshotClick={(snapId) => {
              const snap = snapshots.find(s => s.id === snapId);
              setSelectedSnapshot(snap || null);
              setSelectedVariant(null);
            }}
            onVariantClick={(varId) => {
              const v = variants.find(v => v.id === varId);
              setSelectedVariant(v || null);
              setSelectedSnapshot(null);
            }}
          />
        </div>

        {/* Inspector Panel */}
        {(selectedVariant || selectedSnapshot) && (
          <div className="w-[400px] border-l border-[#222] bg-[#0f0f0f] overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#222]">
              <span className="text-xs font-semibold text-[#fafafa]">
                {selectedVariant ? "🧬 Variant" : "📸 스냅샷"}
              </span>
              <button
                onClick={() => { setSelectedVariant(null); setSelectedSnapshot(null); }}
                className="text-xs text-[#666] bg-transparent border-none cursor-pointer hover:text-[#fafafa]"
              >
                ✕
              </button>
            </div>

            {selectedVariant && (() => {
              const atom = atoms.find(a => a.id === selectedVariant.atom_id);
              const body = selectedVariant.output?.body || selectedVariant.output?.text || "";
              return (
                <div className="p-4 space-y-4">
                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-bold">G{selectedVariant.generation}</span>
                    <span className="px-2 py-0.5 rounded bg-[#222] text-[#888]">{atom?.channel}</span>
                    <span className="px-2 py-0.5 rounded bg-[#222] text-[#888]">{atom?.format}</span>
                    {selectedVariant.is_selected && <span className="px-2 py-0.5 rounded bg-[#4ECDC4] text-black font-bold">선택됨</span>}
                    {selectedVariant.params?.tone && <span className="px-2 py-0.5 rounded bg-[#222] text-[#888]">{selectedVariant.params.tone}</span>}
                  </div>
                  <div className="text-[10px] text-[#555] space-y-1">
                    <div>모델: {selectedVariant.model || "—"}</div>
                    <div>ID: <span className="font-mono">{selectedVariant.id}</span></div>
                    <div>{new Date(selectedVariant.created_at).toLocaleString("ko-KR")}</div>
                    {selectedVariant.score != null && <div>점수: {"★".repeat(selectedVariant.score)}{"☆".repeat(5 - selectedVariant.score)}</div>}
                  </div>
                  {/* Full body */}
                  <div className="bg-[#141414] rounded-lg p-3 border border-[#222]">
                    <div className="text-[10px] text-[#666] mb-2">{body.length}자</div>
                    <div className="text-[12px] text-[#e0e0e0] whitespace-pre-wrap leading-relaxed">
                      {body || "콘텐츠 없음"}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const atomObj = atoms.find(a => a.id === selectedVariant.atom_id);
                        if (atomObj) router.push(`/campaigns/${id}/compare/${atomObj.id}`);
                      }}
                      className="flex-1 text-xs py-2 rounded-lg border border-[#333] text-[#4ECDC4] bg-transparent cursor-pointer hover:bg-[#4ECDC4]/10"
                    >
                      비교 페이지 →
                    </button>
                  </div>
                </div>
              );
            })()}

            {selectedSnapshot && (
              <div className="p-4 space-y-4">
                <div className="text-[10px] text-[#555] space-y-1">
                  <div>라벨: {selectedSnapshot.label || "—"}</div>
                  <div>ID: <span className="font-mono">{selectedSnapshot.id}</span></div>
                  <div>{new Date(selectedSnapshot.created_at).toLocaleString("ko-KR")}</div>
                </div>
                <div className="bg-[#141414] rounded-lg p-3 border border-[#222]">
                  <div className="text-[10px] text-[#666] mb-2">{(selectedSnapshot.body_md || "").length}자</div>
                  <div className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap leading-relaxed line-clamp-[30]">
                    {selectedSnapshot.body_md || "내용 없음"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (confirm("이 스냅샷으로 복원할까요?")) restoreSnapshot(selectedSnapshot.id); }}
                    className="flex-1 text-xs py-2 rounded-lg border border-[#FF6B35]/30 text-[#FF6B35] bg-transparent cursor-pointer hover:bg-[#FF6B35]/10"
                  >
                    이 버전으로 복원
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
