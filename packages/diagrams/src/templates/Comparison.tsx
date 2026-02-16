/** 3-column comparison diagram — premium dark design */
import { theme } from "../theme";
import { DiagramShell } from "../components/DiagramShell";
import type { RatioPreset } from "../theme";

export interface ComparisonColumn {
  title: string;
  subtitle?: string;
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
          gap: 20,
          height: "100%",
          alignItems: "stretch",
          paddingTop: 16,
        }}
      >
        {columns.map((col, i) => {
          const isHighlight = col.highlight ?? i === columns.length - 1;
          const color = col.color ?? (isHighlight ? theme.colors.primary : theme.colors.stroke);

          return (
            <div key={i} style={{ position: "relative", flex: isHighlight ? 1.15 : 1, display: "flex" }}>
              {/* Arrow between columns */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -14,
                    top: "45%",
                    transform: "translateY(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isHighlight ? `${theme.colors.primary}22` : "#1a1a1a",
                    border: `1px solid ${isHighlight ? theme.colors.primary : "#333"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: isHighlight ? theme.colors.primary : theme.colors.textDim,
                    zIndex: 2,
                  }}
                >
                  →
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  background: isHighlight
                    ? `linear-gradient(180deg, ${theme.colors.primary}12 0%, ${theme.colors.bg} 60%)`
                    : `linear-gradient(180deg, #161616 0%, ${theme.colors.bg} 60%)`,
                  border: `${isHighlight ? 1.5 : 1}px solid ${isHighlight ? theme.colors.primary + "66" : "#222"}`,
                  borderRadius: theme.radii.lg,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: isHighlight
                    ? `0 0 40px ${theme.colors.primary}15, 0 4px 20px rgba(0,0,0,0.4)`
                    : "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "20px 20px 16px",
                    borderBottom: `1px solid ${isHighlight ? theme.colors.primary + "33" : "#1a1a1a"}`,
                    textAlign: "center",
                    background: isHighlight ? `${theme.colors.primary}08` : "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: isHighlight ? theme.colors.primary : theme.colors.text,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {col.title}
                  </div>
                  {col.subtitle && (
                    <div style={{ fontSize: 12, color: theme.colors.textDim, marginTop: 4 }}>
                      {col.subtitle}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {col.items.map((item, j) => {
                    if (!item) return <div key={j} style={{ height: 6 }} />;

                    const isCheck = item.startsWith("✓");
                    const isCross = item.startsWith("✕") || item.startsWith("X ");

                    return (
                      <div
                        key={j}
                        style={{
                          fontSize: 14,
                          color: isCheck
                            ? "#69db7c"
                            : isCross
                              ? "#666"
                              : isHighlight
                                ? "#ccc"
                                : theme.colors.textMuted,
                          lineHeight: 1.65,
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        {isHighlight && !isCheck && !isCross && (
                          <span style={{ color: theme.colors.primary, fontSize: 10, marginTop: 5, flexShrink: 0 }}>●</span>
                        )}
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DiagramShell>
  );
}
