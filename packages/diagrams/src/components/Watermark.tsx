/** Avatar + brxce.ai watermark — responsive via useScale */
"use client";

import { color, font, space, s } from "../tokens";
import { useScale } from "./DiagramShell";

interface WatermarkProps {
  avatarUrl?: string;
}

export function Watermark({ avatarUrl = "/profile.jpg" }: WatermarkProps) {
  const { factor } = useScale();

  return (
    <div
      style={{
        position: "absolute",
        bottom: s(space.lg, factor),
        right: s(space.xl + space.xs, factor),
        display: "flex",
        alignItems: "center",
        gap: s(10, factor),
      }}
    >
      <div
        style={{
          width: s(32, factor),
          height: s(32, factor),
          borderRadius: "50%",
          border: `${Math.max(1, s(1.5, factor))}px solid ${color.primary}88`,
          overflow: "hidden",
          boxShadow: `0 0 ${s(12, factor)}px ${color.primaryFaint}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <span
        style={{
          fontFamily: font.family.sans,
          fontSize: s(font.size.body, factor),
          fontWeight: font.weight.semibold,
          color: color.primary,
          letterSpacing: font.letterSpacing.normal,
          opacity: 0.7,
        }}
      >
        brxce.ai
      </span>
    </div>
  );
}
