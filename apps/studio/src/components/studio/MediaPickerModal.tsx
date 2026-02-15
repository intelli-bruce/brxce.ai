"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  accept?: "image" | "video" | "all";
}

const BUCKET = "content-media";

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  accept = "all",
}: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const sb = createSupabaseBrowser();
  const publicUrl = (name: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;

  const isImage = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const isVideo = (name: string) =>
    /\.(mp4|mov|webm|avi)$/i.test(name);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb.storage.from(BUCKET).list("", {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });
    setFiles((data as unknown as MediaFile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!open) return null;

  const filtered = files.filter((f) => {
    if (!f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (accept === "image") return isImage(f.name);
    if (accept === "video") return isVideo(f.name);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#141414] border border-[#333] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <h3 className="text-sm font-semibold text-[#fafafa]">
            미디어 선택
          </h3>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-[#fafafa] bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="파일명 검색..."
            className="w-full p-2.5 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
            autoFocus
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading ? (
            <div className="text-[#888] text-sm py-8 text-center">
              로딩 중...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-[#888] text-sm py-8 text-center">
              {search ? "검색 결과 없음" : "미디어가 없습니다"}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((f) => (
                <button
                  key={f.name}
                  onClick={() => {
                    onSelect(publicUrl(f.name));
                    onClose();
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#222] hover:border-[#FF6B35] bg-[#0a0a0a] cursor-pointer transition-colors"
                >
                  {isImage(f.name) ? (
                    <img
                      src={publicUrl(f.name)}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#666]">
                      <span className="text-lg">
                        {isVideo(f.name) ? "🎬" : "📄"}
                      </span>
                      <span className="text-[10px] mt-1 truncate px-1 max-w-full">
                        {f.name.split(".").pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-[#ccc] truncate">
                      {f.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
