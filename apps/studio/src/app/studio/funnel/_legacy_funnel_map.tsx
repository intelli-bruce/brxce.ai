"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ─── Theme ─── */
const COLORS = {
  tofu: { bg: "#ff6b3520", border: "#ff6b35", text: "#ff6b35" },
  capture: { bg: "#2563eb20", border: "#2563eb", text: "#60a5fa" },
  mofu: { bg: "#7c3aed20", border: "#7c3aed", text: "#a78bfa" },
  bofu: { bg: "#05966920", border: "#059669", text: "#34d399" },
  revenue: { bg: "#f59f0020", border: "#f59f00", text: "#fbbf24" },
};

type Stage = keyof typeof COLORS;

interface FunnelData {
  label: string;
  desc: string;
  icon: string;
  stage: Stage;
  status?: "active" | "wip" | "todo";
  [key: string]: unknown;
}

/* ─── Custom Nodes ─── */
function FunnelNode({ data }: NodeProps<Node<FunnelData>>) {
  const c = COLORS[data.stage];
  const dot = data.status === "active" ? "🟢" : data.status === "wip" ? "🟡" : "🔴";
  return (
    <div
      className="rounded-xl px-4 py-3 w-[220px] border-2 shadow-lg cursor-grab active:cursor-grabbing"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#444] !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#444] !w-2 !h-2 !border-0" />
      <Handle id="left" type="source" position={Position.Left} className="!bg-[#444] !w-2 !h-2 !border-0" />
      <Handle id="right" type="target" position={Position.Right} className="!bg-[#444] !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{data.icon}</span>
        <span className="font-bold text-sm" style={{ color: c.text }}>{data.label}</span>
        <span className="text-[10px] ml-auto">{dot}</span>
      </div>
      <p className="text-[11px] text-[#aaa] leading-relaxed whitespace-pre-line">{data.desc}</p>
    </div>
  );
}

function StageBadge({ data }: NodeProps<Node<FunnelData>>) {
  const c = COLORS[data.stage];
  return (
    <div className="px-3 py-1.5 rounded-lg border cursor-grab" style={{ borderColor: c.border, background: c.bg }}>
      <span className="text-[11px] font-bold tracking-wider" style={{ color: c.text }}>
        {data.icon} {data.label}
      </span>
    </div>
  );
}

const nodeTypes = { funnel: FunnelNode, stage: StageBadge };

/* ─── Layout ─── */
const X = [60, 320, 580];
const Y = [0, 190, 380, 570, 760];

function n(id: string, type: string, x: number, y: number, data: FunnelData): Node<FunnelData> {
  return { id, type, position: { x, y }, data, draggable: true, zIndex: type === "funnel" ? 10 : type === "stage" ? 5 : 1 };
}

const NODES: Node<FunnelData>[] = [
  // Stage badges (좌측)
  n("s-tofu", "stage", -140, Y[0] + 20, { label: "TOFU — 인지", icon: "👁️", desc: "", stage: "tofu" }),
  n("s-capture", "stage", -140, Y[1] + 20, { label: "캡처 — 리드", icon: "🎣", desc: "", stage: "capture" }),
  n("s-mofu", "stage", -140, Y[2] + 20, { label: "MOFU — 신뢰", icon: "🤝", desc: "", stage: "mofu" }),
  n("s-bofu", "stage", -140, Y[3] + 20, { label: "BOFU — 전환", icon: "🎯", desc: "", stage: "bofu" }),
  n("s-rev", "stage", -140, Y[4] + 20, { label: "💰 캐시플로우", icon: "", desc: "", stage: "revenue" }),

  // TOFU
  n("insta", "funnel", X[0], Y[0], { label: "인스타 캐러셀", icon: "📸", desc: "AI 에이전트 튜토리얼\nComment \"send\" → DM 자동화", stage: "tofu", status: "active" }),
  n("threads", "funnel", X[1], Y[0], { label: "Threads 숏텍스트", icon: "🧵", desc: "에이전틱 워크플로우\n일상 + 인사이트", stage: "tofu", status: "active" }),
  n("blog", "funnel", X[2], Y[0], { label: "블로그 / SEO", icon: "📝", desc: "brxce.ai GEO 최적화\n검색 유입 → 랜딩", stage: "tofu", status: "wip" }),

  // CAPTURE
  n("manychat", "funnel", X[0], Y[1], { label: "ManyChat DM", icon: "🤖", desc: "자동 DM 리드 마그넷 발송\n이메일 수집", stage: "capture", status: "todo" }),
  n("landing", "funnel", X[1], Y[1], { label: "brxce.ai 랜딩", icon: "🌐", desc: "프로필 링크 유입\n가이드북 다운로드 폼", stage: "capture", status: "wip" }),
  n("leadmagnet", "funnel", X[2], Y[1], { label: "리드 마그넷 PDF", icon: "📕", desc: "타겟: ChatGPT→에이전트 넘어가기\n에이전틱 워크플로우 가이드", stage: "capture", status: "wip" }),

  // MOFU
  n("nurture", "funnel", X[0], Y[2], { label: "너처링 이메일", icon: "📧", desc: "Soap Opera 5통 시퀀스\n사례→공포→CTA→뉴스레터 전환", stage: "mofu", status: "todo" }),
  n("newsletter", "funnel", X[1], Y[2], { label: "뉴스레터", icon: "📰", desc: "주간 에이전틱 인사이트\n딥다이브 콘텐츠", stage: "mofu", status: "todo" }),
  n("community", "funnel", X[2], Y[2], { label: "커뮤니티", icon: "👥", desc: "멤버십 Lv.1~2 무료\nLv.3~4 유료", stage: "mofu", status: "todo" }),

  // BOFU
  n("consult", "funnel", X[0], Y[3], { label: "무료 상담 신청", icon: "💼", desc: "DM \"상담\" / 폼 제출\n30분 진단 → PoC 제안", stage: "bofu", status: "wip" }),
  n("course", "funnel", X[1], Y[3], { label: "강의 / 강좌", icon: "🎓", desc: "에이전틱 워크플로우\n도입 가이드 (유료)", stage: "bofu", status: "todo" }),
  n("project", "funnel", X[2], Y[3], { label: "외주 프로젝트", icon: "🏗️", desc: "인텔리이펙트\nAI 에이전트 구축 수주", stage: "bofu", status: "active" }),

  // REVENUE
  n("rev1", "funnel", X[0], Y[4], { label: "컨설팅/외주 수익", icon: "💵", desc: "인텔리이펙트\n핵심 매출 라인", stage: "revenue", status: "active" }),
  n("rev2", "funnel", X[1], Y[4], { label: "강의/강좌 수익", icon: "💳", desc: "유료 교육\n(준비 중)", stage: "revenue", status: "todo" }),
  n("rev3", "funnel", X[2], Y[4], { label: "멤버십/구독 수익", icon: "💎", desc: "커뮤니티 구독\n(계획)", stage: "revenue", status: "todo" }),

  // (edge labels are on edges directly)
];

/* ─── Edges ─── */
const LS = { fill: "#999", fontSize: 10, fontWeight: 500 };

const EDGES: Edge[] = [
  // TOFU → CAPTURE
  { id: "e1", source: "insta", target: "manychat", animated: true, style: { stroke: "#ff6b35" }, label: "Comment \"send\"", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e2", source: "threads", target: "landing", animated: true, style: { stroke: "#ff6b35" }, label: "프로필 링크", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e3", source: "blog", target: "leadmagnet", style: { stroke: "#ff6b3588" }, label: "검색 유입", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },

  // CAPTURE 내부
  { id: "e4", source: "manychat", target: "leadmagnet", style: { stroke: "#2563eb88" }, type: "smoothstep", label: "PDF 발송", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e5", source: "landing", target: "leadmagnet", style: { stroke: "#2563eb44" }, type: "smoothstep" },

  // CAPTURE → MOFU
  { id: "e6", source: "manychat", target: "nurture", animated: true, style: { stroke: "#2563eb" }, label: "이메일 수집됨", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e7", source: "landing", target: "newsletter", style: { stroke: "#2563eb44" }, type: "smoothstep" },

  // MOFU 내부
  { id: "e8", source: "nurture", target: "newsletter", style: { stroke: "#7c3aed88" }, type: "smoothstep", label: "5통 후 전환", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e9", source: "newsletter", target: "community", style: { stroke: "#7c3aed44" }, type: "smoothstep" },

  // MOFU → BOFU
  { id: "e10", source: "nurture", target: "consult", animated: true, style: { stroke: "#7c3aed" }, label: "신뢰 축적 → 상담 CTA", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
  { id: "e11", source: "newsletter", target: "course", style: { stroke: "#7c3aed66" } },
  { id: "e12", source: "community", target: "course", style: { stroke: "#7c3aed44" }, type: "smoothstep" },

  // BOFU 내부
  { id: "e13", source: "consult", target: "project", style: { stroke: "#05966988" }, type: "smoothstep", label: "PoC → 본계약", labelStyle: LS, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },

  // BOFU → REVENUE
  { id: "e14", source: "consult", target: "rev1", style: { stroke: "#059669" } },
  { id: "e15", source: "project", target: "rev1", style: { stroke: "#059669" } },
  { id: "e16", source: "course", target: "rev2", style: { stroke: "#05966966" } },
  { id: "e17", source: "community", target: "rev3", style: { stroke: "#7c3aed44" } },

  // 순환: Revenue → TOFU
  { id: "e-loop", source: "rev1", target: "insta", sourceHandle: "left", targetHandle: "left" as unknown as string, type: "smoothstep", animated: true, style: { stroke: "#868686", strokeDasharray: "5 5" }, label: "🔄 사례 재생산", labelStyle: { ...LS, fill: "#666" }, labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.9 }, labelBgPadding: [6, 3] as [number, number] },
];

/* ─── Page ─── */
export default function FunnelPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(EDGES);
  const ntypes = useMemo(() => nodeTypes, []);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] w-full bg-[#0a0a0a]">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <h1 className="text-lg font-bold text-[#fafafa]">🦞 @brxce.ai 퍼널 맵</h1>
        <p className="text-xs text-[#666]">드래그로 노드 이동 · 스크롤로 줌</p>
        <div className="flex gap-3 ml-auto text-[10px]">
          <span>🟢 운영중</span>
          <span>🟡 진행중</span>
          <span>🔴 미시작</span>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={ntypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#0a0a0a" }}
          nodesDraggable={true}
          elementsSelectable={true}
          zoomOnScroll={true}
          panOnDrag={true}
        >
          <Background color="#1a1a1a" gap={20} />
          <Controls
            position="bottom-right"
            style={{ background: "#111", borderColor: "#333", borderRadius: 8 }}
          />
          <MiniMap
            nodeColor={(n) => {
              const stage = (n.data as FunnelData)?.stage;
              return stage ? COLORS[stage]?.border ?? "#333" : "#333";
            }}
            maskColor="#0a0a0a99"
            style={{ background: "#111", borderRadius: 8 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
