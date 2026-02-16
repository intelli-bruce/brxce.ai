/** Org chart — hub-spoke layout */
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

export function OrgChart({ title, top, hub, groups, footnote, ratio = "guide-3:2", avatarUrl }: OrgChartProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, height: "100%", paddingTop: 16 }}>
        {/* Top node (CEO) */}
        <div
          style={{
            border: `2px solid ${top.color ?? theme.colors.stroke}`,
            borderRadius: "50%",
            padding: "14px 28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: top.color ?? theme.colors.text }}>{top.label}</div>
          {top.sub && <div style={{ fontSize: 12, color: theme.colors.textMuted }}>{top.sub}</div>}
        </div>

        {/* Connector line */}
        <div style={{ width: 2, height: 28, backgroundColor: theme.colors.textDim }} />
        <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: -4, marginBottom: 4 }}>방향 설정</div>
        <div style={{ width: 2, height: 12, backgroundColor: theme.colors.textDim }} />

        {/* Hub node */}
        <div
          style={{
            border: `2px solid ${hub.color ?? theme.colors.primary}`,
            borderRadius: theme.radii.lg,
            padding: "14px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: hub.color ?? theme.colors.primary }}>{hub.label}</div>
          {hub.sub && <div style={{ fontSize: 12, color: theme.colors.textMuted }}>{hub.sub}</div>}
        </div>

        {/* Fan-out lines */}
        <svg width="100%" height="50" style={{ flexShrink: 0 }}>
          {groups.map((_, i) => {
            const total = groups.length;
            const xPct = ((i + 0.5) / total) * 100;
            return (
              <line
                key={i}
                x1="50%"
                y1="0"
                x2={`${xPct}%`}
                y2="48"
                stroke={theme.colors.textDim}
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={theme.colors.textDim} />
            </marker>
          </defs>
        </svg>

        {/* Group nodes */}
        <div style={{ display: "flex", gap: 16, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
          {groups.map((g, i) => (
            <div
              key={i}
              style={{
                border: `1.5px solid ${g.color ?? theme.colors.support}`,
                borderRadius: theme.radii.md,
                padding: "10px 18px",
                textAlign: "center",
                minWidth: 120,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: g.color ?? theme.colors.text }}>{g.label}</div>
              {g.sub && <div style={{ fontSize: 11, color: theme.colors.textMuted }}>{g.sub}</div>}
            </div>
          ))}
        </div>

        {/* Footnote */}
        {footnote && (
          <div style={{ marginTop: "auto", fontSize: 12, color: theme.colors.textDim, textAlign: "center" }}>
            {footnote}
          </div>
        )}
      </div>
    </DiagramShell>
  );
}
