/** React Flow based flow chart — built with design system tokens */
"use client";

import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { color, font, radius, connector } from "../tokens";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../tokens";

/** Custom node styles using design tokens */
const nodeStyle = (nodeColor?: string, highlight?: boolean) => ({
  background: color.bg,
  color: nodeColor ?? color.text,
  border: `${highlight ? 2 : connector.strokeWidth}px solid ${nodeColor ?? color.textSecondary}`,
  borderRadius: radius.md,
  padding: "10px 16px",
  fontSize: font.size.subheading - 1,
  fontFamily: font.family.sans,
  fontWeight: highlight ? font.weight.bold : font.weight.medium,
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
    style: { stroke: e.color ?? color.textDim, strokeWidth: connector.strokeWidth },
    labelStyle: { fill: color.textMuted, fontSize: font.size.caption - 1 },
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
        <Background color={color.borderStrong} gap={40} size={1} />
      </ReactFlow>
    </DiagramShell>
  );
}
