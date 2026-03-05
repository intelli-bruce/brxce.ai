import { createSupabaseAdmin } from "@/lib/supabase-admin";

export interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  items?: string[];
  [key: string]: any;
}

export interface CarouselSlide {
  id: string;
  templateId: string;
  label: string;
  category: "cover" | "hook" | "body" | "cta";
  content: SlideContent;
  overrides: Record<string, any>;
}

export interface Carousel {
  id: string;
  title: string;
  caption?: string;
  slides: CarouselSlide[];
  createdAt: string;
  updatedAt: string;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function rowToCarousel(row: any): Carousel {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? undefined,
    slides: row.slides as CarouselSlide[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadCarousels(): Promise<Carousel[]> {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("carousels")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToCarousel);
}

export async function createCarousel(data: {
  title: string;
  slides: Omit<CarouselSlide, "id">[];
}): Promise<Carousel> {
  const sb = createSupabaseAdmin();
  const id = uid("carousel");
  const slides = data.slides.map((s) => ({ ...s, id: uid("slide") }));

  const { data: row, error } = await sb
    .from("carousels")
    .insert({ id, title: data.title, slides })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToCarousel(row);
}

export async function getCarousel(id: string): Promise<Carousel | null> {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("carousels")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToCarousel(data);
}

export async function updateCarousel(
  id: string,
  patch: Partial<Pick<Carousel, "title" | "caption" | "slides">>
): Promise<Carousel | null> {
  const sb = createSupabaseAdmin();
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.caption !== undefined) update.caption = patch.caption;
  if (patch.slides !== undefined) update.slides = patch.slides;

  const { data, error } = await sb
    .from("carousels")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return rowToCarousel(data);
}

export async function deleteCarousel(id: string): Promise<boolean> {
  const sb = createSupabaseAdmin();
  const { error } = await sb.from("carousels").delete().eq("id", id);
  return !error;
}
