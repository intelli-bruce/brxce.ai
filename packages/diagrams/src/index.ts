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
// SketchComparison removed — use Comparison with sketch={true} instead
