/** Avatar + brxce.ai watermark — bottom-right of every diagram */
import { color, font, space } from "../tokens";

interface WatermarkProps {
  avatarUrl?: string;
}

export function Watermark({ avatarUrl = "/profile.jpg" }: WatermarkProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: space.lg,
        right: space.xl + space.xs,
        display: "flex",
        alignItems: "center",
        gap: space.sm + 2,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1.5px solid ${color.primary}88`,
          overflow: "hidden",
          boxShadow: `0 0 12px ${color.primaryFaint}`,
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
          fontSize: font.size.body,
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
