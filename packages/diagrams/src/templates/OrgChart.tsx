/** Org chart — hub-spoke layout built with design system primitives */
import { color, font, space, radius, connector, type RatioPreset } from "../tokens";
import { DiagramShell } from "../components/DiagramShell";
import { Card, CardVariant } from "../primitives/Card";
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
  /** Label on the connector between top and hub */
  connectorLabel?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
}

/* ─── Internal NodeCard ─── */
function NodeCard({ node, variant }: { node: OrgNode; variant: "top" | "hub" | "group" }) {
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
        padding: isTop ? `${space.md}px ${space.xxl}px` : isHub ? `${space.md + 2}px ${space.xxl + 4}px` : `${space.sm + 2}px ${space.lg + 2}px`,
        textAlign: "center",
        alignItems: "center",
        minWidth: variant === "group" ? 130 : undefined,
        // Override card defaults for inline node style
        overflow: "visible",
      }}
    >
      <div
        style={{
          fontSize: isHub ? font.size.heading - 1 : isTop ? font.size.body : font.size.subheading - 1,
          fontWeight: font.weight.bold,
          color: isHub ? color.primary : isTop ? color.text : nodeColor,
          letterSpacing: font.letterSpacing.normal,
        }}
      >
        {node.label}
      </div>
      {node.sub && (
        <div style={{ fontSize: font.size.caption - 1, color: color.textMuted, marginTop: space.xs - 1 }}>
          {node.sub}
        </div>
      )}
    </Card>
  );
}

export function OrgChart({
  title,
  top,
  hub,
  groups,
  footnote,
  connectorLabel = "방향 설정 · 검수",
  ratio = "guide-3:2",
  avatarUrl,
}: OrgChartProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          height: "100%",
          paddingTop: space.md,
        }}
      >
        {/* Top node */}
        <NodeCard node={top} variant="top" />

        {/* Connector: line + label + line */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <VerticalLine height={20} fade="top" />
          <ConnectorLabel>{connectorLabel}</ConnectorLabel>
          <VerticalLine height={14} fade="bottom" lineColor={`${color.primary}66`} />
        </div>

        {/* Hub node */}
        <NodeCard node={hub} variant="hub" />

        {/* Fan-out SVG */}
        <svg width="90%" height="44" style={{ flexShrink: 0 }} viewBox="0 0 800 44">
          {groups.map((g, i) => {
            const total = groups.length;
            const xEnd = ((i + 0.5) / total) * 800;
            const c = g.color ?? color.textDim;
            return (
              <g key={i}>
                <line
                  x1="400" y1="0" x2={xEnd} y2="40"
                  stroke={c}
                  strokeWidth={connector.strokeWidth}
                  opacity={0.5}
                />
                <circle cx={xEnd} cy={40} r={connector.dotRadius} fill={c} opacity={0.6} />
              </g>
            );
          })}
          <circle cx="400" cy="0" r={connector.dotRadius} fill={color.primary} />
        </svg>

        {/* Group nodes */}
        <div style={{ display: "flex", gap: space.md + 2, justifyContent: "center", flexWrap: "wrap" }}>
          {groups.map((g, i) => (
            <NodeCard key={i} node={g} variant="group" />
          ))}
        </div>

        {/* Footnote */}
        {footnote && <Footnote>{footnote}</Footnote>}
      </div>
    </DiagramShell>
  );
}
