/** Wraps any diagram with bg, sizing, watermark */
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
      }}
    >
      {title && (
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: theme.colors.primary,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: title ? 80 : 24,
          left: 24,
          right: 24,
          bottom: 70,
        }}
      >
        {children}
      </div>

      <Watermark avatarUrl={avatarUrl} />
    </div>
  );
}
