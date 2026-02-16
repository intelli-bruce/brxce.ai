/**
 * SketchComparison — Excalidraw-style hand-drawn 3-column comparison.
 * Same data shape as Comparison, but rendered with rough.js sketchy borders.
 */
"use client";

import { space, font, color, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";
import { SketchRect } from "../primitives/SketchRect";

export interface SketchComparisonColumn {
  title: string;
  subtitle?: string;
  items: string[];
  highlight?: boolean;
  color?: string;
}

export interface SketchComparisonProps {
  title: string;
  columns: SketchComparisonColumn[];
  ratio?: RatioPreset;
  avatarUrl?: string;
}

function Inner({ columns }: { columns: SketchComparisonColumn[] }) {
  const { factor, width: containerW, height: containerH } = useScale();

  const gap = s(space.xl, factor);
  const colCount = columns.length;
  const totalGap = gap * (colCount - 1);
  const colW = (containerW - s(space.xxl, factor) * 2 - totalGap) / colCount;
  const colH = containerH - s(140, factor); // title + bottom padding

  return (
    <div
      style={{
        display: "flex",
        gap,
        height: "100%",
        alignItems: "flex-start",
        paddingTop: s(space.lg, factor),
      }}
    >
      {columns.map((col, i) => {
        const isHL = col.highlight ?? i === columns.length - 1;
        const accentColor = col.color || (isHL ? color.primary : undefined);
        const strokeColor = isHL ? (accentColor || color.primary) : color.borderStrong;

        return (
          <div key={i} style={{ position: "relative", flex: 1 }}>
            {/* Arrow between columns */}
            {i > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: -(gap / 2 + s(6, factor)),
                  top: "40%",
                  fontSize: s(16, factor),
                  color: isHL ? color.primary : color.textDim,
                  fontFamily: font.family.sans,
                }}
              >
                →
              </div>
            )}

            <SketchRect
              width={colW}
              height={colH}
              stroke={strokeColor}
              fill={isHL ? `${accentColor || color.primary}11` : undefined}
              fillStyle="solid"
              roughness={1.5}
              strokeWidth={isHL ? 2 : 1.5}
              seed={i * 1000 + 42}
            >
              <div style={{ padding: s(space.xl, factor) }}>
                {/* Title */}
                <div
                  style={{
                    fontSize: s(font.size.heading, factor),
                    fontWeight: font.weight.bold,
                    color: isHL ? (accentColor || color.primary) : color.text,
                    marginBottom: s(space.lg, factor),
                    paddingBottom: s(space.md, factor),
                    borderBottom: `1px solid ${isHL ? `${accentColor || color.primary}44` : color.borderSubtle}`,
                    fontFamily: font.family.sans,
                  }}
                >
                  {col.title}
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: s(6, factor) }}>
                  {col.items.map((item, j) => {
                    if (!item) return <div key={j} style={{ height: s(8, factor) }} />;
                    return (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: s(space.sm, factor),
                          fontSize: s(font.size.body, factor),
                          lineHeight: font.lineHeight.relaxed,
                          color: isHL ? "#E0E0E0" : color.textSecondary,
                          fontFamily: font.family.sans,
                        }}
                      >
                        <span
                          style={{
                            fontSize: s(8, factor),
                            marginTop: s(6, factor),
                            color: isHL ? (accentColor || color.primary) : color.textDim,
                          }}
                        >
                          ●
                        </span>
                        {item}
                      </div>
                    );
                  })}
                </div>
              </div>
            </SketchRect>
          </div>
        );
      })}
    </div>
  );
}

export function SketchComparison({ title, columns, ratio = "guide-3:2", avatarUrl }: SketchComparisonProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <Inner columns={columns} />
    </DiagramShell>
  );
}
