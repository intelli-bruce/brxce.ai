/** Org chart — responsive hub-spoke layout */
"use client";

import { color, font, space, radius, connector, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";
import { Card, type CardVariant } from "../primitives/Card";
import { Footnote } from "../primitives/Footnote";
import { VerticalLine, ConnectorLabel } from "../primitives/Connector";

export interface OrgNode {
  label: string;
  sub?: string;
  color?: string;
}

export interface OrgChartProps {
  title: string;
  top: OrgNode;
  hub: OrgNode;
  groups: OrgNode[];
  footnote?: string;
  connectorLabel?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
}

function NodeCard({ node, variant }: { node: OrgNode; variant: "top" | "hub" | "group" }) {
  const { factor } = useScale();
  const nodeColor = node.color ?? (variant === "hub" ? color.primary : color.text);
  const isHub = variant === "hub";
  const isTop = variant === "top";
  const cardVariant: CardVariant = isHub ? "highlight" : "ghost";

  return (
    <Card
      variant={cardVariant}
      accentColor={isHub ? color.primary : nodeColor}
      style={{
        borderRadius: isTop ? radius.pill : undefined,
        padding: isTop
          ? `${s(space.md, factor)}px ${s(space.xxl, factor)}px`
          : isHub
            ? `${s(space.md + 2, factor)}px ${s(space.xxl + 4, factor)}px`
            : `${s(space.sm + 2, factor)}px ${s(space.lg + 2, factor)}px`,
        textAlign: "center",
        alignItems: "center",
        minWidth: variant === "group" ? s(130, factor) : undefined,
        overflow: "visible",
      }}
    >
      <div
        style={{
          fontSize: s(isHub ? font.size.heading - 1 : isTop ? font.size.body : font.size.subheading - 1, factor),
          fontWeight: font.weight.bold,
          color: isHub ? color.primary : isTop ? color.text : nodeColor,
          letterSpacing: font.letterSpacing.normal,
        }}
      >
        {node.label}
      </div>
      {node.sub && (
        <div style={{ fontSize: s(font.size.caption - 1, factor), color: color.textMuted, marginTop: s(space.xs - 1, factor) }}>
          {node.sub}
        </div>
      )}
    </Card>
  );
}

function OrgChartInner({ top, hub, groups, footnote, connectorLabel }: Omit<OrgChartProps, "title" | "ratio" | "avatarUrl">) {
  const { factor } = useScale();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        height: "100%",
        paddingTop: s(space.md, factor),
      }}
    >
      <NodeCard node={top} variant="top" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <VerticalLine height={20} fade="top" />
        <ConnectorLabel>{connectorLabel ?? "방향 설정 · 검수"}</ConnectorLabel>
        <VerticalLine height={14} fade="bottom" lineColor={`${color.primary}66`} />
      </div>

      <NodeCard node={hub} variant="hub" />

      <svg width="90%" height={s(44, factor)} style={{ flexShrink: 0 }} viewBox="0 0 800 44">
        {groups.map((g, i) => {
          const total = groups.length;
          const xEnd = ((i + 0.5) / total) * 800;
          const c = g.color ?? color.textDim;
          return (
            <g key={i}>
              <line x1="400" y1="0" x2={xEnd} y2="40" stroke={c} strokeWidth={connector.strokeWidth} opacity={0.5} />
              <circle cx={xEnd} cy={40} r={connector.dotRadius} fill={c} opacity={0.6} />
            </g>
          );
        })}
        <circle cx="400" cy="0" r={connector.dotRadius} fill={color.primary} />
      </svg>

      <div style={{ display: "flex", gap: s(space.md + 2, factor), justifyContent: "center", flexWrap: "wrap" }}>
        {groups.map((g, i) => (
          <NodeCard key={i} node={g} variant="group" />
        ))}
      </div>

      {footnote && <Footnote>{footnote}</Footnote>}
    </div>
  );
}

export function OrgChart({ title, ratio = "guide-3:2", avatarUrl, ...rest }: OrgChartProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <OrgChartInner {...rest} />
    </DiagramShell>
  );
}
