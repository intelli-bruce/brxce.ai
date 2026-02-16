/** Before → After comparison — built with design system primitives */
import { space, type RatioPreset } from "../tokens";
import { DiagramShell } from "../components/DiagramShell";
import { Card, CardHeader, CardTitle, CardBody } from "../primitives/Card";
import { List } from "../primitives/ListItem";
import { LargeArrow } from "../primitives/Connector";

export interface BeforeAfterProps {
  title: string;
  before: { label: string; items: string[] };
  after: { label: string; items: string[] };
  arrow?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
}

export function BeforeAfter({
  title,
  before,
  after,
  arrow = "에이전틱",
  ratio = "guide-3:2",
  avatarUrl,
}: BeforeAfterProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          height: "100%",
          paddingTop: space.md,
        }}
      >
        {/* Before card */}
        <Card variant="default" flex={1} style={{ height: "90%" }}>
          <CardHeader>
            <CardTitle>{before.label}</CardTitle>
          </CardHeader>
          <CardBody>
            <List items={before.items} variant="default" showBullets={false} />
          </CardBody>
        </Card>

        {/* Arrow */}
        <LargeArrow label={arrow} />

        {/* After card */}
        <Card variant="highlight" flex={1.2} style={{ height: "90%" }}>
          <CardHeader variant="highlight">
            <CardTitle variant="highlight">{after.label}</CardTitle>
          </CardHeader>
          <CardBody>
            <List items={after.items} variant="highlight" />
          </CardBody>
        </Card>
      </div>
    </DiagramShell>
  );
}
