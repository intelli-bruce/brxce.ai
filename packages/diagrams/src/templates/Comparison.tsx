/** 3-column comparison — responsive */
"use client";

import { space, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "../primitives/Card";
import { List } from "../primitives/ListItem";
import { ArrowBadge } from "../primitives/Connector";

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
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function ComparisonInner({ columns }: { columns: ComparisonColumn[] }) {
  const { factor } = useScale();

  return (
    <div
      style={{
        display: "flex",
        gap: s(space.xl, factor),
        height: "100%",
        alignItems: "stretch",
        paddingTop: s(space.lg, factor),
      }}
    >
      {columns.map((col, i) => {
        const isHighlight = col.highlight ?? i === columns.length - 1;
        const variant = isHighlight ? "highlight" : "default";

        return (
          <div
            key={i}
            style={{
              position: "relative",
              flex: isHighlight ? 1.15 : 1,
              display: "flex",
            }}
          >
            {i > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: -(s(space.xl, factor) / 2 + s(14, factor)),
                  top: "45%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                }}
              >
                <ArrowBadge highlight={isHighlight} accentColor={col.color} />
              </div>
            )}

            <Card variant={variant} accentColor={col.color} flex={1}>
              <CardHeader variant={variant} accentColor={col.color}>
                <CardTitle variant={variant} accentColor={col.color}>
                  {col.title}
                </CardTitle>
                {col.subtitle && <CardSubtitle>{col.subtitle}</CardSubtitle>}
              </CardHeader>
              <CardBody>
                <List items={col.items} variant={isHighlight ? "highlight" : "default"} />
              </CardBody>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export function Comparison({ title, columns, ratio = "guide-3:2", avatarUrl, sketch, exportMode }: ComparisonProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <ComparisonInner columns={columns} />
    </DiagramShell>
  );
}
