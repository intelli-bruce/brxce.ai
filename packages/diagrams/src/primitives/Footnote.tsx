"use client";

import { font, color, s } from "../tokens";
import { useScale } from "../components/DiagramShell";

interface FootnoteProps {
  children: React.ReactNode;
  align?: "center" | "left" | "right";
}

export function Footnote({ children, align = "center" }: FootnoteProps) {
  const { factor } = useScale();
  return (
    <div
      style={{
        marginTop: "auto",
        fontSize: s(font.size.caption, factor),
        color: color.textDim,
        textAlign: align,
        maxWidth: "80%",
        lineHeight: font.lineHeight.normal,
        alignSelf: align === "center" ? "center" : undefined,
      }}
    >
      {children}
    </div>
  );
}
