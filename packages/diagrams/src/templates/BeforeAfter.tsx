/** Before → After comparison — responsive */
"use client";

import { space, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";
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
  sketch?: boolean;
}

function BeforeAfterInner({ before, after, arrow }: Pick<BeforeAfterProps, "before" | "after" | "arrow">) {
  const { factor } = useScale();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        height: "100%",
        paddingTop: s(space.md, factor),
      }}
    >
      <Card variant="default" flex={1} style={{ height: "90%" }}>
        <CardHeader>
          <CardTitle>{before.label}</CardTitle>
        </CardHeader>
        <CardBody>
          <List items={before.items} variant="default" showBullets={false} />
        </CardBody>
      </Card>

      <LargeArrow label={arrow} />

      <Card variant="highlight" flex={1.2} style={{ height: "90%" }}>
        <CardHeader variant="highlight">
          <CardTitle variant="highlight">{after.label}</CardTitle>
        </CardHeader>
        <CardBody>
          <List items={after.items} variant="highlight" />
        </CardBody>
      </Card>
    </div>
  );
}

export function BeforeAfter({
  title,
  before,
  after,
  arrow = "에이전틱",
  ratio = "guide-3:2",
  avatarUrl,
  sketch,
}: BeforeAfterProps) {
  return (
    <DiagramShell title={title} ratio={ratio} avatarUrl={avatarUrl} sketch={sketch}>
      <BeforeAfterInner before={before} after={after} arrow={arrow} />
    </DiagramShell>
  );
}
