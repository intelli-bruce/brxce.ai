"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface CostRow {
  id: string;
  title: string;
  total_cost_tokens: number;
  total_cost_usd: number;
  status: string;
  atom_count: number;
  created_at: string;
}

export default function CostDashboard() {
  const [campaigns, setCampaigns] = useState<CostRow[]>([]);
  const sb = createSupabaseBrowser();

  useEffect(() => {
    async function load() {
      const { data: camps } = await sb.from("campaigns")
        .select("id, title, total_cost_tokens, total_cost_usd, status, created_at")
        .order("created_at", { ascending: false });

      const { data: atoms } = await sb.from("campaign_atoms").select("campaign_id");
      const countMap: Record<string, number> = {};
      (atoms || []).forEach(a => { countMap[a.campaign_id] = (countMap[a.campaign_id] || 0) + 1; });

      setCampaigns((camps || []).map(c => ({ ...c, atom_count: countMap[c.id] || 0 })));
    }
    load();
  }, []);

  const totalTokens = campaigns.reduce((sum, c) => sum + c.total_cost_tokens, 0);
  const totalUSD = campaigns.reduce((sum, c) => sum + c.total_cost_usd, 0);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">💰 비용 추적</h2>

      {/* Total */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-4 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">총 토큰</div>
          <div className="text-lg font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">총 비용</div>
          <div className="text-lg font-bold text-[#FF6B35]">${totalUSD.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-[#141414] border border-[#222] rounded-xl text-center">
          <div className="text-xs text-[#888] mb-1">캠페인당 평균</div>
          <div className="text-lg font-bold">${campaigns.length ? (totalUSD / campaigns.length).toFixed(2) : "0.00"}</div>
        </div>
      </div>

      {/* Per-campaign table */}
      {campaigns.some(c => c.total_cost_usd > 0) && (
        <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#222] text-[#888]">
                <th className="px-4 py-2 text-left">캠페인</th>
                <th className="px-4 py-2 text-right">Atoms</th>
                <th className="px-4 py-2 text-right">토큰</th>
                <th className="px-4 py-2 text-right">비용</th>
                <th className="px-4 py-2 text-right">상태</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.filter(c => c.total_cost_usd > 0).map(c => (
                <tr key={c.id} className="border-b border-[#1a1a1a]">
                  <td className="px-4 py-2 text-[#fafafa]">{c.title}</td>
                  <td className="px-4 py-2 text-right">{c.atom_count}</td>
                  <td className="px-4 py-2 text-right">{c.total_cost_tokens.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-[#FF6B35]">${c.total_cost_usd.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-[#888]">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
