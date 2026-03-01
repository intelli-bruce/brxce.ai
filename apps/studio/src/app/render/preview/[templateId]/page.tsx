"use client";

import { useParams } from "next/navigation";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";

export default function TemplatePreviewPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const tpl = SLIDE_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return <div style={{ background: "#000", color: "#fff", padding: 40 }}>Template not found: {templateId}</div>;

  const Comp = tpl.component;

  return (
    <div id="slide-root" style={{ width: 1080, height: 1350, margin: 0, padding: 0 }}>
      <Comp {...tpl.defaultProps} slideNumber="1/10" />
    </div>
  );
}
