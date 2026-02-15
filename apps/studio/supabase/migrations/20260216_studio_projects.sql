-- studio_projects: 미디어 제작 프로젝트
create table studio_projects (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references contents(id) on delete set null,

  title text not null,
  type text not null check (type in ('video', 'carousel', 'image')),
  status text not null default 'draft'
    check (status in ('draft', 'editing', 'ready', 'rendering', 'rendered', 'failed')),

  template text not null,             -- 'VSReel', 'CardNews', 'OgImage' 등
  width int not null default 1080,
  height int not null default 1920,
  fps int default 60,                 -- 영상 전용

  scenes jsonb default '[]',          -- Video: Scene[], Carousel: Slide[], Image: Layer[]
  media_mappings jsonb default '{}',
  style_config jsonb default '{}',

  output_urls jsonb default '[]',     -- 렌더 결과 URL 배열
  render_log text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index studio_projects_content_id on studio_projects(content_id);
create index studio_projects_type on studio_projects(type);
alter table studio_projects enable row level security;
create policy "Admin full access" on studio_projects for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create trigger studio_projects_updated_at
  before update on studio_projects
  for each row execute function update_updated_at();
