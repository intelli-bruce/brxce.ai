import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ─── Types ─── */
export type FunnelStage = "tofu" | "capture" | "mofu" | "bofu";
export type SlotStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type Priority = "critical" | "high" | "medium" | "low";

export interface FunnelSlot {
  type: "slot";
  id: string;
  title: string;
  description: string | null;
  funnel_stage: FunnelStage;
  channel: string | null;
  priority: Priority;
  phase: number | null;
  status: SlotStatus;
  linked_campaign_id: string | null;
  linked_content_id: string | null;
  brxce_task_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelCampaign {
  type: "campaign";
  id: string;
  title: string;
  funnel_stage: FunnelStage;
  status: string;
  created_at: string;
}

export interface FunnelContent {
  type: "content";
  id: string;
  title: string;
  funnel_stage: FunnelStage;
  status: string;
  category: string | null;
  created_at: string;
}

export type FunnelItem = FunnelSlot | FunnelCampaign | FunnelContent;

/* ─── Stage Config ─── */
export const FUNNEL_STAGES: Record<
  FunnelStage,
  { label: string; sublabel: string; icon: string; color: string; targetPct: number }
> = {
  tofu: { label: "TOFU", sublabel: "인지", icon: "👁️", color: "#ff6b35", targetPct: 60 },
  capture: { label: "캡처", sublabel: "리드", icon: "🎣", color: "#2563eb", targetPct: 0 },
  mofu: { label: "MOFU", sublabel: "신뢰", icon: "🤝", color: "#7c3aed", targetPct: 30 },
  bofu: { label: "BOFU", sublabel: "전환", icon: "🎯", color: "#059669", targetPct: 10 },
};

export const STAGE_ORDER: FunnelStage[] = ["tofu", "capture", "mofu", "bofu"];

/* ─── Stage Normalization ─── */
const FUNNEL_STAGE_MAP: Record<string, FunnelStage> = {
  awareness: "tofu",
  interest: "capture",
  trust: "mofu",
  conversion: "bofu",
  tofu: "tofu",
  capture: "capture",
  mofu: "mofu",
  bofu: "bofu",
};

export function normalizeFunnelStage(raw: string): FunnelStage {
  return FUNNEL_STAGE_MAP[raw] ?? "tofu";
}

/* ─── Status / Priority helpers ─── */
export const STATUS_CONFIG: Record<SlotStatus, { label: string; color: string; dot: string }> = {
  planned: { label: "계획", color: "#ef4444", dot: "bg-red-500" },
  in_progress: { label: "진행중", color: "#eab308", dot: "bg-yellow-500" },
  completed: { label: "완성", color: "#22c55e", dot: "bg-green-500" },
  cancelled: { label: "취소", color: "#6b7280", dot: "bg-gray-500" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "bg-red-500/20 text-red-400" },
  high: { label: "High", color: "#f97316", bg: "bg-orange-500/20 text-orange-400" },
  medium: { label: "Medium", color: "#eab308", bg: "bg-yellow-500/20 text-yellow-400" },
  low: { label: "Low", color: "#6b7280", bg: "bg-gray-500/20 text-gray-400" },
};

export const CHANNEL_LABELS: Record<string, string> = {
  brxce_guide: "가이드",
  newsletter: "뉴스레터",
  threads: "Threads",
  x: "X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  landing: "랜딩",
  manychat: "ManyChat",
  email_sequence: "이메일",
  lead_magnet: "리드마그넷",
  community: "커뮤니티",
};

/* ─── Data Fetching ─── */
export interface FunnelData {
  items: Record<FunnelStage, FunnelItem[]>;
  stats: {
    total: number;
    completed: number;
    byPhase: Record<number, { total: number; completed: number }>;
  };
}

export async function fetchFunnelData(): Promise<FunnelData> {
  const sb = createSupabaseBrowser();

  const [slotsRes, campaignsRes, contentsRes] = await Promise.all([
    sb.from("funnel_slots").select("*").order("phase", { ascending: true }).order("priority", { ascending: true }),
    sb.from("campaigns").select("id, title, funnel_stage, status, created_at"),
    sb.from("contents").select("id, title, funnel_stage, status, category, created_at"),
  ]);

  const items: Record<FunnelStage, FunnelItem[]> = {
    tofu: [],
    capture: [],
    mofu: [],
    bofu: [],
  };

  // Slots
  const slots = (slotsRes.data ?? []) as FunnelSlot[];
  let total = 0;
  let completed = 0;
  const byPhase: Record<number, { total: number; completed: number }> = {};

  for (const s of slots) {
    const stage = normalizeFunnelStage(s.funnel_stage);
    items[stage].push({ ...s, type: "slot", funnel_stage: stage });
    total++;
    if (s.status === "completed") completed++;
    if (s.phase) {
      if (!byPhase[s.phase]) byPhase[s.phase] = { total: 0, completed: 0 };
      byPhase[s.phase].total++;
      if (s.status === "completed") byPhase[s.phase].completed++;
    }
  }

  // Campaigns (only add if not already linked via a slot)
  const linkedCampaignIds = new Set(slots.filter((s) => s.linked_campaign_id).map((s) => s.linked_campaign_id));
  for (const c of campaignsRes.data ?? []) {
    if (linkedCampaignIds.has(c.id)) continue;
    const stage = normalizeFunnelStage(c.funnel_stage ?? "tofu");
    items[stage].push({ type: "campaign", id: c.id, title: c.title, funnel_stage: stage, status: c.status, created_at: c.created_at });
  }

  // Contents (only add if not already linked via a slot)
  const linkedContentIds = new Set(slots.filter((s) => s.linked_content_id).map((s) => s.linked_content_id));
  for (const c of contentsRes.data ?? []) {
    if (linkedContentIds.has(c.id)) continue;
    const stage = normalizeFunnelStage(c.funnel_stage ?? "awareness");
    items[stage].push({ type: "content", id: c.id, title: c.title, funnel_stage: stage, status: c.status, category: c.category, created_at: c.created_at });
  }

  return { items, stats: { total, completed, byPhase } };
}
