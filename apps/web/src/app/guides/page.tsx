import { createSupabaseServer } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import GuideHeader from "@/components/GuideHeader";
import GuideSection from "@/components/GuideSection";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "오픈클로 가이드 — brxce.ai",
  description: "오픈클로(OpenClaw) 에이전틱 워크플로우 실전 가이드 모음. OpenClaw × ClaudeCode로 AI 에이전트를 직접 세팅하는 방법을 공유합니다.",
  openGraph: {
    title: "오픈클로 가이드 — brxce.ai",
    description: "오픈클로 에이전틱 워크플로우 실전 가이드 모음",
    type: "website",
    url: "https://brxce.ai/guides",
    locale: "ko_KR",
  },
  alternates: { canonical: "https://brxce.ai/guides" },
};

// Level/section ordering config
const GUIDEBOOK_LEVELS = [
  { key: "lv1", label: "Lv.1 입문 — 이게 뭔데?", tagMatch: "lv1" },
  { key: "lv2", label: "Lv.2 기본 — 제대로 쓰는 법", tagMatch: "lv2" },
  { key: "lv3", label: "Lv.3 중급 — 워크플로우 설계", tagMatch: "lv3" },
  { key: "lv4", label: "Lv.4 고급 — 극한 활용", tagMatch: "lv4" },
];

// Practical sections moved to /practical page

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "brxce-preview-2026";

  let isAdmin = false;
  try {
    const sb = await createSupabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
      isAdmin = profile?.role === "admin";
    }
  } catch {}
  const isPreviewMode = isAdmin || preview === PREVIEW_SECRET;

  // Always use service client to show all items (including unpublished)
  // Unpublished items will show waitlist dialog on click
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Direct fetch to bypass any SSR client issues
  const res = await fetch(
    `${supabaseUrl}/rest/v1/contents?select=id,title,slug,hook,category,tags,media_urls,status,created_at&status=in.(published,draft,review,ready)&order=created_at.asc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: 'no-store',
    }
  );
  const allGuides = res.ok ? await res.json() : [];
  const guides = allGuides || [];
  console.log("[guides] fetch result:", { ok: res.ok, status: res.status, count: guides.length, hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY });

  // Show both "가이드북" and "가이드" category
  const guidebook = guides.filter((g: any) => g.category === "가이드북" || g.category === "가이드");

  // Split guidebook by level tags
  function byLevel(items: any[], tagMatch: string) {
    return items.filter((g: any) =>
      g.tags?.some((t: string) => t.toLowerCase().includes(tagMatch))
    );
  }

  // Guidebook items not matching any level
  const guidebookLeveled = GUIDEBOOK_LEVELS.flatMap((l) => byLevel(guidebook, l.tagMatch));
  const guidebookOther = guidebook.filter((g: any) => !guidebookLeveled.includes(g));

  return (
    <>
      <GuideHeader />
      <main className="max-w-[700px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-1">오픈클로 가이드</h1>
        <p className="text-[#888] mb-10">에이전틱 워크플로우 실전 가이드 모음</p>
        {/* 📘 가이드북 */}
        <div className="mb-12">
          {GUIDEBOOK_LEVELS.map((level, i) => {
            const items = byLevel(guidebook, level.tagMatch);
            return (
              <GuideSection
                key={level.key}
                title={level.label}
                guides={items}
                defaultOpen={i === 0}
                isPreview={isPreviewMode}
              />
            );
          })}

          {guidebookOther.length > 0 && (
            <GuideSection title="기타" guides={guidebookOther} isPreview={isPreviewMode} />
          )}
        </div>

        </main>
    </>
  );
}
