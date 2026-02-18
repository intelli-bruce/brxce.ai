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
import ChannelNode from "./ChannelNode";
import type { SnapshotNodeData } from "./SnapshotNode";
import type { VariantNodeData } from "./VariantNode";
import type { MetaNodeData } from "./MetaNode";
import type { ChannelNodeData } from "./ChannelNode";

// React 19 compat
const nodeTypes = {
  snapshot: SnapshotNode,
  variant: VariantNode,
  meta: MetaNode,
  channel: ChannelNode,
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
  params: { tone?: string; feedback?: string; merge_note?: string } | null;
  output: { body?: string; text?: string } | null;
  is_selected: boolean;
  score: number | null;
  created_at: string;
  parent_variant_ids: string[];
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
  snapshot: { w: 420, h: 1200 },
  variant: { w: 340, h: 800 },
  meta: { w: 220, h: 50 },
  channel: { w: 180, h: 100 },
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
        bodyPreview: s.body_md || "",
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
      bodyPreview: currentBodyMd,
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

  // 2. Variant DAG — grouped by channel
  const pillarAtomIds = new Set(atoms.filter((a) => a.is_pillar).map((a) => a.id));
  const derivativeVariants = variants.filter((v) => !pillarAtomIds.has(v.atom_id));
  const atomMap = new Map(atoms.map((a) => [a.id, a]));
  const variantSet = new Set(derivativeVariants.map((v) => v.id));

  // Pre-compute atom-level media
  const atomMediaMap = new Map<string, string[]>();
  for (const a of atoms) {
    atomMediaMap.set(
      a.id,
      mediaAssets
        .filter((m) => m.source_atom_id === a.id && m.asset_type?.startsWith("image"))
        .map((m) => m.storage_url),
    );
  }

  // Group variants by channel
  const byChannel = new Map<string, Variant[]>();
  derivativeVariants.forEach((v) => {
    const atom = atomMap.get(v.atom_id);
    if (!atom) return;
    const ch = atom.channel;
    if (!byChannel.has(ch)) byChannel.set(ch, []);
    byChannel.get(ch)!.push(v);
  });

  // Create channel nodes + variant nodes per channel
  byChannel.forEach((chVariants, channel) => {
    const channelNodeId = `channel-${channel}`;

    // Channel logo node
    nodes.push({
      id: channelNodeId,
      type: "channel",
      position: { x: 0, y: 0 },
      data: {
        channel,
        variantCount: chVariants.length,
      } satisfies ChannelNodeData,
    });

    // Edge: current → channel node
    edges.push({
      id: `edge-current-${channelNodeId}`,
      source: currentId,
      target: channelNodeId,
      type: "smoothstep",
      style: { stroke: "#555", strokeWidth: 1.5 },
    });

    // Create variant nodes
    chVariants.forEach((v) => {
      const atom = atomMap.get(v.atom_id)!;
      const vId = `var-${v.id}`;
      const body = v.output?.body || v.output?.text || "";
      const isMerged = v.parent_variant_ids.length > 1;

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
          mediaUrls: (atomMediaMap.get(v.atom_id) || []).slice(0, 2),
          merged: isMerged,
          mergeNote: v.params?.merge_note || "",
        } satisfies VariantNodeData,
      });

      if (v.parent_variant_ids.length > 0) {
        // Edges from parent variants
        v.parent_variant_ids.forEach((pid) => {
          const sourceId = variantSet.has(pid) ? `var-${pid}` : channelNodeId;
          edges.push({
            id: `edge-${pid}-${v.id}`,
            source: sourceId,
            target: vId,
            type: "smoothstep",
            style: {
              stroke: isMerged ? "#a855f7" : v.is_selected ? "#4ECDC4" : "#555",
              strokeWidth: isMerged || v.is_selected ? 2.5 : 1.5,
            },
            animated: v.is_selected,
          });
        });
      } else {
        // Root variant — connect from channel node
        edges.push({
          id: `edge-${channelNodeId}-${v.id}`,
          source: channelNodeId,
          target: vId,
          type: "smoothstep",
          style: {
            stroke: v.is_selected ? "#4ECDC4" : "#555",
            strokeWidth: v.is_selected ? 2.5 : 1.5,
          },
          animated: v.is_selected,
        });
      }
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
