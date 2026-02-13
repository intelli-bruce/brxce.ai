"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Publication {
  id: string;
  channel: string;
  url: string | null;
  published_at: string | null;
  content_id: string;
  contents: { title: string } | null;
}

export default function PublicationsPage() {
  const [pubs, setPubs] = useState<Publication[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.from("publications")
      .select("id, channel, url, published_at, content_id, contents(title)")
      .order("published_at", { ascending: false })
      .then(({ data }) => setPubs((data as unknown as Publication[]) || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">발행 현황</h1>
      <div className="flex flex-col gap-2">
        {pubs.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-xl">
            <div>
              <div className="text-sm text-[#fafafa] font-medium">{p.contents?.title || p.content_id}</div>
              <div className="text-xs text-[#666] mt-1">
                {p.channel} · {p.published_at ? new Date(p.published_at).toLocaleString("ko-KR") : "미발행"}
              </div>
            </div>
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener" className="text-xs text-[#8ab4f8] no-underline hover:underline">
                링크
              </a>
            )}
          </div>
        ))}
        {pubs.length === 0 && <p className="text-sm text-[#666]">발행 기록이 없습니다.</p>}
      </div>
    </div>
  );
}
