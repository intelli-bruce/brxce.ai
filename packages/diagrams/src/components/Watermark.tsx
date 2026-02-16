/** Avatar + brxce.ai watermark — bottom-right of every diagram */
import { theme } from "../theme";

interface WatermarkProps {
  avatarUrl?: string;
}

export function Watermark({ avatarUrl = "/profile.jpg" }: WatermarkProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1.5px solid ${theme.colors.primary}88`,
          overflow: "hidden",
          boxShadow: `0 0 12px ${theme.colors.primary}22`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: 15,
          fontWeight: 600,
          color: theme.colors.primary,
          letterSpacing: "-0.02em",
          opacity: 0.7,
        }}
      >
        brxce.ai
      </span>
    </div>
  );
}
