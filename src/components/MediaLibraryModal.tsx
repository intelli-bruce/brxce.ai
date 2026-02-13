"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
}

const BUCKET = "content-media";

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, name: string) => void;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sb = createSupabaseBrowser();

  const publicUrl = (name: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const { data } = await sb.storage.from(BUCKET).list("", {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });
    setFiles((data as unknown as MediaFile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) loadFiles();
  }, [open, loadFiles]);

  async function uploadAndSelect(fileList: FileList) {
    setUploading(true);
    const file = fileList[0];
    const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await sb.storage.from(BUCKET).upload(name, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (!error) {
      onSelect(publicUrl(name), name);
      onClose();
    }
  }

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#111] border border-[#333] rounded-[10px] w-[90vw] max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-lg font-bold text-[#fafafa]">미디어 라이브러리</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50"
            >
              {uploading ? "업로드 중..." : "업로드"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadAndSelect(e.target.files)}
            />
            <button onClick={onClose} className="text-[#888] hover:text-[#fafafa] text-xl">✕</button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#222]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full p-2 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-[#888] text-center py-8">로딩 중...</div>
          ) : filtered.length === 0 ? (
            <div className="text-[#888] text-center py-8">이미지가 없습니다</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.filter((f) => isImage(f.name)).map((f) => (
                <button
                  key={f.name}
                  onClick={() => { onSelect(publicUrl(f.name), f.name); onClose(); }}
                  className="aspect-square rounded-[8px] overflow-hidden border border-[#333] hover:border-[#fafafa] transition-colors cursor-pointer bg-[#0a0a0a]"
                >
                  <img src={publicUrl(f.name)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
