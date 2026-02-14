import { createServiceClient } from "@/lib/supabase";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createServiceClient();
  const { data: guides } = await sb
    .from("contents")
    .select("slug, updated_at, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const guideEntries: MetadataRoute.Sitemap = (guides || []).map((g) => ({
    url: `https://brxce.ai/guides/${g.slug}`,
    lastModified: new Date(g.updated_at || g.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://brxce.ai",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://brxce.ai/guides",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...guideEntries,
  ];
}
