/** Before → After comparison */
import { theme } from "../theme";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../theme";

export interface BeforeAfterProps {
  title: string;
  before: { label: string; items: string[] };
  after: { label: string; items: string[] };
  arrow?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
}

export function BeforeAfter({ title, before, after, arrow = "에이전틱", ratio = "guide-3:2", avatarUrl }: BeforeAfterProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, height: "100%", paddingTop: 16 }}>
        {/* Before */}
        <div
          style={{
            flex: 1,
            border: `1.5px solid ${theme.colors.stroke}`,
            borderRadius: theme.radii.lg,
            padding: 24,
            height: "85%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.stroke, textAlign: "center", marginBottom: 16 }}>
            {before.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {before.items.map((item, i) => (
              <div key={i} style={{ fontSize: 15, color: theme.colors.textMuted, fontFamily: theme.fonts.mono }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.colors.primary }}>{arrow}</div>
          <div style={{ fontSize: 32, color: theme.colors.primary, lineHeight: 1 }}>→</div>
        </div>

        {/* After */}
        <div
          style={{
            flex: 1.3,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: theme.radii.lg,
            padding: 24,
            height: "85%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.primary, textAlign: "center", marginBottom: 16 }}>
            {after.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {after.items.map((item, i) => (
              <div key={i} style={{ fontSize: 15, color: "#ddd", fontFamily: theme.fonts.mono }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DiagramShell>
  );
}
