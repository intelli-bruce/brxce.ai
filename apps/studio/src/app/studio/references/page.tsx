"use client";

import { useEffect, useState, useCallback } from "react";

interface Post {
  id: string;
  account_id: string;
  post_date: string;
  post_type: string;
  slide_count: number;
  like_count: number;
  comment_count: number;
  caption: string;
  layout_pattern: string | null;
  hook_type: string | null;
  cta_type: string | null;
  topic_tags: string | null;
  notes: string | null;
  slides?: Slide[];
}

interface Slide {
  id: number;
  post_id: string;
  slide_index: number;
  image_path: string;
  template_type: string | null;
}

interface Account {
  id: string;
  display_name: string | null;
  category: string | null;
  follower_count: number | null;
}

const LAYOUT_OPTIONS = ["list", "step-by-step", "compare", "quote", "tips", "tutorial", "story", "stat-highlight", "problem-solution"];
const HOOK_OPTIONS = ["question", "stat", "problem", "teaser", "bold-claim"];
const CTA_OPTIONS = ["comment-dm", "follow", "save", "link", "none"];
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "likes", label: "좋아요순" },
  { value: "comments", label: "댓글순" },
];

function slideImageUrl(postId: string, idx: number) {
  return `/api/references/slides/${postId}/${idx}/image`;
}

export default function ReferencesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [layoutFilter, setLayoutFilter] = useState<string>("");
  const [hookFilter, setHookFilter] = useState<string>("");
  const [ctaFilter, setCtaFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>("");

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/references/accounts");
    const data = await res.json();
    setAccounts(data.accounts || []);
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (accountFilter) params.set("account", accountFilter);
    if (layoutFilter) params.set("layout", layoutFilter);
    if (hookFilter) params.set("hook", hookFilter);
    if (ctaFilter) params.set("cta", ctaFilter);
    params.set("sort", sortBy);
    params.set("limit", "60");
    const res = await fetch(`/api/references/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [accountFilter, layoutFilter, hookFilter, ctaFilter, sortBy]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openPost = async (postId: string) => {
    const res = await fetch(`/api/references/posts/${postId}`);
    const data = await res.json();
    setSelectedPost(data);
    setCurrentSlide(1);
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!selectedPost) return;
    await fetch(`/api/references/posts/${selectedPost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(false);
    fetchPosts();
    openPost(selectedPost.id);
  };

  const startEdit = () => {
    if (!selectedPost) return;
    setEditForm({
      layout_pattern: selectedPost.layout_pattern ?? "",
      hook_type: selectedPost.hook_type ?? "",
      cta_type: selectedPost.cta_type ?? "",
      topic_tags: selectedPost.topic_tags ?? "",
      notes: selectedPost.notes ?? "",
    });
    setEditing(true);
  };

  const runImport = async (source: string, accountId: string) => {
    setImporting(true);
    setImportResult("");
    try {
      const res = await fetch("/api/references/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, accountId }),
      });
      const data = await res.json();
      setImportResult(`✅ ${data.imported}개 임포트 / ${data.skipped}개 스킵`);
      fetchAccounts();
      fetchPosts();
    } catch (e: any) {
      setImportResult(`❌ ${e.message}`);
    }
    setImporting(false);
  };

  return (
    <div className="min-h-screen p-6 text-[#fafafa]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📚 레퍼런스</h1>
        <button
          onClick={() => {
            const source = prompt("instaloader 폴더 경로:", "/tmp/divyannshisharma");
            const accountId = prompt("계정 ID:", "divyannshisharma");
            if (source && accountId) runImport(source, accountId);
          }}
          disabled={importing}
          className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] disabled:opacity-50"
        >
          {importing ? "임포트 중..." : "📥 Import"}
        </button>
      </div>

      {importResult && (
        <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg text-sm">{importResult}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Account chips */}
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
              @{a.id}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <Select label="레이아웃" value={layoutFilter} onChange={setLayoutFilter} options={LAYOUT_OPTIONS} />
          <Select label="훅" value={hookFilter} onChange={setHookFilter} options={HOOK_OPTIONS} />
          <Select label="CTA" value={ctaFilter} onChange={setCtaFilter} options={CTA_OPTIONS} />
          <Select label="정렬" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS.map(s => s.value)} labels={SORT_OPTIONS.map(s => s.label)} />
        </div>
      </div>

      {/* Stats */}
      <p className="text-sm text-[#666] mb-4">{total}개 포스트</p>

      {/* List - each post is a horizontal row of slides */}
      {loading ? (
        <div className="text-center text-[#666] py-20">로딩 중...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#111] rounded-xl overflow-hidden"
            >
              {/* Post header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">@{post.account_id}</span>
                  <span className="text-xs text-[#666]">{post.post_date}</span>
                  <span className="text-xs text-[#666]">❤️ {post.like_count?.toLocaleString()}</span>
                  <span className="text-xs text-[#666]">💬 {post.comment_count?.toLocaleString()}</span>
                  <span className="text-xs text-[#555]">{post.slide_count}장</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.layout_pattern && <Badge text={post.layout_pattern} color="#2563eb" />}
                  {post.hook_type && <Badge text={post.hook_type} color="#7c3aed" />}
                  {post.cta_type && <Badge text={post.cta_type} color="#059669" />}
                  <button
                    onClick={() => openPost(post.id)}
                    className="ml-2 px-2.5 py-1 text-xs bg-[#1a1a1a] rounded-lg hover:bg-[#222] text-[#888] hover:text-white"
                  >
                    상세
                  </button>
                </div>
              </div>
              {/* Slides row */}
              <div className="overflow-x-auto p-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-3 min-w-min">
                  {Array.from({ length: post.slide_count }, (_, i) => (
                    <div key={i} className="flex-shrink-0 relative" style={{ maxWidth: 320 }}>
                      <img
                        src={slideImageUrl(post.id, i + 1)}
                        alt={`Slide ${i + 1}`}
                        className="h-auto w-[320px] max-w-[320px] object-contain rounded-lg bg-black"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px]">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - slides laid out horizontally in one row */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col" onClick={() => setSelectedPost(null)}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-lg">@{selectedPost.account_id}</h3>
              <span className="text-sm text-[#888]">{selectedPost.post_date} · {selectedPost.slide_count}장</span>
              <span className="text-sm">❤️ {selectedPost.like_count?.toLocaleString()}</span>
              <span className="text-sm">💬 {selectedPost.comment_count?.toLocaleString()}</span>
              {selectedPost.layout_pattern && <Badge text={selectedPost.layout_pattern} color="#2563eb" />}
              {selectedPost.hook_type && <Badge text={selectedPost.hook_type} color="#7c3aed" />}
              {selectedPost.cta_type && <Badge text={selectedPost.cta_type} color="#059669" />}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={startEdit}
                className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-sm hover:bg-[#222]"
              >
                ✏️ 태그 편집
              </button>
              <button onClick={() => setSelectedPost(null)} className="text-[#666] hover:text-white text-2xl">✕</button>
            </div>
          </div>

          {/* Slides row - horizontal scroll */}
          <div
            className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3 h-full items-center min-w-min">
              {Array.from({ length: selectedPost.slide_count }, (_, i) => (
                <div key={i} className="flex-shrink-0 h-[calc(100vh-140px)] relative">
                  <img
                    src={slideImageUrl(selectedPost.id, i + 1)}
                    alt={`Slide ${i + 1}`}
                    className="h-full w-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caption bar */}
          {selectedPost.caption && (
            <div className="px-6 pb-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="text-sm text-[#aaa] bg-[#111] p-3 rounded-lg max-w-3xl truncate">
                {selectedPost.caption.slice(0, 200)}
              </div>
            </div>
          )}

          {/* Edit overlay */}
          {editing && (
            <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center" onClick={() => setEditing(false)}>
              <div className="bg-[#111] rounded-2xl p-6 w-96 space-y-3" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-bold mb-2">태그 편집</h4>
                <EditSelect label="레이아웃" field="layout_pattern" options={LAYOUT_OPTIONS} form={editForm} setForm={setEditForm} />
                <EditSelect label="훅" field="hook_type" options={HOOK_OPTIONS} form={editForm} setForm={setEditForm} />
                <EditSelect label="CTA" field="cta_type" options={CTA_OPTIONS} form={editForm} setForm={setEditForm} />
                <div>
                  <label className="text-xs text-[#666] mb-1 block">토픽 (쉼표 구분)</label>
                  <input
                    value={editForm.topic_tags || ""}
                    onChange={(e) => setEditForm({ ...editForm, topic_tags: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">메모</label>
                  <textarea
                    value={editForm.notes || ""}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm h-20 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 px-3 py-2 bg-[#ff6b35] text-white rounded-lg text-sm">저장</button>
                  <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 bg-[#1a1a1a] rounded-lg text-sm">취소</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: color + "22", color }}>
      {text}
    </span>
  );
}

function TagRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#666]">{label}</span>
      <span className={value ? "text-[#fafafa]" : "text-[#333]"}>{value || "—"}</span>
    </div>
  );
}

function Select({ label, value, onChange, options, labels }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-[#ccc]"
    >
      <option value="">{label}</option>
      {options.map((o, i) => (
        <option key={o} value={o}>{labels?.[i] ?? o}</option>
      ))}
    </select>
  );
}

function EditSelect({ label, field, options, form, setForm }: {
  label: string; field: string; options: string[];
  form: Record<string, string>; setForm: (f: Record<string, string>) => void;
}) {
  return (
    <div>
      <label className="text-xs text-[#666] mb-1 block">{label}</label>
      <select
        value={form[field] || ""}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-sm"
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
