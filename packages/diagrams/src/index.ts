// Export
export { exportDiagram, type ExportOptions } from "./lib/export";

// Design tokens
export * from "./tokens";

// Scale context
export { useScale, useSketch } from "./components/DiagramShell";

// Primitives
export * from "./primitives";

// Components
export { DiagramShell } from "./components/DiagramShell";
export { Watermark } from "./components/Watermark";

// Templates
export { Comparison, type ComparisonProps } from "./templates/Comparison";
export { OrgChart, type OrgChartProps } from "./templates/OrgChart";
export { BeforeAfter, type BeforeAfterProps } from "./templates/BeforeAfter";
export { FlowChart, type FlowChartProps } from "./templates/FlowChart";
export { OgImage, type OgImageProps } from "./templates/OgImage";
export { Thumbnail, type ThumbnailProps } from "./templates/Thumbnail";
export { Quote, type QuoteProps } from "./templates/Quote";
export { SocialPost, type SocialPostProps } from "./templates/SocialPost";
export { Infographic, type InfographicProps, type InfographicSection } from "./templates/Infographic";
// SketchComparison removed — use Comparison with sketch={true} instead

// Carousel Templates
export { CardNewsCarousel, type CardNewsCarouselProps } from "./templates/CardNewsCarousel";
export { StepByStepCarousel, type StepByStepCarouselProps } from "./templates/StepByStepCarousel";
export { ListCarousel, type ListCarouselProps } from "./templates/ListCarousel";
export { BeforeAfterCarousel, type BeforeAfterCarouselProps } from "./templates/BeforeAfterCarousel";
export { QuoteCarousel, type QuoteCarouselProps } from "./templates/QuoteCarousel";
