"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  RATIO_PRESETS,
  type RatioPreset,
  exportDiagram,
} from "@brxce/diagrams";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
interface Diagram {
  id: string;
  title: string;
  template: string;
  ratio: string;
  data: Record<string, unknown>;
  sketch: boolean;
  created_at: string;
}

/* ─── Template registry ─── */
const TEMPLATES: Record<string, { label: string; icon: string }> = {
  comparison: { label: "3단 비교", icon: "⊞" },
  orgchart: { label: "조직도", icon: "◎" },
  beforeafter: { label: "전후 비교", icon: "⇄" },
};

const EMPTY_DATA: Record<string, Record<string, unknown>> = {
  comparison: {
    title: "제목을 입력하세요",
    columns: [
      { title: "항목 A", items: ["내용 1", "내용 2"] },
      { title: "항목 B", items: ["내용 1", "내용 2"] },
      { title: "항목 C", items: ["내용 1", "내용 2"], highlight: true },
    ],
  },
  orgchart: {
    title: "조직도",
    top: { label: "대표", sub: "" },
    hub: { label: "총괄", sub: "" },
    groups: [{ label: "팀 A", sub: "", color: "#4c9aff" }],
    footnote: "",
  },
  beforeafter: {
    title: "전후 비교",
    before: { label: "Before", items: ["항목 1"] },
    after: { label: "After", items: ["항목 1"] },
    arrow: "변환",
  },
};



/* ─── Diagram Preview (mini) ─── */
function DiagramPreview({ diagram }: { diagram: Diagram }) {
  const ratio = (diagram.ratio || "guide-3:2") as RatioPreset;
  const data = diagram.data || {};

  return (
    <div style={{ width: 280, pointerEvents: "none" }}>
      {diagram.template === "comparison" && <Comparison ratio={ratio} sketch={diagram.sketch} {...(data as any)} />}
      {diagram.template === "orgchart" && <OrgChart ratio={ratio} sketch={diagram.sketch} {...(data as any)} />}
      {diagram.template === "beforeafter" && <BeforeAfter ratio={ratio} sketch={diagram.sketch} {...(data as any)} />}
    </div>
  );
}

/* ─── Main Page ─── */
export default function DiagramsPage() {
  const router = useRouter();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  // Fetch diagrams
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("diagrams")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDiagrams(data);
      setLoading(false);
    })();
  }, []);

  // Create new diagram
  const handleCreate = async (template: string) => {
    const data = EMPTY_DATA[template] || EMPTY_DATA.comparison;
    const { data: row, error } = await supabase
      .from("diagrams")
      .insert({
        title: data.title || "새 다이어그램",
        template,
        ratio: "guide-3:2",
        data,
        sketch: false,
      })
      .select()
      .single();

    if (row) {
      router.push(`/diagrams/${row.id}`);
    } else {
      console.error("create error:", error);
    }
    setShowNew(false);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("diagrams").delete().eq("id", id);
    setDiagrams((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#fafafa]">📐 다이어그램</h1>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#e55a2b] transition-colors"
        >
          + 새 다이어그램
        </button>
      </div>

      {/* New diagram modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="bg-[#141414] border border-[#333] rounded-xl p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-[#fafafa] mb-4">템플릿 선택</h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TEMPLATES).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  onClick={() => handleCreate(key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#333] hover:border-[#FF6B35] hover:bg-[#1a1a1a] transition-all"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm text-[#ccc]">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNew(false)}
              className="mt-4 w-full py-2 text-sm text-[#888] hover:text-[#fafafa] transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Diagram list */}
      {loading ? (
        <div className="text-[#888] text-sm">로딩 중...</div>
      ) : diagrams.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-[#888]">
          <span className="text-4xl">📐</span>
          <p className="text-sm">아직 다이어그램이 없습니다</p>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-lg border border-[#333] text-sm hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
          >
            첫 다이어그램 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {diagrams.map((d) => (
            <div
              key={d.id}
              className="group border border-[#222] rounded-lg overflow-hidden hover:border-[#444] transition-all cursor-pointer"
              onClick={() => router.push(`/diagrams/${d.id}`)}
            >
              {/* Preview */}
              <div className="bg-[#0a0a0a] p-3 flex items-center justify-center overflow-hidden" style={{ height: 180 }}>
                <DiagramPreview diagram={d} />
              </div>

              {/* Info */}
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#fafafa] truncate">{d.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#888]">{TEMPLATES[d.template]?.label || d.template}</span>
                    {d.sketch && <span className="text-xs text-[#888] bg-[#1a1a1a] px-1.5 py-0.5 rounded">✏️ 스케치</span>}
                    <span className="text-xs text-[#666]">{RATIO_PRESETS[d.ratio as RatioPreset]?.label || d.ratio}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-[#666] hover:text-red-400 transition-all p-1"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
