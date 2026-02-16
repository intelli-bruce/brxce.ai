/** brxce.ai diagram theme */
export const theme = {
  colors: {
    primary: "#FF6B35",
    bg: "#0A0A0A",
    surface: "#141414",
    border: "#333",
    text: "#fafafa",
    textMuted: "#888",
    textDim: "#555",
    stroke: "#e0e0e0",
    // category colors
    dev: "#4c9aff",
    marketing: "#69db7c",
    business: "#ffd43b",
    support: "#868e96",
  },
  fonts: {
    sans: "'Pretendard', -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 16,
  },
} as const;

export type Theme = typeof theme;

/** Export ratio presets */
export const RATIO_PRESETS = {
  "blog-16:9": { width: 1920, height: 1080, label: "블로그 (16:9)" },
  "insta-4:5": { width: 1080, height: 1350, label: "인스타 (4:5)" },
  "square-1:1": { width: 1080, height: 1080, label: "정사각 (1:1)" },
  "wide-21:9": { width: 2520, height: 1080, label: "와이드 (21:9)" },
  "guide-3:2": { width: 1800, height: 1200, label: "가이드 (3:2)" },
} as const;

export type RatioPreset = keyof typeof RATIO_PRESETS;
