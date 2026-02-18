import { createSupabaseServer } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import GuideHeader from "@/components/GuideHeader";
import GuideSection from "@/components/GuideSection";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "오픈클로 실전 활용법 — brxce.ai",
  description: "오픈클로(OpenClaw) 에이전틱 워크플로우 실전 활용 사례. 개발, 업무 자동화, 콘텐츠 제작까지.",
  openGraph: {
    title: "오픈클로 실전 활용법 — brxce.ai",
    description: "에이전틱 워크플로우 실전 활용 사례",
    type: "website",
    url: "https://brxce.ai/practical",
    locale: "ko_KR",
  },
  alternates: { canonical: "https://brxce.ai/practical" },
};

const SECTIONS = [
  { key: "dev", label: "개발", tagMatch: "개발" },
  { key: "automation", label: "업무 자동화", tagMatch: "업무자동화" },
  { key: "content", label: "콘텐츠 / 지식", tagMatch: "콘텐츠" },
];

export default async function PracticalPage({
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/contents?select=id,title,slug,hook,category,tags,media_urls,status,created_at&category=eq.${encodeURIComponent("실전 활용법")}&status=in.(published,draft,review,ready)&order=created_at.asc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      next: { revalidate: 60 },
    }
  );
  const allGuides = res.ok ? await res.json() : [];
  const guides = allGuides || [];

  function bySection(items: any[], tagMatch: string) {
    return items.filter((g: any) =>
      g.tags?.some((t: string) => t.includes(tagMatch))
    );
  }

  const sectioned = SECTIONS.flatMap((s) => bySection(guides, s.tagMatch));
  const other = guides.filter((g: any) => !sectioned.includes(g));

  return (
    <>
      <GuideHeader />
      <main className="max-w-[700px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-1">오픈클로 실전 활용법</h1>
        <p className="text-[#888] mb-10">사례별 에이전틱 워크플로우 활용 방법</p>

        {SECTIONS.map((section, i) => {
          const items = bySection(guides, section.tagMatch);
          return (
            <GuideSection
              key={section.key}
              title={section.label}
              guides={items}
              defaultOpen={i === 0}
              isPreview={isPreviewMode}
            />
          );
        })}

        {other.length > 0 && (
          <GuideSection title="기타" guides={other} defaultOpen isPreview={isPreviewMode} />
        )}
      </main>
    </>
  );
}
