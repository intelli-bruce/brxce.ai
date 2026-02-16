/**
 * Footnote — bottom annotation text, auto-positioned.
 */
import { font, color } from "../tokens";

interface FootnoteProps {
  children: React.ReactNode;
  align?: "center" | "left" | "right";
}

export function Footnote({ children, align = "center" }: FootnoteProps) {
  return (
    <div
      style={{
        marginTop: "auto",
        fontSize: font.size.caption,
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
