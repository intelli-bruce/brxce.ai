-- Diagrams table for persistent diagram management
create table if not exists public.diagrams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  template text not null default 'comparison',
  ratio text not null default 'guide-3:2',
  data jsonb not null default '{}',
  sketch boolean not null default false,
  content_id uuid references public.contents(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.diagrams enable row level security;
create policy "admin_all" on public.diagrams for all using (auth.uid() is not null);

-- Index
create index diagrams_created_at_idx on public.diagrams(created_at desc);
