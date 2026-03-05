"use client";

import { useState, useEffect } from "react";
import { type FunnelData, STAGE_ORDER, fetchFunnelData } from "@/lib/funnel";
import FunnelHeader from "./FunnelHeader";
import FunnelColumn from "./FunnelColumn";
import AddSlotModal from "./AddSlotModal";

export default function FunnelBoard() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchFunnelData();
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-[#666] text-sm">
        퍼널 데이터를 불러오는 중...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#fafafa]">퍼널 대시보드</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-sm font-medium transition-colors cursor-pointer border-none"
        >
          + 슬롯 추가
        </button>
      </div>

      {/* Stats header */}
      <FunnelHeader stats={data.stats} />

      {/* 4-column board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGE_ORDER.map((stage) => (
          <FunnelColumn key={stage} stage={stage} items={data.items[stage]} />
        ))}
      </div>

      {/* Add slot modal */}
      {showAddModal && (
        <AddSlotModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}
