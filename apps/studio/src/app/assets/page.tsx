"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Asset {
  id: string;
  asset_type: string;
  storage_url: string;
  tags: string[] | null;
  reuse_count: number;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  image: "🖼️", video: "🎬", carousel_slide: "📱", og: "🔗", thumbnail: "📸",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState("all");
  const sb = createSupabaseBrowser();

  useEffect(() => {
    let q = sb.from("media_assets").select("*").order("created_at", { ascending: false }).limit(100);
    if (filter !== "all") q = q.eq("asset_type", filter);
    q.then(({ data }) => { if (data) setAssets(data as Asset[]); });
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">에셋 라이브러리</h1>
        <div className="flex gap-2">
          {["all", "image", "video", "carousel_slide", "og", "thumbnail"].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer transition-colors ${
                filter === t
                  ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "border-[#333] bg-[#0a0a0a] text-[#888]"
              }`}
            >
              {t === "all" ? "전체" : `${TYPE_ICONS[t] || ""} ${t}`}
            </button>
          ))}
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {assets.map(a => (
            <div key={a.id} className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden group">
              {/* Preview */}
              <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center relative">
                {a.asset_type === "image" || a.asset_type === "og" || a.asset_type === "thumbnail" ? (
                  <img src={a.storage_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-20">{TYPE_ICONS[a.asset_type] || "📄"}</span>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={a.storage_url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-black/80 text-white text-[10px] no-underline">열기</a>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{TYPE_ICONS[a.asset_type]}</span>
                  <span className="text-xs text-[#888]">{a.asset_type}</span>
                  {a.reuse_count > 0 && <span className="text-[10px] text-[#4ECDC4] ml-auto">♻️ {a.reuse_count}</span>}
                </div>
                {a.tags && a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[#555]">
          <span className="text-4xl mb-4 block">🗄️</span>
          <p className="text-lg">에셋이 없습니다</p>
          <p className="text-sm mt-2">캠페인에서 생성된 미디어 에셋이 여기에 표시됩니다</p>
        </div>
      )}
    </div>
  );
}
