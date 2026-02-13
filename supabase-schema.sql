-- brxce.ai Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
create extension if not exists vector;

-- 콘텐츠 원본
create table contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  status text not null default 'idea' check (status in ('idea','draft','fact-check','ready','published','archived')),
  category text,
  body_md text,
  hook text,
  core_message text,
  media_type text check (media_type in ('text','image','video','carousel')),
  media_urls jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  funnel_stage text check (funnel_stage in ('awareness','interest','trust','conversion')),
  cashflow_line text check (cashflow_line in ('consulting','course','service','community')),
  cta text,
  source_idea text,
  fact_checked boolean default false,
  fact_check_notes text,
  obsidian_path text,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 채널별 변환본
create table adaptations (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references contents(id) on delete cascade,
  channel text not null check (channel in ('threads','x','linkedin','instagram','youtube','brxce-guide','blog-naver','blog-medium','blog-brunch','newsletter')),
  format text check (format in ('short-text','mid-text','long-text','video-long','video-short','carousel')),
  body_adapted text,
  status text not null default 'draft' check (status in ('draft','ready','published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 발행 기록
create table publications (
  id uuid primary key default gen_random_uuid(),
  adaptation_id uuid references adaptations(id) on delete set null,
  content_id uuid references contents(id) on delete cascade,
  channel text not null,
  channel_post_id text,
  url text,
  published_at timestamptz,
  metrics jsonb default '{}'::jsonb
);

-- 아이디어 시드
create table ideas (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null,
  source text default 'manual',
  promoted_to uuid references contents(id) on delete set null,
  created_at timestamptz default now()
);

-- 유저 프로필
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text default 'user' check (role in ('admin','subscriber','user')),
  subscribed_at timestamptz,
  created_at timestamptz default now()
);

-- 콘텐츠 리뷰
create table content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references contents(id) on delete cascade,
  reviewer text default 'bruce',
  comment text not null,
  action text check (action in ('comment','approve','request-change','reject')),
  created_at timestamptz default now()
);

-- 폼 제출 (waitlist + inquiry)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  type text not null check (type in ('waitlist','inquiry')),
  product text,
  created_at timestamptz default now()
);

-- updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contents_updated_at before update on contents for each row execute function update_updated_at();
create trigger adaptations_updated_at before update on adaptations for each row execute function update_updated_at();

-- RLS
alter table contents enable row level security;
alter table adaptations enable row level security;
alter table publications enable row level security;
alter table ideas enable row level security;
alter table profiles enable row level security;
alter table content_reviews enable row level security;
alter table submissions enable row level security;

-- Public read (published only)
create policy "Public can read published contents" on contents for select using (status = 'published');
create policy "Public can read published adaptations" on adaptations for select using (status = 'published');
create policy "Public can read publications" on publications for select using (true);

-- Public can insert submissions (anon)
create policy "Anyone can submit" on submissions for insert with check (true);

-- Admin full access
create policy "Admin full access contents" on contents for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access adaptations" on adaptations for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access publications" on publications for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access ideas" on ideas for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access reviews" on content_reviews for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access submissions" on submissions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can read own profile" on profiles for select using (id = auth.uid());

-- Indexes
create index contents_fts on contents using gin (to_tsvector('korean', coalesce(title,'') || ' ' || coalesce(body_md,'') || ' ' || coalesce(hook,'')));
create index contents_status on contents (status);
create index adaptations_content_id on adaptations (content_id);
create index publications_content_id on publications (content_id);
