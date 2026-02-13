"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import Markdown from "react-markdown";
import MediaLibraryModal from "@/components/MediaLibraryModal";

interface Content {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  body_md: string;
  hook: string;
  core_message: string;
  media_type: string;
  tags: string[];
  funnel_stage: string;
  cashflow_line: string;
  cta: string;
  source_idea: string;
  fact_checked: boolean;
  fact_check_notes: string;
}

interface Review {
  id: string;
  reviewer: string;
  comment: string;
  action: string;
  created_at: string;
}

interface Adaptation {
  id: string;
  channel: string;
  format: string;
  body_adapted: string;
  status: string;
}

const STATUSES = ["idea", "draft", "fact-check", "ready", "published", "archived"];
const MEDIA_TYPES = ["text", "image", "video", "carousel"];
const FUNNEL_STAGES = ["awareness", "interest", "trust", "conversion"];
const CASHFLOW_LINES = ["consulting", "course", "service", "community"];

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adaptations, setAdaptations] = useState<Adaptation[]>([]);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertImageMarkdown(url: string) {
    if (!content) return;
    const ta = textareaRef.current;
    const md = `![](${url})`;
    const body = content.body_md || "";
    if (ta) {
      const start = ta.selectionStart;
      const before = body.slice(0, start);
      const after = body.slice(ta.selectionEnd);
      setContent({ ...content, body_md: before + md + "\n" + after });
    } else {
      setContent({ ...content, body_md: body + "\n" + md + "\n" });
    }
  }

  async function handleEditorDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length || !content) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const sb = createSupabaseBrowser();
    const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await sb.storage.from("content-media").upload(name, file, { cacheControl: "3600" });
    if (!error) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-media/${name}`;
      insertImageMarkdown(url);
    }
  }

  const load = useCallback(async () => {
    const sb = createSupabaseBrowser();
    const [{ data: c }, { data: r }, { data: a }] = await Promise.all([
      sb.from("contents").select("*").eq("id", id).single(),
      sb.from("content_reviews").select("*").eq("content_id", id).order("created_at", { ascending: false }),
      sb.from("adaptations").select("*").eq("content_id", id),
    ]);
    setContent(c);
    setReviews(r || []);
    setAdaptations(a || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!content) return;
    setSaving(true);
    const sb = createSupabaseBrowser();
    await sb.from("contents").update({
      title: content.title,
      slug: content.slug,
      status: content.status,
      category: content.category,
      body_md: content.body_md,
      hook: content.hook,
      core_message: content.core_message,
      media_type: content.media_type,
      tags: content.tags,
      funnel_stage: content.funnel_stage,
      cashflow_line: content.cashflow_line,
      cta: content.cta,
      fact_checked: content.fact_checked,
      fact_check_notes: content.fact_check_notes,
    }).eq("id", id);
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setDeleting(true);
    const sb = createSupabaseBrowser();
    await sb.from("contents").delete().eq("id", id);
    router.push("/admin/contents");
  }

  async function addReview(action: string) {
    if (!newComment.trim()) return;
    const sb = createSupabaseBrowser();
    await sb.from("content_reviews").insert({
      content_id: id,
      comment: newComment,
      action,
    });
    setNewComment("");
    load();
  }

  if (!content) return <div className="text-[#888]">Loading...</div>;

  const inputClass = "w-full p-2.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]";
  const tagsStr = Array.isArray(content.tags) ? content.tags.join(", ") : "";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {editing ? (
            <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className={`${inputClass} text-2xl font-bold`} />
          ) : content.title}
        </h1>
        <div className="flex gap-2">
          {content.slug && (
            <a
              href={`/guides/${content.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-[10px] border border-[#333] text-sm text-[#888] no-underline hover:text-[#fafafa] hover:border-[#555]"
            >
              👁️ 미리보기
            </a>
          )}
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50">
                {saving ? "저장 중..." : "저장"}
              </button>
              <button onClick={() => { setEditing(false); load(); }} className="px-4 py-2 rounded-[10px] border border-[#333] text-sm text-[#888] hover:text-[#fafafa]">취소</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-[10px] border border-[#333] text-sm text-[#fafafa] hover:border-[#555]">편집</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-[10px] border border-red-800 text-sm text-red-400 hover:bg-red-900/30 disabled:opacity-50">
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { key: "status", label: "상태", type: "select", options: STATUSES, alwaysEditable: true, instantSave: true },
          { key: "slug", label: "Slug" },
          { key: "category", label: "카테고리" },
          { key: "hook", label: "Hook" },
          { key: "media_type", label: "미디어 타입", type: "select", options: MEDIA_TYPES, nullable: true },
          { key: "funnel_stage", label: "퍼널", type: "select", options: FUNNEL_STAGES, nullable: true },
          { key: "cashflow_line", label: "캐시플로우", type: "select", options: CASHFLOW_LINES, nullable: true },
          { key: "cta", label: "CTA" },
        ].map((field) => {
          const isEditable = editing || (field as { alwaysEditable?: boolean }).alwaysEditable;
          const shouldInstantSave = (field as { instantSave?: boolean }).instantSave;
          return (
            <div key={field.key}>
              <label className="text-xs text-[#888] block mb-1">{field.label}</label>
              {isEditable ? (
                field.type === "select" ? (
                  <select
                    value={((content as unknown as Record<string, string>)[field.key]) || ""}
                    onChange={async (e) => {
                      const val = e.target.value || null;
                      setContent({ ...content, [field.key]: val });
                      if (shouldInstantSave) {
                        const sb = createSupabaseBrowser();
                        await sb.from("contents").update({ [field.key]: val }).eq("id", id);
                      }
                    }}
                    className={inputClass}
                  >
                    {field.nullable && <option value="">-</option>}
                    {field.options!.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input value={((content as unknown as Record<string, string>)[field.key]) || ""} onChange={(e) => setContent({ ...content, [field.key]: e.target.value })} className={inputClass} />
                )
              ) : (
                <span className="text-sm text-[#ccc]">{((content as unknown as Record<string, string>)[field.key]) || "-"}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="text-xs text-[#888] block mb-1">Tags</label>
        {editing ? (
          <input value={tagsStr} onChange={(e) => setContent({ ...content, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inputClass} placeholder="쉼표 구분" />
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {content.tags?.length ? content.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#333] text-[#ccc]">{t}</span>
            )) : <span className="text-sm text-[#666]">-</span>}
          </div>
        )}
      </div>

      {/* Core Message */}
      <div className="mb-4">
        <label className="text-xs text-[#888] block mb-1">Core Message</label>
        {editing ? (
          <textarea value={content.core_message || ""} onChange={(e) => setContent({ ...content, core_message: e.target.value })} className={`${inputClass} min-h-[80px]`} />
        ) : (
          <p className="text-sm text-[#ccc]">{content.core_message || "-"}</p>
        )}
      </div>

      {/* Fact check */}
      <div className="flex items-center gap-4 p-4 bg-[#141414] border border-[#222] rounded-[10px] mb-6">
        {editing ? (
          <>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={content.fact_checked} onChange={(e) => setContent({ ...content, fact_checked: e.target.checked })} className="accent-green-500" />
              팩트체크 완료
            </label>
            <input value={content.fact_check_notes || ""} onChange={(e) => setContent({ ...content, fact_check_notes: e.target.value })} placeholder="메모" className={`${inputClass} flex-1`} />
          </>
        ) : (
          <>
            <span className={`text-sm ${content.fact_checked ? "text-green-400" : "text-[#666]"}`}>
              {content.fact_checked ? "✓ 팩트체크 완료" : "팩트체크 미완료"}
            </span>
            {content.fact_check_notes && <span className="text-xs text-[#888]">— {content.fact_check_notes}</span>}
          </>
        )}
      </div>

      {/* Body */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs text-[#888]">본문 (Markdown)</label>
          {editing && (
            <>
              <button onClick={() => setPreview(!preview)} className="text-xs text-[#666] hover:text-[#fafafa]">
                {preview ? "편집" : "프리뷰"}
              </button>
              {!preview && (
                <button onClick={() => setMediaOpen(true)} className="text-xs text-[#666] hover:text-[#fafafa]">
                  🖼️ 이미지 삽입
                </button>
              )}
            </>
          )}
        </div>
        {editing ? (
          preview ? (
            <div className="prose-dark p-6 bg-[#111] border border-[#222] rounded-[10px] min-h-[300px]">
              <Markdown>{content.body_md || ""}</Markdown>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content.body_md || ""}
              onChange={(e) => setContent({ ...content, body_md: e.target.value })}
              onDrop={handleEditorDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`${inputClass} min-h-[400px] font-mono text-[13px] leading-relaxed`}
            />
          )
        ) : (
          <div className="prose-dark p-6 bg-[#111] border border-[#222] rounded-[10px]">
            <Markdown>{content.body_md || "*본문 없음*"}</Markdown>
          </div>
        )}
      </div>

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => { insertImageMarkdown(url); setMediaOpen(false); }}
      />

      {/* Adaptations */}
      {adaptations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">채널별 변환본</h2>
          <div className="flex flex-col gap-2">
            {adaptations.map((a) => (
              <div key={a.id} className="p-4 bg-[#141414] border border-[#222] rounded-[10px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{a.channel}</span>
                  <span className="text-xs text-[#888]">{a.format} · {a.status}</span>
                </div>
                <p className="text-sm text-[#ccc] whitespace-pre-wrap">{a.body_adapted || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-bold mb-3">리뷰</h2>
        <div className="flex flex-col gap-2 mb-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-3 bg-[#111] border border-[#1a1a1a] rounded-[10px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{r.reviewer}</span>
                <span className="text-xs text-[#666]">{r.action}</span>
                <span className="text-xs text-[#555]">{new Date(r.created_at).toLocaleString("ko-KR")}</span>
              </div>
              <p className="text-sm text-[#ccc]">{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-[#666]">리뷰가 없습니다.</p>}
        </div>

        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="코멘트 입력..." className={`${inputClass} min-h-[80px] mb-2`} />
        <div className="flex gap-2">
          <button onClick={() => addReview("comment")} className="px-3 py-1.5 rounded-[10px] border border-[#333] text-sm text-[#fafafa] hover:border-[#555]">코멘트</button>
          <button onClick={() => addReview("approve")} className="px-3 py-1.5 rounded-[10px] bg-green-600 text-sm text-white hover:bg-green-700">승인</button>
          <button onClick={() => addReview("request-change")} className="px-3 py-1.5 rounded-[10px] bg-yellow-600 text-sm text-white hover:bg-yellow-700">수정 요청</button>
        </div>
      </div>
    </div>
  );
}
