"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TagFilter({
  tags,
  categories,
  activeTag,
  activeCategory,
}: {
  tags: string[];
  categories: string[];
  activeTag?: string;
  activeCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/guides?${params.toString()}`);
  }

  if (tags.length === 0 && categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {(activeTag || activeCategory) && (
        <button
          onClick={() => router.push("/guides")}
          className="px-3 py-1.5 rounded-full text-[12px] bg-[#fafafa] text-[#0a0a0a] font-medium border-none cursor-pointer"
        >
          전체
        </button>
      )}
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => setFilter("category", activeCategory === c ? null : c)}
          className={`px-3 py-1.5 rounded-full text-[12px] border cursor-pointer transition-colors ${
            activeCategory === c
              ? "bg-[#fafafa] text-[#0a0a0a] border-[#fafafa] font-medium"
              : "bg-transparent text-[#888] border-[#333] hover:border-[#555] hover:text-[#ccc]"
          }`}
        >
          {c}
        </button>
      ))}
      {tags.map((t) => (
        <button
          key={t}
          onClick={() => setFilter("tag", activeTag === t ? null : t)}
          className={`px-3 py-1.5 rounded-full text-[12px] border cursor-pointer transition-colors ${
            activeTag === t
              ? "bg-[#fafafa] text-[#0a0a0a] border-[#fafafa] font-medium"
              : "bg-transparent text-[#888] border-[#333] hover:border-[#555] hover:text-[#ccc]"
          }`}
        >
          #{t}
        </button>
      ))}
    </div>
  );
}
