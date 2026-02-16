/** 3-column comparison diagram — built with design system primitives */
import { color, space, type RatioPreset } from "../tokens";
import { DiagramShell } from "../components/DiagramShell";
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
}

export function Comparison({ title, columns, ratio = "guide-3:2", avatarUrl }: ComparisonProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div
        style={{
          display: "flex",
          gap: space.xl,
          height: "100%",
          alignItems: "stretch",
          paddingTop: space.lg,
        }}
      >
        {columns.map((col, i) => {
          const isHighlight = col.highlight ?? i === columns.length - 1;
          const variant = isHighlight ? "highlight" : "default";
          const accent = col.color;

          return (
            <div
              key={i}
              style={{
                position: "relative",
                flex: isHighlight ? 1.15 : 1,
                display: "flex",
              }}
            >
              {/* Arrow between columns */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -(space.xl / 2 + 14),
                    top: "45%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                  }}
                >
                  <ArrowBadge highlight={isHighlight} accentColor={accent} />
                </div>
              )}

              <Card variant={variant} accentColor={accent} flex={1}>
                <CardHeader variant={variant} accentColor={accent}>
                  <CardTitle variant={variant} accentColor={accent}>
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
    </DiagramShell>
  );
}
