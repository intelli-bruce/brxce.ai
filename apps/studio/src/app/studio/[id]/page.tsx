import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { StudioProject } from "@/lib/studio/types";
import StudioEditor from "@/components/studio/StudioEditor";

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("studio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return notFound();

  return <StudioEditor initialProject={data as StudioProject} />;
}
