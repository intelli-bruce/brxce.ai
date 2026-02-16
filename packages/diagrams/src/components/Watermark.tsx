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
        bottom: 20,
        right: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: 0.85,
      }}
    >
      <img
        src={avatarUrl}
        alt=""
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `2px solid ${theme.colors.primary}`,
        }}
      />
      <span
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: 18,
          fontWeight: 600,
          color: theme.colors.primary,
          letterSpacing: "-0.02em",
        }}
      >
        brxce.ai
      </span>
    </div>
  );
}
