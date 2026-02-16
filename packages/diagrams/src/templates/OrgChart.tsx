/** Org chart — hub-spoke layout with premium styling */
import { theme } from "../theme";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../theme";

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
  ratio?: RatioPreset;
  avatarUrl?: string;
}

function NodeCard({ node, variant }: { node: OrgNode; variant: "top" | "hub" | "group" }) {
  const color = node.color ?? (variant === "hub" ? theme.colors.primary : theme.colors.stroke);
  const isHub = variant === "hub";
  const isTop = variant === "top";

  return (
    <div
      style={{
        border: `${isHub ? 1.5 : 1}px solid ${isHub ? color + "88" : color + "44"}`,
        borderRadius: isTop ? 999 : theme.radii.md,
        padding: isTop ? "12px 28px" : isHub ? "14px 32px" : "10px 18px",
        textAlign: "center",
        background: isHub
          ? `linear-gradient(135deg, ${color}15, transparent)`
          : "transparent",
        boxShadow: isHub ? `0 0 30px ${color}12` : "none",
        minWidth: variant === "group" ? 130 : undefined,
      }}
    >
      <div
        style={{
          fontSize: isHub ? 17 : isTop ? 15 : 13,
          fontWeight: 700,
          color: isHub ? color : isTop ? theme.colors.text : color,
          letterSpacing: "-0.02em",
        }}
      >
        {node.label}
      </div>
      {node.sub && (
        <div style={{ fontSize: isTop ? 11 : 11, color: theme.colors.textMuted, marginTop: 3 }}>
          {node.sub}
        </div>
      )}
    </div>
  );
}

export function OrgChart({ title, top, hub, groups, footnote, ratio = "guide-3:2", avatarUrl }: OrgChartProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, height: "100%", paddingTop: 12 }}>
        {/* Top node */}
        <NodeCard node={top} variant="top" />

        {/* Connector: dashed line + label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{
            width: 1.5,
            height: 20,
            background: `linear-gradient(180deg, ${theme.colors.textDim}, transparent)`,
          }} />
          <div style={{
            fontSize: 10,
            color: theme.colors.textDim,
            padding: "2px 10px",
            border: `1px solid #222`,
            borderRadius: 999,
            background: theme.colors.bg,
          }}>
            방향 설정 · 검수
          </div>
          <div style={{
            width: 1.5,
            height: 14,
            background: `linear-gradient(180deg, transparent, ${theme.colors.primary}66)`,
          }} />
        </div>

        {/* Hub node */}
        <NodeCard node={hub} variant="hub" />

        {/* Fan-out SVG */}
        <svg width="90%" height="44" style={{ flexShrink: 0 }} viewBox="0 0 800 44">
          {groups.map((g, i) => {
            const total = groups.length;
            const xEnd = ((i + 0.5) / total) * 800;
            const color = g.color ?? theme.colors.textDim;
            return (
              <g key={i}>
                <line
                  x1="400" y1="0" x2={xEnd} y2="40"
                  stroke={color}
                  strokeWidth={1.2}
                  opacity={0.5}
                />
                <circle cx={xEnd} cy={40} r={3} fill={color} opacity={0.6} />
              </g>
            );
          })}
          <circle cx="400" cy="0" r={3} fill={theme.colors.primary} />
        </svg>

        {/* Group nodes */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {groups.map((g, i) => (
            <NodeCard key={i} node={g} variant="group" />
          ))}
        </div>

        {/* Footnote */}
        {footnote && (
          <div style={{
            marginTop: "auto",
            fontSize: 12,
            color: theme.colors.textDim,
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.5,
          }}>
            {footnote}
          </div>
        )}
      </div>
    </DiagramShell>
  );
}
