/** 3-column comparison diagram */
import { theme } from "../theme";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../theme";

export interface ComparisonColumn {
  title: string;
  items: string[];
  highlight?: boolean;
  color?: string;
}

export interface ComparisonProps {
  title: string;
  columns: ComparisonColumn[];
  ratio?: RatioPreset;
  avatarUrl?: string;
}

export function Comparison({ title, columns, ratio = "guide-3:2", avatarUrl }: ComparisonProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div
        style={{
          display: "flex",
          gap: 24,
          height: "100%",
          alignItems: "stretch",
          paddingTop: 16,
        }}
      >
        {columns.map((col, i) => {
          const isHighlight = col.highlight ?? i === columns.length - 1;
          const color = col.color ?? (isHighlight ? theme.colors.primary : theme.colors.stroke);

          return (
            <div key={i} style={{ position: "relative", flex: 1, display: "flex" }}>
              {/* Arrow between columns */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isHighlight ? theme.colors.primary : theme.colors.textDim,
                    fontSize: 20,
                  }}
                >
                  →
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  border: `${isHighlight ? 2 : 1}px solid ${color}`,
                  borderRadius: theme.radii.lg,
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color,
                    textAlign: "center",
                    paddingBottom: 12,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {col.items.map((item, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 15,
                        color: isHighlight ? "#ddd" : theme.colors.textMuted,
                        lineHeight: 1.6,
                        fontFamily: theme.fonts.mono,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DiagramShell>
  );
}
