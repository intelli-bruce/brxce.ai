"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Content {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  subcategory: string | null;
  sort_order: number;
  goal: string | null;
  target_audience: string | null;
  strategy: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  idea: "text-[#888]",
  draft: "text-yellow-500",
  "fact-check": "text-orange-400",
  ready: "text-blue-400",
  published: "text-green-400",
  archived: "text-[#555]",
};

const STATUSES = ["idea", "draft", "fact-check", "ready", "published", "archived"];
const CATEGORIES = ["all", "가이드북", "실전 활용법", "크리에이터", "tech"];

type ViewMode = "card" | "table";

/* ── Sortable Row ── */
function SortableRow({
  content: c,
  index,
  editingId,
  editTitle,
  setEditTitle,
  setEditingId,
  saveTitle,
  updateStatus,
}: {
  content: Content;
  index: number;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (v: string) => void;
  setEditingId: (v: string | null) => void;
  saveTitle: (id: string) => void;
  updateStatus: (id: string, s: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[#1a1a1a] hover:bg-[#141414] transition-colors group">
      <td className="py-2 px-1 w-6">
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#555] hover:text-[#888] text-sm select-none">⠿</span>
      </td>
      <td className="py-2 px-2 text-[#555] text-xs w-8">{index + 1}</td>
      <td className="py-2 px-3">
        {editingId === c.id ? (
          <div className="flex items-center gap-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(c.id); if (e.key === "Escape") setEditingId(null); }}
              className="flex-1 bg-[#0a0a0a] border border-[#555] rounded px-2 py-1 text-sm text-[#fafafa] outline-none focus:border-[#FF6B35]"
              autoFocus
            />
            <button onClick={() => saveTitle(c.id)} className="text-xs text-[#4ECDC4] bg-transparent border-none cursor-pointer">✓</button>
            <button onClick={() => setEditingId(null)} className="text-xs text-[#666] bg-transparent border-none cursor-pointer">✗</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href={`/contents/${c.id}`} className="text-[#fafafa] no-underline hover:text-[#FF6B35] transition-colors text-sm">
              {c.title}
            </Link>
            {c.subcategory && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#222] text-[#666]">{c.subcategory}</span>
            )}
            <button
              onClick={() => { setEditingId(c.id); setEditTitle(c.title); }}
              className="text-[10px] text-[#555] bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✏️
            </button>
          </div>
        )}
      </td>
      <td className="py-2 px-3 w-24">
        <select
          value={c.status}
          onChange={(e) => updateStatus(c.id, e.target.value)}
          className={`text-[11px] font-medium px-1.5 py-0.5 rounded border border-[#333] bg-[#0a0a0a] outline-none cursor-pointer ${STATUS_COLORS[c.status] || "text-[#888]"}`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="py-2 px-3 text-[11px] text-[#555] w-24">{new Date(c.created_at).toLocaleDateString("ko-KR")}</td>
      <td className="py-2 px-3 w-10">
        {c.slug && (
          <a href={`/guides/${c.slug}?preview=brxce-preview-2026`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#666] no-underline hover:text-[#fafafa]">👁️</a>
        )}
      </td>
    </tr>
  );
}

/* ── Droppable subcategory group ── */
function SubcategoryGroup({
  sub,
  items,
  editingId,
  editTitle,
  setEditTitle,
  setEditingId,
  saveTitle,
  updateStatus,
}: {
  sub: string;
  items: Content[];
  editingId: string | null;
  editTitle: string;
  setEditTitle: (v: string) => void;
  setEditingId: (v: string | null) => void;
  saveTitle: (id: string) => void;
  updateStatus: (id: string, s: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5 ml-1">
        <span className="text-xs font-semibold text-[#4ECDC4]">{sub}</span>
        <span className="text-[10px] text-[#555]">{items.length}개</span>
        <div className="flex-1 border-t border-[#222]" />
      </div>
      <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#333] text-[#666] text-xs text-left">
              <th className="py-1 px-1 w-6"></th>
              <th className="py-1 px-2 w-8">#</th>
              <th className="py-1 px-3">제목</th>
              <th className="py-1 px-3 w-24">상태</th>
              <th className="py-1 px-3 w-24">날짜</th>
              <th className="py-1 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c, i) => (
              <SortableRow
                key={c.id}
                content={c}
                index={i}
                editingId={editingId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                setEditingId={setEditingId}
                saveTitle={saveTitle}
                updateStatus={updateStatus}
              />
            ))}
          </tbody>
        </table>
      </SortableContext>
    </div>
  );
}

/* ── Main Page ── */
export default function ContentsPage() {
  const sb = createSupabaseBrowser();
  const [contents, setContents] = useState<Content[]>([]);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    let q = sb.from("contents").select("id, title, slug, status, category, subcategory, sort_order, goal, target_audience, strategy, created_at").order("sort_order", { ascending: true });
    if (filter !== "all") q = q.eq("status", filter);
    if (category !== "all") q = q.eq("category", category);
    if (search) q = q.ilike("title", `%${search}%`);
    const { data } = await q;
    setContents(data || []);
  }, [filter, category, search]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, newStatus: string) => {
    await sb.from("contents").update({ status: newStatus }).eq("id", id);
    setContents((prev) => prev.map((x) => x.id === id ? { ...x, status: newStatus } : x));
  };

  const saveTitle = async (id: string) => {
    if (!editTitle.trim()) return;
    await sb.from("contents").update({ title: editTitle.trim() }).eq("id", id);
    setContents((prev) => prev.map((x) => x.id === id ? { ...x, title: editTitle.trim() } : x));
    setEditingId(null);
  };

  // Group by category, then subcategory
  const grouped = contents.reduce<Record<string, Content[]>>((acc, c) => {
    const cat = c.category || "미분류";
    (acc[cat] = acc[cat] || []).push(c);
    return acc;
  }, {});

  const subGrouped = (items: Content[]): Record<string, Content[]> => {
    const result: Record<string, Content[]> = {};
    for (const c of items) {
      const sub = c.subcategory || "미분류";
      (result[sub] = result[sub] || []).push(c);
    }
    for (const key of Object.keys(result)) {
      result[key].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return result;
  };

  // Find which subcategory a content belongs to
  const findSubcategory = (id: string): string | null => {
    const item = contents.find(c => c.id === id);
    return item?.subcategory || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = contents.find(c => c.id === active.id);
    const overItem = contents.find(c => c.id === over.id);
    if (!activeItem || !overItem) return;

    const targetSub = overItem.subcategory;
    const targetCat = overItem.category;

    // Get all items in the target subcategory
    const targetItems = contents
      .filter(c => c.subcategory === targetSub && c.category === targetCat)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Remove active from list if same sub, or just get target list
    const filtered = targetItems.filter(c => c.id !== activeItem.id);
    const overIndex = filtered.findIndex(c => c.id === over.id);
    const newList = [...filtered.slice(0, overIndex + 1), activeItem, ...filtered.slice(overIndex + 1)];

    // Update subcategory if changed
    const subChanged = activeItem.subcategory !== targetSub;
    const catChanged = activeItem.category !== targetCat;

    // Batch update sort_order (and subcategory/category if moved)
    const updates: Promise<unknown>[] = [];
    for (let i = 0; i < newList.length; i++) {
      const item = newList[i];
      const patch: Record<string, unknown> = { sort_order: i + 1 };
      if (item.id === activeItem.id) {
        if (subChanged) patch.subcategory = targetSub;
        if (catChanged) patch.category = targetCat;
      }
      updates.push(sb.from("contents").update(patch).eq("id", item.id));
    }

    // Also re-order the source subcategory if item moved out
    if (subChanged) {
      const sourceItems = contents
        .filter(c => c.subcategory === activeItem.subcategory && c.category === activeItem.category && c.id !== activeItem.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      for (let i = 0; i < sourceItems.length; i++) {
        updates.push(sb.from("contents").update({ sort_order: i + 1 }).eq("id", sourceItems[i].id));
      }
    }

    // Optimistic update
    setContents(prev => prev.map(c => {
      if (c.id === activeItem.id) {
        const idx = newList.findIndex(n => n.id === c.id);
        return { ...c, subcategory: targetSub, category: targetCat, sort_order: idx + 1 };
      }
      const inTarget = newList.find(n => n.id === c.id);
      if (inTarget) {
        const idx = newList.findIndex(n => n.id === c.id);
        return { ...c, sort_order: idx + 1 };
      }
      return c;
    }));

    await Promise.all(updates);
  };

  const activeItem = activeId ? contents.find(c => c.id === activeId) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#333] overflow-hidden">
            <button onClick={() => setViewMode("card")} className={`px-3 py-1.5 text-xs border-none cursor-pointer ${viewMode === "card" ? "bg-[#fafafa] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#888] hover:text-[#fafafa]"}`}>카드</button>
            <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 text-xs border-none cursor-pointer ${viewMode === "table" ? "bg-[#fafafa] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#888] hover:text-[#fafafa]"}`}>테이블</button>
          </div>
          <Link href="/contents/new" className="px-4 py-2 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold no-underline hover:bg-[#e0e0e0]">+ 새 콘텐츠</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="검색..." className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] w-60" />
        <div className="flex rounded-lg border border-[#333] overflow-hidden">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 text-xs border-none cursor-pointer transition-colors ${category === c ? "bg-[#FF6B35] text-white" : "bg-[#0a0a0a] text-[#888] hover:text-[#fafafa]"}`}>
              {c === "all" ? "전체" : c}
            </button>
          ))}
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none">
          <option value="all">상태: 전체</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Card View */}
      {viewMode === "card" && (
        <div className="flex flex-col gap-2">
          {contents.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-xl hover:border-[#444] transition-colors">
              <Link href={`/contents/${c.id}`} className="flex-1 no-underline min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] text-[#fafafa] font-medium">{c.title}</span>
                </div>
                <div className="text-xs text-[#666] mt-1">
                  {c.category && <span>{c.category}</span>}
                  {c.subcategory && <span> · {c.subcategory}</span>}
                  <span> · {new Date(c.created_at).toLocaleDateString("ko-KR")}</span>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <select value={c.status} onClick={(e) => e.stopPropagation()} onChange={(e) => updateStatus(c.id, e.target.value)} className={`text-xs font-medium px-2 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] outline-none cursor-pointer ${STATUS_COLORS[c.status] || "text-[#888]"}`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {c.slug && <a href={`/guides/${c.slug}?preview=brxce-preview-2026`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="px-2.5 py-1 rounded-lg border border-[#333] text-xs text-[#888] no-underline hover:text-[#fafafa] hover:border-[#555] transition-colors">👁️</a>}
              </div>
            </div>
          ))}
          {contents.length === 0 && <p className="text-[#666] text-sm">콘텐츠가 없습니다.</p>}
        </div>
      )}

      {/* Table View with DnD */}
      {viewMode === "table" && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {(category === "all" ? Object.entries(grouped) : [[category, contents]]).map(([cat, items]) => {
              const subs = subGrouped(items as Content[]);
              const hasSubs = Object.keys(subs).length > 1 || !subs["미분류"];

              return (
                <div key={cat as string}>
                  {category === "all" && (
                    <h2 className="text-sm font-semibold text-[#FF6B35] mb-3 flex items-center gap-2">
                      {cat as string}
                      <span className="text-[10px] text-[#555] font-normal">{(items as Content[]).length}개</span>
                    </h2>
                  )}
                  {hasSubs ? (
                    <div className="space-y-4">
                      {Object.entries(subs).map(([sub, subItems]) => (
                        <SubcategoryGroup
                          key={sub}
                          sub={sub}
                          items={subItems}
                          editingId={editingId}
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          setEditingId={setEditingId}
                          saveTitle={saveTitle}
                          updateStatus={updateStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <SortableContext items={(items as Content[]).map(c => c.id)} strategy={verticalListSortingStrategy}>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[#333] text-[#666] text-xs text-left">
                            <th className="py-1 px-1 w-6"></th>
                            <th className="py-1 px-2 w-8">#</th>
                            <th className="py-1 px-3">제목</th>
                            <th className="py-1 px-3 w-24">상태</th>
                            <th className="py-1 px-3 w-24">날짜</th>
                            <th className="py-1 px-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(items as Content[]).map((c, i) => (
                            <SortableRow key={c.id} content={c} index={i} editingId={editingId} editTitle={editTitle} setEditTitle={setEditTitle} setEditingId={setEditingId} saveTitle={saveTitle} updateStatus={updateStatus} />
                          ))}
                        </tbody>
                      </table>
                    </SortableContext>
                  )}
                </div>
              );
            })}
            {contents.length === 0 && <p className="text-[#666] text-sm">콘텐츠가 없습니다.</p>}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeItem && (
              <div className="bg-[#1a1a1a] border border-[#FF6B35] rounded-lg px-4 py-2 shadow-lg shadow-[#FF6B35]/10">
                <span className="text-sm text-[#fafafa]">{activeItem.title}</span>
                {activeItem.subcategory && <span className="text-[9px] text-[#666] ml-2">{activeItem.subcategory}</span>}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
