/** Wraps any diagram with bg, sizing, watermark, background texture */
import { theme, RATIO_PRESETS, type RatioPreset } from "../theme";
import { Watermark } from "./Watermark";

interface DiagramShellProps {
  ratio?: RatioPreset;
  width?: number;
  height?: number;
  title?: string;
  avatarUrl?: string;
  children: React.ReactNode;
}

export function DiagramShell({
  ratio = "guide-3:2",
  width,
  height,
  title,
  avatarUrl,
  children,
}: DiagramShellProps) {
  const preset = RATIO_PRESETS[ratio];
  const w = width ?? preset.width;
  const h = height ?? preset.height;

  return (
    <div
      id="diagram-export"
      style={{
        width: w,
        height: h,
        backgroundColor: theme.colors.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: theme.fonts.sans,
        color: theme.colors.text,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.colors.primary}44, transparent)`,
        }}
      />

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: theme.colors.text,
              letterSpacing: "-0.03em",
              background: `linear-gradient(135deg, ${theme.colors.text}, ${theme.colors.primary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          top: title ? 76 : 24,
          left: 28,
          right: 28,
          bottom: 64,
        }}
      >
        {children}
      </div>

      <Watermark avatarUrl={avatarUrl} />
    </div>
  );
}
