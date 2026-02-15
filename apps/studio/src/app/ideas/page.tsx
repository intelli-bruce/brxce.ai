"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface Idea {
  id: string;
  raw_text: string;
  source: string;
  promoted_to: string | null;
  created_at: string;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const router = useRouter();
  const sb = createSupabaseBrowser();

  async function load() {
    const { data } = await sb.from("ideas").select("*").order("created_at", { ascending: false });
    setIdeas(data || []);
  }

  useEffect(() => { load(); }, []);

  async function addIdea() {
    if (!newIdea.trim()) return;
    await sb.from("ideas").insert({ raw_text: newIdea });
    setNewIdea("");
    load();
  }

  async function promote(idea: Idea) {
    const { data } = await sb.from("contents").insert({ title: idea.raw_text, status: "idea", source_idea: idea.raw_text }).select("id").single();
    if (data) {
      await sb.from("ideas").update({ promoted_to: data.id }).eq("id", idea.id);
      router.push(`/contents/${data.id}`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">아이디어</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addIdea()}
          placeholder="새 아이디어..."
          className="flex-1 p-2.5 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555]"
        />
        <button onClick={addIdea} className="px-4 py-2 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e0e0e0]">
          추가
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {ideas.map((idea) => (
          <div key={idea.id} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-xl">
            <div>
              <p className="text-sm text-[#fafafa]">{idea.raw_text}</p>
              <span className="text-xs text-[#666]">{idea.source} · {new Date(idea.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            {idea.promoted_to ? (
              <span className="text-xs text-green-400">승격됨</span>
            ) : (
              <button onClick={() => promote(idea)} className="text-xs px-3 py-1 rounded-lg border border-[#333] text-[#888] hover:text-[#fafafa] hover:border-[#555]">
                콘텐츠로 승격
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
