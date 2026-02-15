// Campaign System 타입 정의

export interface Campaign {
  id: string;
  title: string;
  topic: string;
  brief: string | null;
  seo_keywords: string[] | null;
  seo_data: any;
  funnel_stage: 'tofu' | 'mofu' | 'bofu';
  cta_type: string;
  cta_target: string | null;
  status: CampaignStatus;
  origin_direction: 'top_down' | 'bottom_up';
  series_id: string | null;
  series_order: number | null;
  source_content_id: string | null;
  source_idea_id: string | null;
  style_notes: string | null;
  total_cost_tokens: number;
  total_cost_usd: number;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus =
  | 'ideation' | 'seo_research' | 'producing' | 'fact_check'
  | 'approval' | 'ready' | 'scheduled' | 'published' | 'analyzing';

export interface CampaignAtom {
  id: string;
  campaign_id: string;
  format: AtomFormat;
  channel: AtomChannel;
  status: AtomStatus;
  publish_method: 'auto' | 'manual_copy';
  selected_variant_id: string | null;
  content_id: string | null;
  studio_project_id: string | null;
  publication_id: string | null;
  generation_config: GenerationConfig | null;
  publish_config: any;
  optimal_publish_time: string | null;
  scheduled_at: string | null;
  ab_test: boolean;
  ab_variant_ids: string[] | null;
  fact_check_notes: string | null;
  fact_check_flags: FactCheckFlag[] | null;
  published_at: string | null;
  error_log: string | null;
  retry_count: number;
  created_at: string;
}

export type AtomFormat = 'long_text' | 'medium_text' | 'short_text' | 'carousel' | 'image' | 'video';
export type AtomChannel = 'brxce_guide' | 'newsletter' | 'threads' | 'x' | 'linkedin' | 'instagram' | 'youtube';
export type AtomStatus =
  | 'pending' | 'generating' | 'comparing' | 'selected'
  | 'fact_check' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface GenerationConfig {
  variant_count: number;    // 2~8
  diversity: 'wide' | 'normal' | 'narrow';
  base_variant_id?: string; // 분기 시 부모
  feedback?: string;        // 자연어 피드백
}

export interface CampaignVariant {
  id: string;
  atom_id: string;
  parent_id: string | null;
  generation: number;
  params: VariantParams;
  output: VariantOutput;
  feedback: string | null;
  is_selected: boolean;
  score: number | null;    // 1~5
  cost_tokens: number;
  cost_usd: number;
  prompt_version: string | null;
  model: string | null;
  created_at: string;
}

export interface VariantParams {
  tone?: string;
  hook_type?: string;
  structure?: string;
  length_target?: number;
  language?: string;
  seo_keywords?: string[];
  template?: string;
  slide_count?: number;
  color_scheme?: string;
  emphasis?: string;
  theme?: string;
  layout?: string;
  [key: string]: any;
}

export interface VariantOutput {
  body?: string;          // 텍스트 콘텐츠
  word_count?: number;
  title?: string;
  slides?: any[];         // 캐러셀
  layers?: any[];         // 이미지
  scenes?: any[];         // 영상
  style_config?: any;
  [key: string]: any;
}

export interface FactCheckFlag {
  text: string;
  reason: string;
  verified: boolean;
  verified_by?: string | null;  // 'bruce' | 'agent_web_search'
  verified_at?: string | null;
}

export interface StyleProfile {
  id: string;
  name: string;
  scope: 'global' | 'channel' | 'format';
  examples: any[];
  examples_summary: string | null;
  patterns: string | null;
  anti_patterns: string | null;
  top_performers: string[] | null;
  config: any;
  max_examples: number;
  updated_at: string;
}

export interface ChannelScheduleRule {
  id: string;
  channel: string;
  best_days: number[];
  best_hours: number[];
  timezone: string;
  publish_method: 'auto' | 'manual_copy';
  api_status: 'available' | 'limited' | 'unavailable';
  api_notes: string | null;
  notes: string | null;
  updated_at: string;
}

// 생성 task 빌더용
export interface GenerateTaskInput {
  campaign: Campaign;
  atom: CampaignAtom;
  config: GenerationConfig;
  styleProfile?: StyleProfile | null;
  channelGuideline?: string;
  baseVariant?: CampaignVariant | null;
}

// 채널 아이콘/라벨
export const CHANNEL_ICONS: Record<string, string> = {
  threads: '🧵', x: '𝕏', linkedin: '💼', instagram: '📸',
  youtube: '▶️', newsletter: '📧', brxce_guide: '🦞',
};

export const FORMAT_LABELS: Record<string, string> = {
  long_text: 'Long', medium_text: 'Med', short_text: 'Short',
  carousel: 'Carousel', image: 'Image', video: 'Video',
};

export const CHANNELS: AtomChannel[] = ['brxce_guide', 'newsletter', 'threads', 'x', 'linkedin', 'instagram', 'youtube'];
export const FORMATS: AtomFormat[] = ['long_text', 'medium_text', 'short_text', 'carousel', 'image', 'video'];
