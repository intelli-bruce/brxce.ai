"use client";

import { useState } from "react";
import type { FactCheckFlag } from "@/lib/campaign/types";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Props {
  atomId: string;
  flags: FactCheckFlag[];
  onUpdate: (flags: FactCheckFlag[]) => void;
}

export default function FactCheckPanel({ atomId, flags, onUpdate }: Props) {
  const [localFlags, setLocalFlags] = useState<FactCheckFlag[]>(flags);
  const sb = createSupabaseBrowser();

  async function toggleVerified(index: number) {
    const updated = [...localFlags];
    updated[index] = {
      ...updated[index],
      verified: !updated[index].verified,
      verified_by: !updated[index].verified ? 'bruce' : null,
      verified_at: !updated[index].verified ? new Date().toISOString() : null,
    };
    setLocalFlags(updated);
    await sb.from('campaign_atoms').update({ fact_check_flags: updated }).eq('id', atomId);
    onUpdate(updated);
  }

  const verified = localFlags.filter(f => f.verified).length;
  const total = localFlags.length;

  if (total === 0) {
    return (
      <div className="text-xs text-[#555] p-3 border border-dashed border-[#333] rounded-lg text-center">
        팩트체크 항목 없음
      </div>
    );
  }

  return (
    <div className="border border-[#333] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#141414] border-b border-[#222]">
        <span className="text-sm font-medium">📋 팩트체크</span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          verified === total
            ? 'bg-green-500/20 text-green-400'
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          {verified}/{total} 확인됨
        </span>
      </div>
      <div className="divide-y divide-[#222]">
        {localFlags.map((flag, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <button
              onClick={() => toggleVerified(i)}
              className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center cursor-pointer text-xs shrink-0 ${
                flag.verified
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-transparent border-[#444] text-transparent hover:border-orange-400'
              }`}
            >
              ✓
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm ${flag.verified ? 'text-[#888] line-through' : 'text-[#fafafa]'}`}>
                "{flag.text}"
              </div>
              <div className="text-xs text-[#666] mt-1">{flag.reason}</div>
              {flag.verified_by && (
                <div className="text-[10px] text-[#555] mt-1">
                  ✓ {flag.verified_by} · {flag.verified_at ? new Date(flag.verified_at).toLocaleString('ko-KR') : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
