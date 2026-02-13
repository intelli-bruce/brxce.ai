"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import Markdown from "react-markdown";

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

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sb = createSupabaseBrowser();
  const [content, setContent] = useState<Content | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adaptations, setAdaptations] = useState<Adaptation[]>([]);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [{ data: c }, { data: r }, { data: a }] = await Promise.all([
      sb.from("contents").select("*").eq("id", id).single(),
      sb.from("content_reviews").select("*").eq("content_id", id).order("created_at", { ascending: false }),
      sb.from("adaptations").select("*").eq("content_id", id),
    ]);
    setContent(c);
    setReviews(r || []);
    setAdaptations(a || []);
  }, [id, sb]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!content) return;
    setSaving(true);
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

  async function addReview(action: string) {
    if (!newComment.trim()) return;
    await sb.from("content_reviews").insert({
      content_id: id,
      comment: newComment,
      action,
    });
    setNewComment("");
    load();
  }

  if (!content) return <div className="text-[#888]">Loading...</div>;

  const inputClass = "w-full p-2.5 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {editing ? (
            <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className={`${inputClass} text-2xl font-bold`} />
          ) : (
            content.title
          )}
        </h1>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0] disabled:opacity-50">
                {saving ? "저장 중..." : "저장"}
              </button>
              <button onClick={() => { setEditing(false); load(); }} className="px-4 py-2 rounded-lg border border-[#333] text-sm text-[#888] hover:text-[#fafafa]">
                취소
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg border border-[#333] text-sm text-[#fafafa] hover:border-[#555]">
              편집
            </button>
          )}
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-[#888] block mb-1">상태</label>
          {editing ? (
            <select value={content.status} onChange={(e) => setContent({ ...content, status: e.target.value })} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className="text-sm">{content.status}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Slug</label>
          {editing ? (
            <input value={content.slug || ""} onChange={(e) => setContent({ ...content, slug: e.target.value })} className={inputClass} />
          ) : (
            <span className="text-sm text-[#ccc]">{content.slug || "-"}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">카테고리</label>
          {editing ? (
            <input value={content.category || ""} onChange={(e) => setContent({ ...content, category: e.target.value })} className={inputClass} />
          ) : (
            <span className="text-sm text-[#ccc]">{content.category || "-"}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">Hook</label>
          {editing ? (
            <input value={content.hook || ""} onChange={(e) => setContent({ ...content, hook: e.target.value })} className={inputClass} />
          ) : (
            <span className="text-sm text-[#ccc]">{content.hook || "-"}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">퍼널</label>
          {editing ? (
            <select value={content.funnel_stage || ""} onChange={(e) => setContent({ ...content, funnel_stage: e.target.value })} className={inputClass}>
              <option value="">-</option>
              {["awareness", "interest", "trust", "conversion"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className="text-sm text-[#ccc]">{content.funnel_stage || "-"}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">CTA</label>
          {editing ? (
            <input value={content.cta || ""} onChange={(e) => setContent({ ...content, cta: e.target.value })} className={inputClass} />
          ) : (
            <span className="text-sm text-[#ccc]">{content.cta || "-"}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs text-[#888]">본문 (Markdown)</label>
          {editing && (
            <button onClick={() => setPreview(!preview)} className="text-xs text-[#666] hover:text-[#fafafa]">
              {preview ? "편집" : "프리뷰"}
            </button>
          )}
        </div>
        {editing ? (
          preview ? (
            <div className="prose-dark p-6 bg-[#111] border border-[#222] rounded-xl min-h-[300px]">
              <Markdown>{content.body_md || ""}</Markdown>
            </div>
          ) : (
            <textarea
              value={content.body_md || ""}
              onChange={(e) => setContent({ ...content, body_md: e.target.value })}
              className={`${inputClass} min-h-[400px] font-mono text-[13px] leading-relaxed`}
            />
          )
        ) : (
          <div className="prose-dark p-6 bg-[#111] border border-[#222] rounded-xl">
            <Markdown>{content.body_md || "*본문 없음*"}</Markdown>
          </div>
        )}
      </div>

      {/* Adaptations */}
      {adaptations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">채널별 변환본</h2>
          <div className="flex flex-col gap-2">
            {adaptations.map((a) => (
              <div key={a.id} className="p-4 bg-[#141414] border border-[#222] rounded-xl">
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
            <div key={r.id} className="p-3 bg-[#111] border border-[#1a1a1a] rounded-lg">
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

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="코멘트 입력..."
          className={`${inputClass} min-h-[80px] mb-2`}
        />
        <div className="flex gap-2">
          <button onClick={() => addReview("comment")} className="px-3 py-1.5 rounded-lg border border-[#333] text-sm text-[#fafafa] hover:border-[#555]">
            코멘트
          </button>
          <button onClick={() => addReview("approve")} className="px-3 py-1.5 rounded-lg bg-green-600 text-sm text-white hover:bg-green-700">
            승인
          </button>
          <button onClick={() => addReview("request-change")} className="px-3 py-1.5 rounded-lg bg-yellow-600 text-sm text-white hover:bg-yellow-700">
            수정 요청
          </button>
        </div>
      </div>
    </div>
  );
}
