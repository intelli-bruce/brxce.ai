/**
 * Design tokens — single source of truth for all diagram styling.
 *
 * Every visual value lives here. Templates import tokens, never raw numbers.
 * Naming follows: {category}.{variant}.{property}
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

/* ─── Typography ─── */
export const font = {
  family: {
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  size: {
    /** Diagram main title */
    title: 26,
    /** Section / card header */
    heading: 18,
    /** Card sub-header, labels */
    subheading: 14,
    /** Body text, list items */
    body: 15,
    /** Captions, badges, footnotes */
    caption: 12,
    /** Smallest — metadata, timestamps */
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

/* ─── Spacing ─── */
export const space = {
  /** 4px — micro gaps */
  xs: 4,
  /** 8px — tight gaps, inline spacing */
  sm: 8,
  /** 12px — default inner gap */
  md: 12,
  /** 16px — section padding */
  lg: 16,
  /** 20px — card padding */
  xl: 20,
  /** 28px — diagram edge margin */
  xxl: 28,
  /** 40px — major section breaks */
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
  /** Default dark card */
  default: {
    background: `linear-gradient(180deg, ${color.surface} 0%, ${color.bg} 60%)`,
    border: `1px solid ${color.border}`,
    borderRadius: radius.lg,
    boxShadow: shadow.card,
  },
  /** Highlighted / primary card */
  highlight: {
    background: `linear-gradient(180deg, ${color.primaryGhost} 0%, ${color.bg} 60%)`,
    border: `1.5px solid ${color.primaryDim}`,
    borderRadius: radius.lg,
    boxShadow: shadow.cardHighlight,
  },
  /** Ghost / minimal card (no fill, just border) */
  ghost: {
    background: "transparent",
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    boxShadow: "none",
  },
} as const;

/* ─── Connector / Arrow tokens ─── */
export const connector = {
  /** Circular badge between sections (e.g., → arrow) */
  badge: {
    size: 28,
    borderRadius: "50%" as const,
    fontSize: font.size.subheading,
  },
  /** Line thickness */
  strokeWidth: 1.5,
  /** SVG connector dot */
  dotRadius: 3,
} as const;

/* ─── Bullet / List Item tokens ─── */
export const bullet = {
  /** The ● character size */
  size: font.size.tiny,
  /** Vertical offset to align with text */
  marginTop: 6,
  /** Gap between bullet and text */
  gap: space.sm,
  /** Colors by context */
  color: {
    default: color.textDim,
    highlight: color.primary,
    positive: color.positive,
    negative: color.textDim,
  },
} as const;

/* ─── Item text colors (for list items across all templates) ─── */
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
  padding: `${space.xl}px ${space.xl}px ${space.lg}px`,
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
  padding: `${space.lg}px ${space.xl}px`,
  gap: 6,
} as const;

/* ─── Export Ratio Presets ─── */
export const RATIO_PRESETS = {
  "blog-16:9": { width: 1920, height: 1080, label: "블로그 (16:9)" },
  "insta-4:5": { width: 1080, height: 1350, label: "인스타 (4:5)" },
  "square-1:1": { width: 1080, height: 1080, label: "정사각 (1:1)" },
  "wide-21:9": { width: 2520, height: 1080, label: "와이드 (21:9)" },
  "guide-3:2": { width: 1800, height: 1200, label: "가이드 (3:2)" },
} as const;

export type RatioPreset = keyof typeof RATIO_PRESETS;
