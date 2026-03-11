"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface VideoRef {
  id: string;
  account_id: string;
  post_date: string;
  platform: string;
  duration_sec: number | null;
  like_count: number;
  comment_count: number;
  view_count: number | null;
  caption: string;
  url: string | null;
  thumbnail_path: string | null;
  video_path: string | null;
  style_tags: string | null;
  transition_tags: string | null;
  music_tags: string | null;
  notes: string | null;
}

interface Account {
  id: string;
  display_name: string | null;
  platform: string | null;
}

const STYLE_OPTIONS = [
  "vlog",
  "talking-head",
  "b-roll",
  "cinematic",
  "text-overlay",
  "montage",
  "tutorial",
  "before-after",
  "day-in-the-life",
  "reaction",
  "interview",
];
const PLATFORM_OPTIONS = ["instagram", "youtube", "tiktok", "threads"];
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회순" },
  { value: "likes", label: "좋아요순" },
  { value: "comments", label: "댓글순" },
];

export default function VideoReferencesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [videos, setVideos] = useState<VideoRef[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [styleFilter, setStyleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Modal
  const [selectedVideo, setSelectedVideo] = useState<VideoRef | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/references/video/accounts");
      if (!res.ok) return;
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      /* API not ready yet */
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (accountFilter) params.set("account", accountFilter);
      if (platformFilter) params.set("platform", platformFilter);
      if (styleFilter) params.set("style", styleFilter);
      params.set("sort", sortBy);
      params.set("limit", "60");
      const res = await fetch(`/api/references/video/posts?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVideos(data.videos || []);
      setTotal(data.total || 0);
    } catch {
      setVideos([]);
      setTotal(0);
    }
    setLoading(false);
  }, [accountFilter, platformFilter, styleFilter, sortBy]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const openVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/references/video/posts/${id}`);
      const data = await res.json();
      setSelectedVideo(data);
      setEditing(false);
    } catch {
      /* */
    }
  };

  const saveEdit = async () => {
    if (!selectedVideo) return;
    await fetch(`/api/references/video/posts/${selectedVideo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(false);
    fetchVideos();
    openVideo(selectedVideo.id);
  };

  const startEdit = () => {
    if (!selectedVideo) return;
    setEditForm({
      style_tags: selectedVideo.style_tags ?? "",
      transition_tags: selectedVideo.transition_tags ?? "",
      music_tags: selectedVideo.music_tags ?? "",
      notes: selectedVideo.notes ?? "",
    });
    setEditing(true);
  };

  function formatDuration(sec: number | null) {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen p-6 text-[#fafafa]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎬 영상 레퍼런스</h1>
          <p className="text-sm text-[#666] mt-1">
            숏폼 · 릴스 · 브이로그 레퍼런스 수집
          </p>
        </div>
        <button
          onClick={() => { setShowImportModal(true); setImportUrl(""); }}
          disabled={importing}
          className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] disabled:opacity-50"
        >
          {importing ? "임포트 중..." : "📥 Import"}
        </button>
      </div>

      {importResult && (
        <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg text-sm">
          {importResult}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAccountFilter("")}
            className={`px-3 py-1.5 rounded-full text-sm ${!accountFilter ? "bg-[#ff6b35] text-white" : "bg-[#1a1a1a] text-[#888] hover:text-[#fafafa]"}`}
          >
            전체
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountFilter(a.id)}
              className={`px-3 py-1.5 rounded-full text-sm ${accountFilter === a.id ? "bg-[#ff6b35] text-white" : "bg-[#1a1a1a] text-[#888] hover:text-[#fafafa]"}`}
            >
              @{a.display_name || a.id}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <Select
            label="플랫폼"
            value={platformFilter}
            onChange={setPlatformFilter}
            options={PLATFORM_OPTIONS}
          />
          <Select
            label="스타일"
            value={styleFilter}
            onChange={setStyleFilter}
            options={STYLE_OPTIONS}
          />
          <Select
            label="정렬"
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS.map((s) => s.value)}
            labels={SORT_OPTIONS.map((s) => s.label)}
          />
        </div>
      </div>

      <p className="text-sm text-[#666] mb-4">{total}개 영상</p>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-[#666] py-20">로딩 중...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-[#666] text-lg mb-2">아직 영상 레퍼런스가 없습니다</p>
          <p className="text-[#555] text-sm">
            Import 버튼으로 영상 레퍼런스를 추가해보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              onOpen={() => openVideo(v.id)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-[#111] rounded-2xl max-h-[95vh] overflow-auto flex flex-col"
            style={{ width: "min(420px, 90vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video / Thumbnail — 9:16 */}
            <div className="relative aspect-[9/16] bg-black rounded-t-2xl overflow-hidden flex-shrink-0">
              {selectedVideo.video_path ? (
                <video
                  src={`/api/references/video/stream/${selectedVideo.id}`}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : selectedVideo.thumbnail_path ? (
                <img
                  src={`/api/references/video/thumbnail/${selectedVideo.id}`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-[#333]">
                  🎬
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    @{selectedVideo.account_id}
                  </span>
                  <span className="text-sm text-[#888]">
                    {selectedVideo.post_date}
                  </span>
                  {selectedVideo.platform && (
                    <Badge
                      text={selectedVideo.platform}
                      color="#ff6b35"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={startEdit}
                    className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-sm hover:bg-[#222]"
                  >
                    ✏️ 태그 편집
                  </button>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-[#666] hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm text-[#888]">
                <span>⏱ {formatDuration(selectedVideo.duration_sec)}</span>
                {selectedVideo.view_count != null && (
                  <span>
                    👁 {selectedVideo.view_count.toLocaleString()}
                  </span>
                )}
                <span>
                  ❤️ {selectedVideo.like_count?.toLocaleString()}
                </span>
                <span>
                  💬 {selectedVideo.comment_count?.toLocaleString()}
                </span>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <TagRow label="스타일" value={selectedVideo.style_tags} />
                <TagRow
                  label="트랜지션"
                  value={selectedVideo.transition_tags}
                />
                <TagRow label="음악" value={selectedVideo.music_tags} />
                <TagRow label="메모" value={selectedVideo.notes} />
              </div>

              {/* Caption */}
              {selectedVideo.caption && (
                <div className="text-sm text-[#aaa] bg-[#0a0a0a] p-3 rounded-lg">
                  {selectedVideo.caption}
                </div>
              )}
            </div>

            {/* Edit overlay */}
            {editing && (
              <div
                className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center"
                onClick={() => setEditing(false)}
              >
                <div
                  className="bg-[#111] rounded-2xl p-6 w-96 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="font-bold mb-2">태그 편집</h4>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">
                      스타일 (쉼표 구분)
                    </label>
                    <input
                      value={editForm.style_tags || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          style_tags: e.target.value,
                        })
                      }
                      placeholder="vlog, cinematic, montage"
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">
                      트랜지션 (쉼표 구분)
                    </label>
                    <input
                      value={editForm.transition_tags || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          transition_tags: e.target.value,
                        })
                      }
                      placeholder="cut, fade, zoom, swipe"
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">
                      음악
                    </label>
                    <input
                      value={editForm.music_tags || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          music_tags: e.target.value,
                        })
                      }
                      placeholder="upbeat, lo-fi, acoustic"
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">
                      메모
                    </label>
                    <textarea
                      value={editForm.notes || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm h-20 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 px-3 py-2 bg-[#ff6b35] text-white rounded-lg text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 px-3 py-2 bg-[#1a1a1a] rounded-lg text-sm"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-[#111] rounded-2xl p-6 w-[480px] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#fafafa]">📥 영상 레퍼런스 임포트</h3>
            <p className="text-sm text-[#888]">
              Instagram, YouTube, TikTok 영상 URL을 입력하세요.
            </p>
            <input
              autoFocus
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && importUrl.trim()) {
                  handleImport(importUrl.trim());
                }
              }}
              placeholder="https://www.instagram.com/reel/..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm text-[#fafafa] placeholder-[#555] focus:outline-none focus:border-[#ff6b35]"
            />
            {importResult && (
              <div className="text-sm p-2 bg-[#0a0a0a] rounded-lg">{importResult}</div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowImportModal(false); setImportResult(""); }}
                className="px-4 py-2 bg-[#1a1a1a] rounded-lg text-sm text-[#888] hover:text-white"
              >
                닫기
              </button>
              <button
                onClick={() => importUrl.trim() && handleImport(importUrl.trim())}
                disabled={importing || !importUrl.trim()}
                className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] disabled:opacity-50"
              >
                {importing ? "임포트 중..." : "임포트"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleImport(url: string) {
    setImporting(true);
    setImportResult("");
    fetch("/api/references/video/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setImportResult(`❌ ${d.error}`);
        } else {
          setShowImportModal(false);
          setImportUrl("");
          setImportResult("");
          fetchVideos();
          fetchAccounts();
        }
      })
      .catch((e) => setImportResult(`❌ ${e.message}`))
      .finally(() => setImporting(false));
  }
}

function VideoCard({
  video: v,
  onOpen,
  formatDuration,
}: {
  video: VideoRef;
  onOpen: () => void;
  formatDuration: (s: number | null) => string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);
  const wantPlay = useRef(false);

  const hasVideo = !!v.video_path;
  const streamUrl = `/api/references/video/stream/${v.id}`;
  const thumbUrl = `/api/references/video/thumbnail/${v.id}`;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => {
        setHovering(true);
        wantPlay.current = true;
        if (hasVideo && videoRef.current) {
          const el = videoRef.current;
          if (el.readyState >= 2) {
            el.currentTime = 0;
            el.play().catch(() => {});
          } else {
            // src가 아직 로드 안 됐으면 load 트리거
            el.load();
          }
        }
      }}
      onMouseLeave={() => {
        setHovering(false);
        wantPlay.current = false;
        if (hasVideo && videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="bg-[#111] rounded-xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-[#ff6b35]/50 transition group"
    >
      {/* Thumbnail / Hover Video */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden">
        {/* Thumbnail (always rendered as base layer) */}
        {v.thumbnail_path ? (
          <img
            src={thumbUrl}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${hovering && hasVideo ? "opacity-0" : "opacity-100"}`}
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 w-full h-full flex items-center justify-center text-4xl text-[#333] ${hovering && hasVideo ? "opacity-0" : "opacity-100"}`}>
            🎬
          </div>
        )}

        {/* Video — src always set, preload metadata for fast hover play */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={streamUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => {
              if (wantPlay.current && videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${hovering ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Play icon overlay */}
        {hasVideo && !hovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Duration badge */}
        {v.duration_sec != null && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-mono z-10">
            {formatDuration(v.duration_sec)}
          </div>
        )}
        {/* Platform badge */}
        <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] z-10">
          {v.platform || "—"}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">@{v.account_id}</span>
          <span className="text-xs text-[#666]">{v.post_date}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#666]">
          {v.view_count != null && (
            <span>👁 {v.view_count.toLocaleString()}</span>
          )}
          <span>❤️ {v.like_count?.toLocaleString()}</span>
          <span>💬 {v.comment_count?.toLocaleString()}</span>
        </div>
        {v.style_tags && (
          <div className="flex gap-1 flex-wrap">
            {v.style_tags.split(",").map((t) => (
              <Badge key={t.trim()} text={t.trim()} color="#2563eb" />
            ))}
          </div>
        )}
        {v.caption && (
          <p className="text-xs text-[#555] truncate">{v.caption}</p>
        )}
      </div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ backgroundColor: color + "22", color }}
    >
      {text}
    </span>
  );
}

function TagRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#666]">{label}</span>
      <span className={value ? "text-[#fafafa]" : "text-[#333]"}>
        {value || "—"}
      </span>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-[#ccc]"
    >
      <option value="">{label}</option>
      {options.map((o, i) => (
        <option key={o} value={o}>
          {labels?.[i] ?? o}
        </option>
      ))}
    </select>
  );
}
