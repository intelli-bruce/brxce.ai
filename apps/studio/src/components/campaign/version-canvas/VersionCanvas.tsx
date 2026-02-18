"use client";

import { useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./version-canvas.css";
import dagre from "dagre";
import SnapshotNode from "./SnapshotNode";
import VariantNode from "./VariantNode";
import MetaNode from "./MetaNode";
import type { SnapshotNodeData } from "./SnapshotNode";
import type { VariantNodeData } from "./VariantNode";
import type { MetaNodeData } from "./MetaNode";

// React 19 compat
const nodeTypes = {
  snapshot: SnapshotNode,
  variant: VariantNode,
  meta: MetaNode,
} as unknown as NodeTypes;

/* ── Types ── */
export interface Snapshot {
  id: string;
  label: string;
  body_md: string | null;
  created_at: string;
}

export interface Variant {
  id: string;
  atom_id: string;
  generation: number;
  model: string | null;
  params: { tone?: string; feedback?: string; base_variant_id?: string; merged?: boolean; merge_note?: string } | null;
  output: { body?: string; text?: string } | null;
  is_selected: boolean;
  score: number | null;
  created_at: string;
}

export interface Atom {
  id: string;
  channel: string;
  format: string;
  is_pillar: boolean;
}

export interface MediaAsset {
  id: string;
  storage_url: string;
  file_name: string | null;
  asset_type: string;
  campaign_id: string | null;
  content_id: string | null;
  source_atom_id: string | null;
}

interface VersionCanvasProps {
  snapshots: Snapshot[];
  variants: Variant[];
  atoms: Atom[];
  mediaAssets?: MediaAsset[];
  currentBodyMd: string;
  onSnapshotClick?: (snapshotId: string) => void;
  onVariantClick?: (variantId: string) => void;
}

/* ── Dagre layout ── */
const NODE_SIZES: Record<string, { w: number; h: number }> = {
  snapshot: { w: 380, h: 320 },
  variant: { w: 340, h: 360 },
  meta: { w: 220, h: 50 },
};

function layoutElements(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", ranksep: 120, nodesep: 60 });

  nodes.forEach((n) => {
    const sz = NODE_SIZES[n.type || "snapshot"] || NODE_SIZES.snapshot;
    g.setNode(n.id, { width: sz.w, height: sz.h });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      const sz = NODE_SIZES[n.type || "snapshot"] || NODE_SIZES.snapshot;
      return { ...n, position: { x: pos.x - sz.w / 2, y: pos.y - sz.h / 2 } };
    }),
    edges,
  };
}

/* ── Build graph ── */
function buildGraph(
  snapshots: Snapshot[],
  variants: Variant[],
  atoms: Atom[],
  currentBodyMd: string,
  mediaAssets: MediaAsset[] = [],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 1. Snapshots → linear chain (oldest → newest → "current")
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Content-level media (not atom-specific)
  const contentMedia = mediaAssets
    .filter((m) => !m.source_atom_id && m.asset_type?.startsWith("image"))
    .map((m) => m.storage_url);

  sorted.forEach((s, i) => {
    nodes.push({
      id: `snap-${s.id}`,
      type: "snapshot",
      position: { x: 0, y: 0 },
      data: {
        label: s.label,
        createdAt: s.created_at,
        bodyPreview: (s.body_md || "").slice(0, 500),
        isCurrent: false,
        mediaUrls: [],
      } satisfies SnapshotNodeData,
    });

    if (i > 0) {
      edges.push({
        id: `snap-edge-${i}`,
        source: `snap-${sorted[i - 1].id}`,
        target: `snap-${s.id}`,
        type: "smoothstep",
        style: { stroke: "#FF6B35", strokeWidth: 2 },
        animated: false,
      });
    }
  });

  // "Current" node (live body)
  const currentId = "snap-current";
  nodes.push({
    id: currentId,
    type: "snapshot",
    position: { x: 0, y: 0 },
    data: {
      label: "현재 버전 (라이브)",
      createdAt: new Date().toISOString(),
      bodyPreview: currentBodyMd.slice(0, 500),
      isCurrent: true,
      mediaUrls: contentMedia.slice(0, 4),
    } satisfies SnapshotNodeData,
  });

  if (sorted.length > 0) {
    edges.push({
      id: "snap-edge-current",
      source: `snap-${sorted[sorted.length - 1].id}`,
      target: currentId,
      type: "smoothstep",
      style: { stroke: "#FF6B35", strokeWidth: 2 },
      animated: true,
    });
  }

  // 2. Group variants by atom → generation
  const atomMap = new Map(atoms.map((a) => [a.id, a]));
  const byAtom = new Map<string, Variant[]>();
  variants.forEach((v) => {
    if (!byAtom.has(v.atom_id)) byAtom.set(v.atom_id, []);
    byAtom.get(v.atom_id)!.push(v);
  });

  // For each atom, branch off "current" node
  byAtom.forEach((atomVariants, atomId) => {
    const atom = atomMap.get(atomId);
    if (!atom) return;

    // Group by generation
    const byGen = new Map<number, Variant[]>();
    atomVariants.forEach((v) => {
      if (!byGen.has(v.generation)) byGen.set(v.generation, []);
      byGen.get(v.generation)!.push(v);
    });

    const gens = [...byGen.keys()].sort();
    let prevGenAnchor = currentId; // First gen branches from "current"

    gens.forEach((gen) => {
      const genVariants = byGen.get(gen)!;

      // Meta node for this generation
      const firstV = genVariants[0];
      const feedback = firstV.params?.feedback;
      if (feedback || gen > 1) {
        const metaId = `meta-${atomId}-g${gen}`;
        nodes.push({
          id: metaId,
          type: "meta",
          position: { x: 0, y: 0 },
          data: {
            message: feedback || `G${gen} 생성`,
            type: feedback ? "feedback" : "generate",
          } satisfies MetaNodeData,
        });
        edges.push({
          id: `edge-${prevGenAnchor}-${metaId}`,
          source: prevGenAnchor,
          target: metaId,
          type: "smoothstep",
          style: { stroke: "#666", strokeWidth: 1.5, strokeDasharray: "6" },
        });
        prevGenAnchor = metaId;
      }

      // Variant nodes
      // Atom-level media
      const atomMedia = mediaAssets
        .filter((m) => m.source_atom_id === atomId && m.asset_type?.startsWith("image"))
        .map((m) => m.storage_url);

      genVariants.forEach((v) => {
        const vId = `var-${v.id}`;
        const body = v.output?.body || v.output?.text || "";
        nodes.push({
          id: vId,
          type: "variant",
          position: { x: 0, y: 0 },
          data: {
            variantId: v.id,
            generation: v.generation,
            model: v.model || "",
            tone: v.params?.tone || "",
            isSelected: v.is_selected,
            body: body,
            score: v.score,
            channel: atom.channel,
            createdAt: v.created_at,
            mediaUrls: atomMedia.slice(0, 2),
            merged: !!v.params?.merged,
            mergeNote: v.params?.merge_note || "",
          } satisfies VariantNodeData,
        });
        edges.push({
          id: `edge-${prevGenAnchor}-${vId}`,
          source: prevGenAnchor,
          target: vId,
          type: "smoothstep",
          style: {
            stroke: v.is_selected ? "#4ECDC4" : "#555",
            strokeWidth: v.is_selected ? 2.5 : 1.5,
          },
          animated: v.is_selected,
        });
      });

      // Next gen branches from selected variant (or first) of this gen
      const selected = genVariants.find((v) => v.is_selected) || genVariants[0];
      prevGenAnchor = `var-${selected.id}`;
    });
  });

  return { nodes, edges };
}

/* ── Component ── */
export default function VersionCanvas({
  snapshots,
  variants,
  atoms,
  mediaAssets = [],
  currentBodyMd,
  onSnapshotClick,
  onVariantClick,
}: VersionCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const graph = useMemo(
    () => buildGraph(snapshots, variants, atoms, currentBodyMd, mediaAssets),
    [snapshots, variants, atoms, currentBodyMd, mediaAssets],
  );

  useEffect(() => {
    if (graph.nodes.length > 0) {
      const laid = layoutElements(graph.nodes, graph.edges);
      setNodes(laid.nodes);
      setEdges(laid.edges);
    }
  }, [graph, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => {
      if (node.type === "snapshot" && onSnapshotClick) {
        const realId = node.id.replace("snap-", "");
        if (realId !== "current") onSnapshotClick(realId);
      }
      if (node.type === "variant" && onVariantClick) {
        const realId = node.id.replace("var-", "");
        onVariantClick(realId);
      }
    },
    [onSnapshotClick, onVariantClick],
  );

  return (
    <div className="h-full w-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          style={{ width: 120, height: 80 }}
          nodeColor={(node) => {
            if (node.type === "snapshot") return "#FF6B35";
            if (node.type === "variant") return node.data?.isSelected ? "#4ECDC4" : "#555";
            return "#333";
          }}
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
