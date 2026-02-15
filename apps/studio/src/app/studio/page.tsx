import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { StudioProject } from "@/lib/studio/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "초안", color: "#666" },
  editing: { label: "편집중", color: "#F59E0B" },
  ready: { label: "준비됨", color: "#3B82F6" },
  rendering: { label: "렌더중", color: "#8B5CF6" },
  rendered: { label: "완료", color: "#10B981" },
  failed: { label: "실패", color: "#EF4444" },
};

const TYPE_ICONS: Record<string, string> = {
  video: "🎬",
  carousel: "📱",
  image: "🖼️",
};

export default async function StudioPage() {
  const supabase = await createSupabaseServer();
  const { data: projects } = await supabase
    .from("studio_projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const typedProjects = (projects ?? []) as StudioProject[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#fafafa]">스튜디오</h1>
        <Link
          href="/studio/new"
          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium no-underline hover:opacity-90 transition-opacity"
        >
          + 새 프로젝트
        </Link>
      </div>

      {typedProjects.length === 0 ? (
        <div className="text-center py-20 text-[#666]">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg mb-2">아직 프로젝트가 없습니다</p>
          <p className="text-sm">새 프로젝트를 만들어 영상, 캐러셀, 이미지를 제작하세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {typedProjects.map((project) => {
            const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.draft;
            return (
              <Link
                key={project.id}
                href={`/studio/${project.id}`}
                className="block p-5 bg-[#1a1a1a] rounded-xl border border-[#222] hover:border-[#333] transition-colors no-underline"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{TYPE_ICONS[project.type] ?? "📄"}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: status.color + "20", color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <h3 className="text-[#fafafa] font-semibold text-sm mb-1 truncate">
                  {project.title}
                </h3>
                <p className="text-[#666] text-xs">
                  {project.template} · {project.width}x{project.height}
                </p>
                <p className="text-[#444] text-xs mt-2">
                  {new Date(project.updated_at).toLocaleDateString("ko-KR")}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
