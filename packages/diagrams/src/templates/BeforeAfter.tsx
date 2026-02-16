/** Before → After comparison — premium dark design */
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
      <div style={{ display: "flex", alignItems: "center", gap: 0, height: "100%", paddingTop: 12 }}>
        {/* Before card */}
        <div
          style={{
            flex: 1,
            height: "90%",
            border: `1px solid #222`,
            borderRadius: theme.radii.lg,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: `linear-gradient(180deg, #131313, ${theme.colors.bg})`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #1a1a1a",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.colors.textMuted }}>
              {before.label}
            </span>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
            {before.items.map((item, i) => {
              if (!item) return <div key={i} style={{ height: 4 }} />;
              return (
                <div key={i} style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: theme.colors.primary,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {arrow}
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.primary}33, ${theme.colors.primary}11)`,
              border: `1.5px solid ${theme.colors.primary}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: theme.colors.primary,
              boxShadow: `0 0 24px ${theme.colors.primary}22`,
            }}
          >
            →
          </div>
        </div>

        {/* After card */}
        <div
          style={{
            flex: 1.2,
            height: "90%",
            border: `1.5px solid ${theme.colors.primary}55`,
            borderRadius: theme.radii.lg,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: `linear-gradient(180deg, ${theme.colors.primary}0A, ${theme.colors.bg})`,
            boxShadow: `0 0 40px ${theme.colors.primary}08, 0 4px 20px rgba(0,0,0,0.4)`,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${theme.colors.primary}22`,
              textAlign: "center",
              background: `${theme.colors.primary}06`,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.colors.primary }}>
              {after.label}
            </span>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 5 }}>
            {after.items.map((item, i) => {
              if (!item) return <div key={i} style={{ height: 4 }} />;
              const isAccent = item.startsWith("→") || item.startsWith("×");
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: isAccent ? theme.colors.primary : "#bbb",
                    fontWeight: isAccent ? 600 : 400,
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DiagramShell>
  );
}
