"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
}

const BUCKET = "content-media";

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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

  useEffect(() => { loadFiles(); }, [loadFiles]);

  async function uploadFiles(fileList: FileList | File[]) {
    setUploading(true);
    const arr = Array.from(fileList);
    for (const file of arr) {
      const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await sb.storage.from(BUCKET).upload(name, file, {
        cacheControl: "3600",
        upsert: false,
      });
    }
    setUploading(false);
    loadFiles();
  }

  async function deleteFile(name: string) {
    if (!confirm(`"${name}" 삭제하시겠습니까?`)) return;
    await sb.storage.from(BUCKET).remove([name]);
    loadFiles();
  }

  function copyUrl(name: string) {
    navigator.clipboard.writeText(publicUrl(name));
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const isImage = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">미디어 라이브러리</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "파일 업로드"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="파일명 검색..."
        className="w-full max-w-md p-2.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] mb-6"
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`min-h-[200px] ${dragOver ? "border-[#fafafa] bg-[#111]" : ""}`}
      >
        {dragOver && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-[#555] rounded-[10px] mb-6 text-[#888]">
            여기에 파일을 놓으세요
          </div>
        )}

        {loading ? (
          <div className="text-[#888]">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-[#888] text-center py-16">
            {search ? "검색 결과가 없습니다" : "업로드된 미디어가 없습니다"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((f) => (
              <div key={f.name} className="group relative border border-[#222] rounded-[10px] overflow-hidden bg-[#111]">
                {/* Thumbnail */}
                <div className="aspect-square flex items-center justify-center bg-[#0a0a0a]">
                  {isImage(f.name) ? (
                    <img
                      src={publicUrl(f.name)}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[#666] text-xs">{f.name.split(".").pop()?.toUpperCase()}</span>
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs text-[#ccc] truncate" title={f.name}>{f.name}</p>
                  <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyUrl(f.name)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] hover:bg-[#333]"
                    >
                      {copied === f.name ? "✓ 복사됨" : "URL 복사"}
                    </button>
                    <button
                      onClick={() => deleteFile(f.name)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-red-400 hover:bg-red-900/30"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
