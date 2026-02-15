-- Campaign System - Phase A Migration
-- 2026-02-16

-- ============================================================
-- 1. campaign_series
-- ============================================================
create table campaign_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  funnel_flow jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- 2. campaigns
-- ============================================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  brief text,
  seo_keywords text[],
  seo_data jsonb,
  funnel_stage text check (funnel_stage in ('tofu', 'mofu', 'bofu')),
  cta_type text check (cta_type in ('guide_read', 'newsletter_sub', 'consult', 'free_trial')),
  cta_target text,
  status text not null default 'ideation' check (status in ('ideation', 'seo_research', 'producing', 'fact_check', 'approval', 'ready', 'scheduled', 'published', 'analyzing')),
  origin_direction text default 'top_down' check (origin_direction in ('top_down', 'bottom_up')),
  series_id uuid references campaign_series(id) on delete set null,
  series_order int,
  source_content_id uuid references contents(id) on delete set null,
  source_idea_id uuid references ideas(id) on delete set null,
  style_notes text,
  total_cost_tokens int default 0,
  total_cost_usd float default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. campaign_atoms
-- ============================================================
create table campaign_atoms (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  format text not null check (format in ('long_text', 'medium_text', 'short_text', 'carousel', 'image', 'video')),
  channel text not null check (channel in ('brxce_guide', 'newsletter', 'threads', 'x', 'linkedin', 'instagram', 'youtube')),
  status text not null default 'pending' check (status in ('pending', 'generating', 'comparing', 'selected', 'fact_check', 'approved', 'scheduled', 'published', 'failed')),
  publish_method text default 'manual_copy' check (publish_method in ('auto', 'manual_copy')),
  selected_variant_id uuid,  -- FK added after campaign_variants
  content_id uuid references contents(id) on delete set null,
  studio_project_id uuid,    -- no FK: studio_projects table doesn't exist yet
  publication_id uuid references publications(id) on delete set null,
  generation_config jsonb,
  publish_config jsonb,
  optimal_publish_time timestamptz,
  scheduled_at timestamptz,
  ab_test boolean default false,
  ab_variant_ids uuid[],
  fact_check_notes text,
  fact_check_flags jsonb,
  published_at timestamptz,
  error_log text,
  retry_count int default 0,
  created_at timestamptz default now()
);

comment on column campaign_atoms.studio_project_id is 'FK to studio_projects deferred — table does not exist yet';

-- ============================================================
-- 4. campaign_variants
-- ============================================================
create table campaign_variants (
  id uuid primary key default gen_random_uuid(),
  atom_id uuid not null references campaign_atoms(id) on delete cascade,
  parent_id uuid references campaign_variants(id) on delete set null,
  generation int not null default 1,
  params jsonb,
  output jsonb,
  feedback text,
  is_selected boolean default false,
  score int check (score between 1 and 5),
  cost_tokens int default 0,
  cost_usd float default 0,
  prompt_version text,
  model text,
  created_at timestamptz default now()
);

-- Now add deferred FK for selected_variant_id
alter table campaign_atoms
  add constraint campaign_atoms_selected_variant_fk
  foreign key (selected_variant_id) references campaign_variants(id) on delete set null;

-- ============================================================
-- 5. style_profiles
-- ============================================================
create table style_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  scope text not null default 'global' check (scope in ('global', 'channel', 'format')),
  examples jsonb default '[]',
  examples_summary text,
  patterns text,
  anti_patterns text,
  top_performers uuid[],
  config jsonb,
  max_examples int default 5,
  updated_at timestamptz default now()
);

-- ============================================================
-- 6. media_assets
-- ============================================================
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  source_variant_id uuid references campaign_variants(id) on delete set null,
  source_atom_id uuid references campaign_atoms(id) on delete set null,
  asset_type text not null check (asset_type in ('image', 'video', 'carousel_slide', 'og', 'thumbnail')),
  storage_url text not null,
  tags text[],
  reuse_count int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 7. channel_schedule_rules
-- ============================================================
create table channel_schedule_rules (
  id uuid primary key default gen_random_uuid(),
  channel text not null unique,
  best_days int[],
  best_hours int[],
  timezone text default 'Asia/Seoul',
  publish_method text default 'manual_copy' check (publish_method in ('auto', 'manual_copy')),
  api_status text default 'unavailable' check (api_status in ('available', 'limited', 'unavailable')),
  api_notes text,
  notes text,
  updated_at timestamptz default now()
);

-- ============================================================
-- 8. campaign_metrics
-- ============================================================
create table campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  atom_id uuid references campaign_atoms(id) on delete cascade,
  variant_id uuid references campaign_variants(id) on delete set null,
  channel text,
  impressions int default 0,
  likes int default 0,
  comments int default 0,
  shares int default 0,
  clicks int default 0,
  conversions int default 0,
  engagement_rate float,
  source text default 'manual',
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- 9. prompt_versions
-- ============================================================
create table prompt_versions (
  id uuid primary key default gen_random_uuid(),
  version_hash text not null unique,
  system_prompt text not null,
  channel_guidelines jsonb,
  model text,
  notes text,
  performance_score float,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index campaigns_status on campaigns (status);
create index campaigns_series_id on campaigns (series_id);
create index campaigns_funnel_stage on campaigns (funnel_stage);

create index campaign_atoms_campaign_id on campaign_atoms (campaign_id);
create index campaign_atoms_channel on campaign_atoms (channel);
create index campaign_atoms_status on campaign_atoms (status);

create index campaign_variants_atom_id on campaign_variants (atom_id);
create index campaign_variants_is_selected on campaign_variants (is_selected) where is_selected = true;

create index media_assets_source_atom_id on media_assets (source_atom_id);
create index media_assets_asset_type on media_assets (asset_type);

create index campaign_metrics_atom_id on campaign_metrics (atom_id);
create index campaign_metrics_channel on campaign_metrics (channel);

create index style_profiles_scope on style_profiles (scope);

-- ============================================================
-- UPDATED_AT TRIGGERS (reuse existing function from init migration)
-- ============================================================
create trigger campaigns_updated_at before update on campaigns for each row execute function update_updated_at();
create trigger style_profiles_updated_at before update on style_profiles for each row execute function update_updated_at();
create trigger channel_schedule_rules_updated_at before update on channel_schedule_rules for each row execute function update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table campaign_series enable row level security;
alter table campaigns enable row level security;
alter table campaign_atoms enable row level security;
alter table campaign_variants enable row level security;
alter table style_profiles enable row level security;
alter table media_assets enable row level security;
alter table channel_schedule_rules enable row level security;
alter table campaign_metrics enable row level security;
alter table prompt_versions enable row level security;

-- Admin full access policies
create policy "Admin full access campaign_series" on campaign_series for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access campaigns" on campaigns for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access campaign_atoms" on campaign_atoms for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access campaign_variants" on campaign_variants for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access style_profiles" on style_profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access media_assets" on media_assets for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access channel_schedule_rules" on channel_schedule_rules for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access campaign_metrics" on campaign_metrics for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access prompt_versions" on prompt_versions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- SEED DATA: channel_schedule_rules
-- ============================================================
insert into channel_schedule_rules (channel, best_days, best_hours, publish_method, api_status) values
  ('threads',     '{2,3,4}',         '{8,9}',          'auto',        'available'),
  ('x',           '{1,2,3,4,5}',     '{13,14,15}',     'auto',        'available'),
  ('linkedin',    '{2,3,4}',         '{9,10}',         'manual_copy', 'limited'),
  ('instagram',   '{3,4,5}',         '{12,13,19,20}',  'auto',        'available'),
  ('youtube',     '{4,5,6}',         '{17,18,19}',     'manual_copy', 'available'),
  ('newsletter',  '{2,4}',           '{8,9}',          'auto',        'available'),
  ('brxce_guide', '{1,2,3,4,5,6,7}', '{}',             'auto',        'available');
