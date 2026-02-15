"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { CampaignAtom, CampaignVariant } from "@/lib/campaign/types";

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", newsletter: "📧", brxce_guide: "🦞",
};

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [atoms, setAtoms] = useState<(CampaignAtom & { variants: CampaignVariant[] })[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const sb = createSupabaseBrowser();

  useEffect(() => {
    async function load() {
      const { data: atomsData } = await sb.from("campaign_atoms").select("*").eq("campaign_id", id);
      if (!atomsData) return;
      const atomIds = atomsData.map(a => a.id);
      const { data: vars } = await sb.from("campaign_variants").select("*").in("atom_id", atomIds).order("generation");

      const enriched = atomsData.map(a => ({
        ...a as CampaignAtom,
        variants: ((vars || []) as CampaignVariant[]).filter(v => v.atom_id === a.id),
      }));
      setAtoms(enriched);
    }
    load();
  }, [id]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handleMouseUp() { setDragging(false); }

  // Group atoms: visual (carousel/image/video) vs text
  const visualAtoms = atoms.filter(a => ["carousel", "image", "video"].includes(a.format));
  const textAtoms = atoms.filter(a => ["long_text", "medium_text", "short_text"].includes(a.format));

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#0c0c0c] shrink-0">
        <button onClick={() => router.push(`/campaigns/${id}`)} className="text-xs text-[#888] bg-transparent border-none cursor-pointer hover:text-[#fafafa]">
          ← 콕핏으로
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="px-2 py-1 rounded border border-[#333] bg-[#0a0a0a] text-[#888] text-xs cursor-pointer">+</button>
          <span className="text-xs text-[#888]">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="px-2 py-1 rounded border border-[#333] bg-[#0a0a0a] text-[#888] text-xs cursor-pointer">−</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 rounded border border-[#333] bg-[#0a0a0a] text-[#888] text-xs cursor-pointer">리셋</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-[#080808] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            padding: "40px",
          }}
        >
          {/* Visual atoms row */}
          {visualAtoms.length > 0 && (
            <div className="mb-8">
              <div className="text-xs text-[#555] uppercase mb-3">비주얼</div>
              <div className="flex gap-6 flex-wrap">
                {visualAtoms.map(atom => (
                  <div key={atom.id} className="flex gap-3">
                    {atom.variants.map(v => (
                      <div
                        key={v.id}
                        className={`w-[200px] bg-[#141414] border rounded-xl overflow-hidden cursor-pointer hover:border-[#444] transition-colors ${
                          v.is_selected ? "border-[#FF6B35]" : "border-[#222]"
                        }`}
                        onClick={() => router.push(`/campaigns/${id}/compare/${atom.id}`)}
                      >
                        <div className="aspect-[4/5] bg-[#0a0a0a] flex items-center justify-center">
                          <span className="text-2xl opacity-20">{CHANNEL_ICONS[atom.channel]}</span>
                        </div>
                        <div className="p-2">
                          <div className="text-[10px] text-[#888]">G{v.generation} · {v.params?.template || atom.format}</div>
                          {v.is_selected && <div className="text-[10px] text-[#FF6B35]">✓ 선택됨</div>}
                        </div>
                      </div>
                    ))}
                    {atom.variants.length === 0 && (
                      <div className="w-[200px] aspect-[4/5] bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl flex items-center justify-center">
                        <span className="text-xs text-[#555]">{CHANNEL_ICONS[atom.channel]} 생성 전</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text atoms row */}
          {textAtoms.length > 0 && (
            <div>
              <div className="text-xs text-[#555] uppercase mb-3">텍스트</div>
              <div className="flex gap-6 flex-wrap">
                {textAtoms.map(atom => (
                  <div key={atom.id} className="flex gap-3">
                    {atom.variants.map(v => (
                      <div
                        key={v.id}
                        className={`w-[280px] bg-[#141414] border rounded-xl p-3 cursor-pointer hover:border-[#444] transition-colors ${
                          v.is_selected ? "border-[#FF6B35]" : "border-[#222]"
                        }`}
                        onClick={() => router.push(`/campaigns/${id}/compare/${atom.id}`)}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-sm">{CHANNEL_ICONS[atom.channel]}</span>
                          <span className="text-[10px] text-[#888]">G{v.generation}</span>
                          {v.is_selected && <span className="text-[10px] text-[#FF6B35]">✓</span>}
                          {v.score && <span className="text-[10px] text-yellow-400 ml-auto">{"★".repeat(v.score)}</span>}
                        </div>
                        <div className="text-xs text-[#ccc] whitespace-pre-wrap max-h-[120px] overflow-hidden leading-relaxed">
                          {v.output?.body?.substring(0, 200) || "—"}
                        </div>
                      </div>
                    ))}
                    {atom.variants.length === 0 && (
                      <div className="w-[280px] h-[160px] bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl flex items-center justify-center">
                        <span className="text-xs text-[#555]">{CHANNEL_ICONS[atom.channel]} 생성 전</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {atoms.length === 0 && (
            <div className="text-center py-20 text-[#555]">
              <p className="text-lg">콘텐츠가 없습니다</p>
              <p className="text-xs mt-2">콕핏에서 콘텐츠를 추가하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
