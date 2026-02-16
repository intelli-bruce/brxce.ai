/**
 * Design tokens — single source of truth for all diagram styling.
 *
 * ⚠️ LAYOUT-FIRST PRINCIPLE:
 * - All sizes are defined as ratios relative to a 1200px reference width.
 * - At runtime, DiagramShell measures its container and computes a scale factor.
 * - Templates receive this scale factor and multiply all px values by it.
 * - This means: same diagram, any container, always proportional.
 */

/* ─── Color Palette ─── */
export const color = {
  // Brand
  primary: "#FF6B35",
  primaryDim: "#FF6B3566",
  primaryFaint: "#FF6B3522",
  primaryGhost: "#FF6B350A",

  // Surfaces
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceRaised: "#1A1A1A",
  surfaceHover: "#1F1F1F",

  // Borders
  border: "#222",
  borderSubtle: "#1A1A1A",
  borderStrong: "#333",

  // Text
  text: "#FAFAFA",
  textSecondary: "#CCCCCC",
  textMuted: "#888888",
  textDim: "#555555",

  // Semantic
  positive: "#69DB7C",
  negative: "#FF6B6B",
  warning: "#FFD43B",
  info: "#4C9AFF",

  // Category palette (for grouped elements)
  category: {
    blue: "#4C9AFF",
    green: "#69DB7C",
    yellow: "#FFD43B",
    gray: "#868E96",
    purple: "#B197FC",
    pink: "#F783AC",
    cyan: "#66D9E8",
    orange: "#FF922B",
  },
} as const;

/* ─── Reference width for proportional scaling ─── */
export const REF_WIDTH = 1200;

/**
 * Scale a base px value by a factor.
 * Usage: s(26, scale) → proportional title size
 */
export function s(basePx: number, scale: number): number {
  return Math.round(basePx * scale * 100) / 100;
}

/* ─── Typography (base values at 1200px ref width) ─── */
export const font = {
  family: {
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  /** Base font sizes (px at 1200px reference width). Multiply by scale factor at runtime. */
  size: {
    title: 26,
    heading: 18,
    subheading: 14,
    body: 15,
    caption: 12,
    tiny: 10,
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.5,
    relaxed: 1.65,
  },
  letterSpacing: {
    tight: "-0.03em",
    normal: "-0.02em",
    wide: "0.05em",
    caps: "0.1em",
  },
} as const;

/* ─── Spacing (base values at 1200px) ─── */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

/* ─── Border Radius ─── */
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/* ─── Shadows ─── */
export const shadow = {
  card: "0 4px 20px rgba(0,0,0,0.3)",
  cardHighlight: `0 0 40px ${color.primaryFaint}, 0 4px 20px rgba(0,0,0,0.4)`,
  glow: (c: string, intensity = 12) => `0 0 ${intensity * 2.5}px ${c}${Math.round(intensity).toString(16).padStart(2, "0")}`,
  subtle: "0 2px 8px rgba(0,0,0,0.2)",
} as const;

/* ─── Card Styles (pre-composed) ─── */
export const card = {
  default: {
    background: `linear-gradient(180deg, ${color.surface} 0%, ${color.bg} 60%)`,
    border: `1px solid ${color.border}`,
    borderRadius: radius.lg,
    boxShadow: shadow.card,
  },
  highlight: {
    background: `linear-gradient(180deg, ${color.primaryGhost} 0%, ${color.bg} 60%)`,
    border: `1.5px solid ${color.primaryDim}`,
    borderRadius: radius.lg,
    boxShadow: shadow.cardHighlight,
  },
  ghost: {
    background: "transparent",
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    boxShadow: "none",
  },
} as const;

/* ─── Connector tokens ─── */
export const connector = {
  badge: {
    size: 28,
    borderRadius: "50%" as const,
    fontSize: font.size.subheading,
  },
  strokeWidth: 1.5,
  dotRadius: 3,
} as const;

/* ─── Bullet / List Item tokens ─── */
export const bullet = {
  size: font.size.tiny,
  marginTop: 6,
  gap: space.sm,
  color: {
    default: color.textDim,
    highlight: color.primary,
    positive: color.positive,
    negative: color.textDim,
  },
} as const;

/* ─── Item text colors ─── */
export const itemText = {
  default: color.textSecondary,
  highlight: "#E0E0E0",
  positive: color.positive,
  negative: "#666",
  accent: color.primary,
  muted: "#777",
} as const;

/* ─── Card Header tokens ─── */
export const cardHeader = {
  padding: { y: space.xl, x: space.xl, bottom: space.lg },
  borderBottom: {
    default: `1px solid ${color.borderSubtle}`,
    highlight: `1px solid ${color.primary}33`,
  },
  background: {
    default: "transparent",
    highlight: `${color.primary}08`,
  },
} as const;

/* ─── Card Body tokens ─── */
export const cardBody = {
  padding: { y: space.lg, x: space.xl },
  gap: 6,
} as const;

/* ─── Aspect Ratio Presets (for CSS aspect-ratio) ─── */
export const RATIO_PRESETS = {
  "blog-16:9": { ratio: 16 / 9, label: "블로그 (16:9)", exportWidth: 1920, exportHeight: 1080 },
  "insta-4:5": { ratio: 4 / 5, label: "인스타 (4:5)", exportWidth: 1080, exportHeight: 1350 },
  "square-1:1": { ratio: 1, label: "정사각 (1:1)", exportWidth: 1080, exportHeight: 1080 },
  "wide-21:9": { ratio: 21 / 9, label: "와이드 (21:9)", exportWidth: 2520, exportHeight: 1080 },
  "guide-3:2": { ratio: 3 / 2, label: "가이드 (3:2)", exportWidth: 1800, exportHeight: 1200 },
} as const;

export type RatioPreset = keyof typeof RATIO_PRESETS;

/* ─── Scale context ─── */
export interface ScaleContext {
  /** Multiply base px values by this factor */
  factor: number;
  /** Container width in px */
  width: number;
  /** Container height in px */
  height: number;
}
