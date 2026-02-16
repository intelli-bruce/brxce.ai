/** React Flow based flow chart */
"use client";

import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { theme } from "../theme";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../theme";

/** Custom node styles */
const nodeStyle = (color?: string, highlight?: boolean) => ({
  background: theme.colors.bg,
  color: color ?? theme.colors.text,
  border: `${highlight ? 2 : 1.5}px solid ${color ?? theme.colors.stroke}`,
  borderRadius: theme.radii.md,
  padding: "10px 16px",
  fontSize: 13,
  fontFamily: theme.fonts.sans,
  fontWeight: highlight ? 700 : 500,
  textAlign: "center" as const,
  minWidth: 100,
});

export interface FlowChartNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  highlight?: boolean;
  type?: "default" | "input" | "output";
}

export interface FlowChartEdge {
  source: string;
  target: string;
  label?: string;
  color?: string;
  animated?: boolean;
}

export interface FlowChartProps {
  title: string;
  nodes: FlowChartNode[];
  edges: FlowChartEdge[];
  ratio?: RatioPreset;
  avatarUrl?: string;
}

export function FlowChart({ title, nodes, edges, ratio = "guide-3:2", avatarUrl }: FlowChartProps) {
  const rfNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    type: n.type ?? "default",
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: nodeStyle(n.color, n.highlight),
  }));

  const rfEdges: Edge[] = edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated,
    style: { stroke: e.color ?? theme.colors.textDim, strokeWidth: 1.5 },
    labelStyle: { fill: theme.colors.textMuted, fontSize: 11 },
  }));

  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
      >
        <Background color={theme.colors.border} gap={40} size={1} />
      </ReactFlow>
    </DiagramShell>
  );
}
