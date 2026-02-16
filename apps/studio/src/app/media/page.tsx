"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ── Types ── */
interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
  // Unified fields
  source: "cloud" | "local";
  url: string;
  tag: MediaTag;
}

interface MediaAssetRow {
  id: string;
  asset_type: string;
  storage_url: string;
  campaign_id: string | null;
  content_id: string | null;
  channel: string | null;
  group_key: string | null;
  position: number;
  file_name: string | null;
  source_atom_id: string | null;
  created_at: string;
  campaign?: { id: string; title: string } | null;
  content?: { id: string; title: string } | null;
  atom?: { id: string; format: string; channel: string } | null;
}

interface LocalMediaEntry {
  name: string;
  path: string;
  type: "image" | "video" | "other";
  size: number;
  modifiedAt: string;
}

type MediaTag = "photo" | "graphic" | "video" | "timelapse" | "gif" | "other";

const BUCKET = "content-media";
const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg|heic|heif|bmp)$/i.test(name);
const isVideo = (name: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(name);

type ViewMode = "all" | "campaign" | "content" | "channel" | "unlinked";

const TAG_INFO: Record<MediaTag, { icon: string; label: string }> = {
  photo: { icon: "📷", label: "사진" },
  graphic: { icon: "🎨", label: "그래픽" },
  video: { icon: "🎬", label: "영상" },
  timelapse: { icon: "⏱", label: "타임랩스" },
  gif: { icon: "🎞", label: "GIF" },
  other: { icon: "📄", label: "기타" },
};

/* ── Tag classification ── */
function classifyTag(name: string): MediaTag {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const nameLower = name.toLowerCase();

  // Timelapse check first (by name pattern)
  if (nameLower.includes("dji_") || nameLower.includes("timelapse")) return "timelapse";

  if (ext === "gif") return "gif";
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) return "video";
  if (["svg", "webp"].includes(ext)) return "graphic";
  if (["jpg", "jpeg", "heic"].includes(ext)) return "photo";
  // png can be either — heuristic: if name has design/graphic patterns it's graphic
  if (ext === "png") {
    if (/\d{13}/.test(name) || nameLower.includes("screenshot") || nameLower.includes("screen")) return "photo";
    return "graphic";
  }
  return "other";
}

/* ── Auto-group by filename pattern ── */
function autoGroupFiles(files: MediaFile[]): Map<string, MediaFile[]> {
  // Only match explicit carousel patterns:
  // - name_slide-1.png, name_slide_2.png  (slide keyword)
  // - name_card-1.png, name_card_2.png    (card keyword)
  // - name_p1.png, name_p2.png            (page keyword)
  // - name-1.png, name-2.png              (short suffix, prefix must be 3+ chars non-numeric)
  // Excludes: IMG_0035.HEIC (camera files), DJI_xxx (drone), timestamps
  const CAROUSEL_RE = /^(.+?)[-_](?:slide[-_]?|card[-_]?|p)(\d+)(\.[^.]+)$/i;
  const SHORT_SEQ_RE = /^([a-zA-Z][a-zA-Z0-9_-]{2,}?)[-_](\d{1,2})(\.[^.]+)$/;
  // Exclude patterns: camera files (IMG_, DSC_, DJI_, DCIM, Screenshot, etc.)
  const CAMERA_PREFIX = /^(IMG|DSC|DJI|DCIM|Screenshot|REC|Photo|VID|MOV|PXL|MVIMG)/i;
  const TIMESTAMP_PREFIX = /^\d{8,}/;
  
  const matched = new Map<string, MediaFile[]>();
  const singles: MediaFile[] = [];

  for (const f of files) {
    if (!isImage(f.name)) { singles.push(f); continue; }
    
    // Skip camera/timestamp files from grouping
    if (CAMERA_PREFIX.test(f.name) || TIMESTAMP_PREFIX.test(f.name)) {
      singles.push(f);
      continue;
    }
    
    const m = f.name.match(CAROUSEL_RE) || f.name.match(SHORT_SEQ_RE);
    if (m) {
      const prefix = m[1] + m[3]; // prefix + extension as group key
      if (!matched.has(prefix)) matched.set(prefix, []);
      matched.get(prefix)!.push(f);
    } else {
      singles.push(f);
    }
  }

  const result = new Map<string, MediaFile[]>();
  for (const [key, items] of matched) {
    if (items.length >= 2) {
      items.sort((a, b) => {
        const na = a.name.match(/(\d+)\.[^.]+$/)?.[1] || "0";
        const nb = b.name.match(/(\d+)\.[^.]+$/)?.[1] || "0";
        return parseInt(na) - parseInt(nb);
      });
      result.set(key, items);
    } else {
      singles.push(...items);
    }
  }
  for (const f of singles) {
    result.set(f.name, [f]);
  }
  return result;
}

/* ── Carousel Preview Modal ── */
function CarouselPreviewModal({
  files, initialIndex, onClose,
}: {
  files: MediaFile[]; initialIndex: number; onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [info, setInfo] = useState<{ w: number; h: number; size: string } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const isMulti = files.length > 1;
  const file = files[index];
  const url = file.url;

  useEffect(() => {
    setInfo(null); setZoom(100);
    if (!isImage(file.name)) return;
    const img = new Image();
    img.onload = () => {
      const sizeKB = file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) : "?";
      setInfo({ w: img.naturalWidth, h: img.naturalHeight, size: `${sizeKB} KB` });
    };
    img.src = url;
  }, [url, file]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(files.length - 1, i + 1));
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 25, 400));
      if (e.key === "-") setZoom((z) => Math.max(z - 25, 25));
      if (e.key === "0") setZoom(100);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, files.length]);

  async function handleExport(format: "png" | "jpeg" | "webp") {
    setDownloading(true);
    try {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${file.name.replace(/\.[^.]+$/, "")}.${format}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(a.href); setDownloading(false);
      }, mimeMap[format], format === "jpeg" ? 0.92 : undefined);
    } catch { setDownloading(false); }
  }

  function copyUrl() {
    try { navigator.clipboard.writeText(url); } catch {
      const ta = document.createElement("textarea"); ta.value = url;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#111]/80 border-b border-[#222] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm font-medium text-[#fafafa] truncate max-w-[300px]">{file.name}</h2>
          <SourceBadge source={file.source} />
          {isMulti && <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#FF6B35]/20 text-[#FF6B35] font-medium">{index + 1} / {files.length}</span>}
          {info && <span className="text-xs text-[#888] whitespace-nowrap">{info.w}×{info.h} · {info.size}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyUrl} className="px-3 py-1.5 text-xs rounded-lg bg-[#222] text-[#ccc] hover:bg-[#333] transition">URL 복사</button>
          <div className="relative group">
            <button disabled={downloading} className="px-3 py-1.5 text-xs rounded-lg bg-[#FF6B35] text-white font-medium hover:bg-[#e55a2b] disabled:opacity-50 transition">
              {downloading ? "변환 중..." : "↓ 내보내기"}
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden shadow-xl z-10 min-w-[120px]">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button key={fmt} onClick={() => handleExport(fmt)} className="px-4 py-2 text-xs text-left text-[#ccc] hover:bg-[#222] hover:text-white transition">{fmt.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="px-2 py-1.5 text-sm rounded-lg text-[#888] hover:text-white hover:bg-[#333] transition">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative">
        {isMulti && index > 0 && (
          <button onClick={() => setIndex((i) => i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#222]/80 text-white hover:bg-[#333] flex items-center justify-center text-lg z-10">‹</button>
        )}
        {isImage(file.name) ? (
          <img src={url} alt={file.name} style={{ zoom: `${zoom}%` }} className="max-w-none rounded-lg shadow-2xl select-none" draggable={false} />
        ) : isVideo(file.name) ? (
          <video src={url} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
        ) : (
          <div className="text-[#888] text-lg">{file.name}</div>
        )}
        {isMulti && index < files.length - 1 && (
          <button onClick={() => setIndex((i) => i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#222]/80 text-white hover:bg-[#333] flex items-center justify-center text-lg z-10">›</button>
        )}
      </div>

      {isMulti && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#111]/80 border-t border-[#222] shrink-0 overflow-x-auto">
          {files.map((f, i) => (
            <button key={f.name} onClick={() => setIndex(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${i === index ? "border-[#FF6B35]" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-[#111]/80 border-t border-[#222] shrink-0">
        <button onClick={() => setZoom((z) => Math.max(z - 25, 25))} className="w-7 h-7 flex items-center justify-center rounded bg-[#222] text-[#ccc] hover:bg-[#333] text-sm">−</button>
        <input type="range" min={25} max={400} step={25} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-48 accent-[#FF6B35]" />
        <span className="text-xs text-[#888] w-12 text-center">{zoom}%</span>
        <button onClick={() => setZoom((z) => Math.min(z + 25, 400))} className="w-7 h-7 flex items-center justify-center rounded bg-[#222] text-[#ccc] hover:bg-[#333] text-sm">+</button>
        <button onClick={() => setZoom(100)} className="ml-2 px-2 py-1 text-[10px] rounded bg-[#222] text-[#888] hover:bg-[#333] hover:text-[#ccc]">1:1</button>
      </div>
    </div>
  );
}

/* ── Source Badge ── */
function SourceBadge({ source }: { source: "cloud" | "local" }) {
  return source === "cloud" ? (
    <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-medium rounded-full bg-blue-500/20 text-blue-400 backdrop-blur-sm">☁️ 클라우드</span>
  ) : (
    <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-medium rounded-full bg-green-500/20 text-green-400 backdrop-blur-sm">💻 로컬</span>
  );
}

/* ── Group Section Header ── */
function GroupHeader({ label, sublabel, count }: { label: string; sublabel?: string; count: number }) {
  return (
    <div className="col-span-full flex items-center gap-3 mt-6 mb-2 first:mt-0">
      <h3 className="text-sm font-semibold text-[#fafafa]">{label}</h3>
      {sublabel && <span className="text-xs text-[#666]">{sublabel}</span>}
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#222] text-[#888]">{count}</span>
      <div className="flex-1 border-t border-[#222]" />
    </div>
  );
}

/* ── Thumbnail Card ── */
function ThumbCard({
  file, badge, onClick, onCopy, onDelete, copied,
}: {
  file: MediaFile; badge?: { text: string; color: string };
  onClick: () => void; onCopy: () => void; onDelete?: () => void; copied: boolean;
}) {
  return (
    <div className="group relative border border-[#222] rounded-[10px] overflow-hidden bg-[#111]">
      <div className="aspect-square flex items-center justify-center bg-[#0a0a0a] cursor-pointer relative" onClick={onClick}>
        {isImage(file.name) ? (
          <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" loading="lazy" />
        ) : isVideo(file.name) && file.source === "local" ? (
          <div className="w-full h-full relative">
            <img src={`/api/media/serve?path=${encodeURIComponent(`/Volumes/WorkSSD/Media/${file.name}`)}&thumb=400`} alt={file.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" loading="lazy" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-lg">▶</span>
          </div>
        ) : isVideo(file.name) ? (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
            <span className="text-3xl">🎬</span>
          </div>
        ) : (
          <span className="text-[#666] text-xs">{file.name.split(".").pop()?.toUpperCase()}</span>
        )}
        {badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-medium rounded-full ${badge.color}`}>
            {badge.text}
          </span>
        )}
        <SourceBadge source={file.source} />
        <span className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-[#ccc]">
          {TAG_INFO[file.tag].icon}
        </span>
      </div>
      <div className="p-2">
        <p className="text-xs text-[#ccc] truncate" title={file.name}>{file.name}</p>
        <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onCopy} className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] hover:bg-[#333]">
            {copied ? "✓ 복사됨" : "URL 복사"}
          </button>
          {onDelete && (
            <button onClick={onDelete} className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-red-400 hover:bg-red-900/30">삭제</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Carousel Stack Card ── */
function CarouselStackCard({
  files, onClick, onCopy, onDeleteAll, copied,
}: {
  files: MediaFile[]; onClick: () => void; onCopy: () => void; onDeleteAll?: () => void; copied: boolean;
}) {
  const count = files.length;
  return (
    <div className="group relative border border-[#222] rounded-[10px] overflow-hidden bg-[#111]">
      <div className="aspect-square flex items-center justify-center bg-[#0a0a0a] cursor-pointer relative" onClick={onClick}>
        <img src={files[0].url} alt={files[0].name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" loading="lazy" />
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#FF6B35]">
            <rect x="2" y="4" width="16" height="16" rx="2" /><rect x="6" y="2" width="16" height="16" rx="2" fill="none" />
          </svg>
          <span className="text-[10px] font-medium text-white">{count}</span>
        </div>
        <SourceBadge source={files[0].source} />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {files.slice(0, 6).map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#FF6B35]" : "bg-white/40"}`} />)}
          {count > 6 && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs text-[#ccc] truncate">{files[0].name.replace(/[-_]\d+(\.[^.]+)$/, "$1")}</p>
        <p className="text-[10px] text-[#666] mt-0.5">{count}장 캐러셀</p>
        <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onCopy} className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] hover:bg-[#333]">{copied ? "✓ 복사됨" : "URL 복사"}</button>
          {onDeleteAll && (
            <button onClick={onDeleteAll} className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-red-400 hover:bg-red-900/30">전체 삭제</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [activeSource, setActiveSource] = useState<"all" | "cloud" | "local">("all");
  const [activeTags, setActiveTags] = useState<Set<MediaTag>>(new Set());
  const [previewGroup, setPreviewGroup] = useState<{ files: MediaFile[]; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sb = createSupabaseBrowser();
  const navRouter = useRouter();

  const publicUrl = (name: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;

  const localServeUrl = (path: string, thumb?: boolean) => {
    const base = `/api/media/serve?path=${encodeURIComponent(path)}`;
    // HEIC/HEIF/BMP need server conversion; also add thumb for grid thumbnails
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const needsConvert = ["heic", "heif", "bmp", "lrf"].includes(ext);
    if (thumb || needsConvert) return `${base}&thumb=400`;
    return base;
  };

  const loadFiles = useCallback(async () => {
    setLoading(true);

    const [storageRes, assetRes, localRes] = await Promise.all([
      sb.storage.from(BUCKET).list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } }),
      sb.from("media_assets")
        .select("*, campaign:campaigns(id, title), content:contents(id, title), atom:campaign_atoms(id, format, channel)")
        .order("created_at", { ascending: false }),
      fetch("/api/media").then((r) => r.json()).catch(() => ({ files: [] })),
    ]);

    // Convert Supabase files to unified MediaFile
    const cloudFiles: MediaFile[] = ((storageRes.data || []) as any[]).map((f) => ({
      ...f,
      source: "cloud" as const,
      url: publicUrl(f.name),
      tag: classifyTag(f.name),
    }));

    // Convert local files to unified MediaFile
    const localFiles: MediaFile[] = ((localRes.files || []) as LocalMediaEntry[]).map((f) => ({
      name: f.name,
      id: `local-${f.name}`,
      created_at: f.modifiedAt,
      metadata: { size: f.size, mimetype: f.type },
      source: "local" as const,
      url: localServeUrl(f.path, true),
      tag: classifyTag(f.name),
    }));

    setFiles([...cloudFiles, ...localFiles]);
    setAssets((assetRes.data as MediaAssetRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  async function uploadFiles(fileList: FileList | File[]) {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await sb.storage.from(BUCKET).upload(name, file, { cacheControl: "3600", upsert: false });
    }
    setUploading(false);
    loadFiles();
  }

  async function deleteFile(file: MediaFile) {
    if (file.source === "local") return; // Can't delete local files from UI
    await sb.storage.from(BUCKET).remove([file.name]);
    await sb.from("media_assets").delete().eq("storage_url", publicUrl(file.name));
    loadFiles();
  }

  function deleteFileConfirm(file: MediaFile) {
    if (file.source === "local") return;
    if (!confirm(`"${file.name}" 삭제하시겠습니까?`)) return;
    deleteFile(file);
  }

  function copyUrl(file: MediaFile) {
    const u = file.url;
    try { navigator.clipboard.writeText(u); } catch {
      const ta = document.createElement("textarea"); ta.value = u;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(file.name);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleTag(tag: MediaTag) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  // Filter files
  const filtered = files.filter((f) => {
    if (!f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeSource !== "all" && f.source !== activeSource) return false;
    if (activeTags.size > 0 && !activeTags.has(f.tag)) return false;
    return true;
  });

  // Tag counts for filter chips
  const tagCounts = new Map<MediaTag, number>();
  const sourceCounts = { cloud: 0, local: 0 };
  for (const f of files) {
    if (!f.name.toLowerCase().includes(search.toLowerCase())) continue;
    if (activeSource !== "all" && f.source !== activeSource) continue;
    tagCounts.set(f.tag, (tagCounts.get(f.tag) || 0) + 1);
    sourceCounts[f.source]++;
  }

  // Build a lookup: storage filename → asset rows
  const urlToAsset = new Map<string, MediaAssetRow>();
  for (const a of assets) {
    const fname = a.storage_url?.split("/").pop() || a.file_name || "";
    if (fname) urlToAsset.set(fname, a);
  }

  // Build grouped view based on viewMode
  function buildGroups(): { sections: { title: string; subtitle?: string; groups: { files: MediaFile[]; isCarousel: boolean }[] }[] } {
    if (viewMode === "all") {
      const autoGroups = autoGroupFiles(filtered);
      const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
      for (const [, items] of autoGroups) {
        groups.push({ files: items, isCarousel: items.length > 1 });
      }
      return { sections: [{ title: "전체", groups }] };
    }

    if (viewMode === "campaign") {
      const campaignMap = new Map<string, { title: string; files: MediaFile[] }>();
      const unlinked: MediaFile[] = [];
      for (const f of filtered) {
        const asset = urlToAsset.get(f.name);
        if (asset?.campaign) {
          const key = asset.campaign.id;
          if (!campaignMap.has(key)) campaignMap.set(key, { title: asset.campaign.title, files: [] });
          campaignMap.get(key)!.files.push(f);
        } else {
          unlinked.push(f);
        }
      }
      const sections = [];
      for (const [, v] of campaignMap) {
        const autoGroups = autoGroupFiles(v.files);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, items] of autoGroups) groups.push({ files: items, isCarousel: items.length > 1 });
        sections.push({ title: v.title, subtitle: "캠페인", groups });
      }
      if (unlinked.length) {
        const autoGroups = autoGroupFiles(unlinked);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, items] of autoGroups) groups.push({ files: items, isCarousel: items.length > 1 });
        sections.push({ title: "미연결", subtitle: "캠페인에 속하지 않은 파일", groups });
      }
      return { sections };
    }

    if (viewMode === "content") {
      const contentMap = new Map<string, { title: string; files: MediaFile[] }>();
      const unlinked: MediaFile[] = [];
      for (const f of filtered) {
        const asset = urlToAsset.get(f.name);
        if (asset?.content) {
          const key = asset.content.id;
          if (!contentMap.has(key)) contentMap.set(key, { title: asset.content.title, files: [] });
          contentMap.get(key)!.files.push(f);
        } else {
          unlinked.push(f);
        }
      }
      const sections = [];
      for (const [, v] of contentMap) {
        const autoGroups = autoGroupFiles(v.files);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, items] of autoGroups) groups.push({ files: items, isCarousel: items.length > 1 });
        sections.push({ title: v.title, subtitle: "콘텐츠", groups });
      }
      if (unlinked.length) {
        const autoGroups = autoGroupFiles(unlinked);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, items] of autoGroups) groups.push({ files: items, isCarousel: items.length > 1 });
        sections.push({ title: "미연결", subtitle: "콘텐츠에 속하지 않은 파일", groups });
      }
      return { sections };
    }

    if (viewMode === "channel") {
      const channelMap = new Map<string, MediaFile[]>();
      const unlinked: MediaFile[] = [];
      for (const f of filtered) {
        const asset = urlToAsset.get(f.name);
        const ch = asset?.channel || asset?.atom?.channel;
        if (ch) {
          if (!channelMap.has(ch)) channelMap.set(ch, []);
          channelMap.get(ch)!.push(f);
        } else {
          unlinked.push(f);
        }
      }
      const channelLabels: Record<string, string> = {
        threads: "Threads", x: "X (Twitter)", linkedin: "LinkedIn",
        instagram: "Instagram", blog: "블로그", brxce_guide: "BRXCE 가이드",
        youtube: "YouTube", newsletter: "뉴스레터",
      };
      const sections = [];
      for (const [ch, items] of channelMap) {
        const autoGroups = autoGroupFiles(items);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, g] of autoGroups) groups.push({ files: g, isCarousel: g.length > 1 });
        sections.push({ title: channelLabels[ch] || ch, subtitle: "채널", groups });
      }
      if (unlinked.length) {
        const autoGroups = autoGroupFiles(unlinked);
        const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
        for (const [, g] of autoGroups) groups.push({ files: g, isCarousel: g.length > 1 });
        sections.push({ title: "미연결", subtitle: "채널 미지정", groups });
      }
      return { sections };
    }

    // unlinked
    const unlinked = filtered.filter((f) => !urlToAsset.has(f.name));
    const autoGroups = autoGroupFiles(unlinked);
    const groups: { files: MediaFile[]; isCarousel: boolean }[] = [];
    for (const [, items] of autoGroups) groups.push({ files: items, isCarousel: items.length > 1 });
    return { sections: [{ title: "미연결 파일", subtitle: "어떤 캠페인/콘텐츠에도 연결되지 않은 파일", groups }] };
  }

  const { sections } = buildGroups();

  const viewTabs: { key: ViewMode; label: string; icon: string }[] = [
    { key: "all", label: "전체", icon: "🗂" },
    { key: "campaign", label: "캠페인", icon: "🎯" },
    { key: "content", label: "콘텐츠", icon: "📄" },
    { key: "channel", label: "채널", icon: "📡" },
    { key: "unlinked", label: "미연결", icon: "📎" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">미디어 라이브러리</h1>
          <p className="text-xs text-[#666] mt-1">
            {files.length}개 파일 · ☁️ {sourceCounts.cloud} 클라우드 · 💻 {sourceCounts.local} 로컬
          </p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="px-4 py-2 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50">
          {uploading ? "업로드 중..." : "파일 업로드"}
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {/* View mode tabs + search */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-1 bg-[#111] rounded-lg p-1 border border-[#222]">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition ${
                viewMode === tab.key ? "bg-[#222] text-[#fafafa] font-medium" : "text-[#888] hover:text-[#ccc]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="파일명 검색..."
          className="flex-1 max-w-md p-2.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
        />
      </div>

      {/* Source filter + Tag filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {/* Source filter */}
        {(["all", "cloud", "local"] as const).map((src) => {
          const labels = { all: "전체 소스", cloud: "☁️ 클라우드", local: "💻 로컬" };
          return (
            <button
              key={src}
              onClick={() => setActiveSource(src)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                activeSource === src
                  ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "border-[#333] text-[#888] hover:border-[#555] hover:text-[#ccc]"
              }`}
            >
              {labels[src]}
            </button>
          );
        })}

        <div className="w-px h-5 bg-[#333] mx-1" />

        {/* Tag filter chips */}
        {(Object.keys(TAG_INFO) as MediaTag[]).map((tag) => {
          const info = TAG_INFO[tag];
          const count = tagCounts.get(tag) || 0;
          if (count === 0) return null;
          const active = activeTags.has(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                active
                  ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "border-[#333] text-[#888] hover:border-[#555] hover:text-[#ccc]"
              }`}
            >
              {info.icon} {info.label} <span className="ml-1 text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}

        {activeTags.size > 0 && (
          <button onClick={() => setActiveTags(new Set())} className="px-2 py-1 text-[10px] text-[#888] hover:text-[#ccc]">
            초기화
          </button>
        )}
      </div>

      {/* Drop zone + grid */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
        className={`min-h-[200px] ${dragOver ? "border-[#fafafa] bg-[#111]" : ""}`}
      >
        {dragOver && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-[#555] rounded-[10px] mb-6 text-[#888]">
            여기에 파일을 놓으세요
          </div>
        )}

        {loading ? (
          <div className="text-[#888]">로딩 중...</div>
        ) : sections.every((s) => s.groups.length === 0) ? (
          <div className="text-[#888] text-center py-16">
            {search ? "검색 결과가 없습니다" : "업로드된 미디어가 없습니다"}
          </div>
        ) : (
          <div>
            {sections.map((section) => {
              if (section.groups.length === 0) return null;
              const totalFiles = section.groups.reduce((sum, g) => sum + g.files.length, 0);
              return (
                <div key={section.title}>
                  {(sections.length > 1 || viewMode !== "all") && (
                    <GroupHeader label={section.title} sublabel={section.subtitle} count={totalFiles} />
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {section.groups.map((g, gi) =>
                      g.isCarousel ? (
                        <CarouselStackCard
                          key={`c-${gi}`}
                          files={g.files}
                          onClick={() => setPreviewGroup({ files: g.files, index: 0 })}
                          onCopy={() => copyUrl(g.files[0])}
                          onDeleteAll={g.files[0].source === "cloud" ? () => {
                            if (confirm(`캐러셀 ${g.files.length}장 전체를 삭제하시겠습니까?`)) {
                              g.files.forEach((f) => deleteFile(f));
                            }
                          } : undefined}
                          copied={copied === g.files[0].name}
                        />
                      ) : (
                        <ThumbCard
                          key={`s-${gi}`}
                          file={g.files[0]}
                          badge={(() => {
                            const asset = urlToAsset.get(g.files[0].name);
                            if (asset?.channel || asset?.atom?.channel) {
                              const ch = asset.channel || asset.atom?.channel || "";
                              return { text: ch, color: "bg-blue-500/20 text-blue-400" };
                            }
                            return undefined;
                          })()}
                          onClick={() => {
                            if (isImage(g.files[0].name)) {
                              if (g.files[0].source === "cloud") {
                                navRouter.push(`/media/${encodeURIComponent(g.files[0].name)}`);
                              } else {
                                setPreviewGroup({ files: g.files, index: 0 });
                              }
                            } else {
                              setPreviewGroup({ files: g.files, index: 0 });
                            }
                          }}
                          onCopy={() => copyUrl(g.files[0])}
                          onDelete={g.files[0].source === "cloud" ? () => deleteFileConfirm(g.files[0]) : undefined}
                          copied={copied === g.files[0].name}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewGroup && (
        <CarouselPreviewModal
          files={previewGroup.files}
          initialIndex={previewGroup.index}
          onClose={() => setPreviewGroup(null)}
        />
      )}
    </div>
  );
}
