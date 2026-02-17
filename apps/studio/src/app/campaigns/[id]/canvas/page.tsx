"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import dynamic from "next/dynamic";
import type { Snapshot, Variant, Atom } from "@/components/campaign/version-canvas/VersionCanvas";

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
        .select("id,atom_id,generation,model,params,output,is_selected,score,created_at")
        .in("atom_id", atomsList.map((a) => a.id));
      setVariants((varsData || []) as Variant[]);
    }

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-[#888]">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
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

      {/* Canvas — takes all remaining space */}
      <div className="flex-1">
        <VersionCanvas
          snapshots={snapshots}
          variants={variants}
          atoms={atoms}
          currentBodyMd={currentBodyMd}
          onSnapshotClick={(snapId) => {
            if (confirm("이 스냅샷으로 복원할까요?")) restoreSnapshot(snapId);
          }}
          onVariantClick={(varId) => {
            const atom = atoms.find((a) =>
              variants.some((v) => v.id === varId && v.atom_id === a.id),
            );
            if (atom) router.push(`/campaigns/${id}/compare/${atom.id}`);
          }}
        />
      </div>
    </div>
  );
}
