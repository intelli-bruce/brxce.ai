"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { TEMPLATES, type TemplateInfo } from "@/lib/studio/templates";
import type { ProjectType } from "@/lib/studio/types";

const TYPE_TABS: { type: ProjectType; label: string; icon: string }[] = [
  { type: "video", label: "영상", icon: "🎬" },
  { type: "carousel", label: "캐러셀", icon: "📱" },
  { type: "image", label: "이미지", icon: "🖼️" },
];

export default function NewStudioProjectPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<ProjectType>("video");
  const [creating, setCreating] = useState(false);

  const filteredTemplates = TEMPLATES.filter((t) => t.type === activeType);

  const handleCreate = async (template: TemplateInfo) => {
    setCreating(true);
    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase
        .from("studio_projects")
        .insert({
          title: `${template.name} 프로젝트`,
          type: template.type,
          template: template.id,
          width: template.width,
          height: template.height,
          fps: template.fps ?? null,
        })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/studio/${data.id}`);
    } catch (err) {
      console.error("프로젝트 생성 실패:", err);
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#fafafa] mb-6">새 프로젝트</h1>

      {/* 타입 탭 */}
      <div className="flex gap-2 mb-8">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveType(tab.type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
              activeType === tab.type
                ? "bg-[#FF6B35] text-white"
                : "bg-[#1a1a1a] text-[#888] hover:text-[#fafafa]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 템플릿 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleCreate(template)}
            disabled={creating}
            className="p-6 bg-[#1a1a1a] rounded-xl border border-[#222] hover:border-[#FF6B35] transition-colors text-left cursor-pointer disabled:opacity-50"
          >
            <h3 className="text-[#fafafa] font-semibold text-base mb-2">
              {template.name}
            </h3>
            <p className="text-[#888] text-sm mb-3">{template.description}</p>
            <p className="text-[#555] text-xs">
              {template.width}x{template.height}
              {template.fps ? ` · ${template.fps}fps` : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
