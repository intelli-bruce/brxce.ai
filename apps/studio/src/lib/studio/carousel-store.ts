import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const CAROUSELS_FILE = join(DATA_DIR, "carousels.json");

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
  slides: CarouselSlide[];
  createdAt: string;
  updatedAt: string;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function loadCarousels(): Promise<Carousel[]> {
  await ensureDir();
  try {
    const raw = await readFile(CAROUSELS_FILE, "utf-8");
    return JSON.parse(raw) as Carousel[];
  } catch {
    return [];
  }
}

export async function saveCarousels(carousels: Carousel[]): Promise<void> {
  await ensureDir();
  await writeFile(CAROUSELS_FILE, JSON.stringify(carousels, null, 2), "utf-8");
}

export async function createCarousel(data: {
  title: string;
  slides: Omit<CarouselSlide, "id">[];
}): Promise<Carousel> {
  const carousels = await loadCarousels();
  const now = new Date().toISOString();
  const carousel: Carousel = {
    id: uid("carousel"),
    title: data.title,
    slides: data.slides.map((s) => ({ ...s, id: uid("slide") })),
    createdAt: now,
    updatedAt: now,
  };
  carousels.unshift(carousel);
  await saveCarousels(carousels);
  return carousel;
}

export async function getCarousel(id: string): Promise<Carousel | null> {
  const carousels = await loadCarousels();
  return carousels.find((c) => c.id === id) ?? null;
}

export async function updateCarousel(
  id: string,
  patch: Partial<Pick<Carousel, "title" | "slides">>
): Promise<Carousel | null> {
  const carousels = await loadCarousels();
  const idx = carousels.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  if (patch.title !== undefined) carousels[idx].title = patch.title;
  if (patch.slides !== undefined) carousels[idx].slides = patch.slides;
  carousels[idx].updatedAt = new Date().toISOString();
  await saveCarousels(carousels);
  return carousels[idx];
}

export async function deleteCarousel(id: string): Promise<boolean> {
  const carousels = await loadCarousels();
  const idx = carousels.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  carousels.splice(idx, 1);
  await saveCarousels(carousels);
  return true;
}
