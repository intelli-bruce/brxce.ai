/** React Flow based flow chart — responsive */
"use client";

import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { color, font, radius, connector, s } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";
import type { RatioPreset } from "../tokens";

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

function FlowChartInner({ nodes, edges }: Pick<FlowChartProps, "nodes" | "edges">) {
  const { factor } = useScale();

  const nodeStyle = (nodeColor?: string, highlight?: boolean) => ({
    background: color.bg,
    color: nodeColor ?? color.text,
    border: `${highlight ? 2 : connector.strokeWidth}px solid ${nodeColor ?? color.textSecondary}`,
    borderRadius: s(radius.md, factor),
    padding: `${s(10, factor)}px ${s(16, factor)}px`,
    fontSize: s(font.size.subheading - 1, factor),
    fontFamily: font.family.sans,
    fontWeight: highlight ? font.weight.bold : font.weight.medium,
    textAlign: "center" as const,
    minWidth: s(100, factor),
  });

  const rfNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    position: { x: n.x * factor, y: n.y * factor },
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
    labelStyle: { fill: color.textMuted, fontSize: s(font.size.caption - 1, factor) },
  }));

  return (
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
      <Background color={color.borderStrong} gap={s(40, factor)} size={1} />
    </ReactFlow>
  );
}

export function FlowChart({ title, nodes, edges, ratio = "guide-3:2", avatarUrl }: FlowChartProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <FlowChartInner nodes={nodes} edges={edges} />
    </DiagramShell>
  );
}
