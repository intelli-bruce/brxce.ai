"use client";

import { useParams } from "next/navigation";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";
import { canvas } from "@/lib/studio/slide-tokens";

export default function TemplatePreviewPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const tpl = SLIDE_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return <div style={{ background: "#000", color: "#fff", padding: 40 }}>Template not found: {templateId}</div>;

  const Comp = tpl.component;

  return (
    <>
      <style>{`nextjs-portal, [data-nextjs-toast], [data-next-mark] { display: none !important; }`}</style>
      <div id="slide-root" style={{ width: canvas.width, height: canvas.height, margin: 0, padding: 0 }}>
        <Comp {...tpl.defaultProps} slideNumber="1/10" />
      </div>
    </>
  );
}
