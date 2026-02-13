-- subscribers
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed','bounced')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- email_logs
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null,
  sent_to_count int not null default 0,
  sent_at timestamptz,
  resend_batch_id text,
  status text not null default 'draft' check (status in ('draft','sent','failed')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.subscribers enable row level security;
alter table public.email_logs enable row level security;

-- subscribers: anon can insert (subscribe form)
create policy "anon_insert_subscribers" on public.subscribers
  for insert to anon with check (true);

-- subscribers: admin full access
create policy "admin_all_subscribers" on public.subscribers
  for all to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- email_logs: admin only
create policy "admin_all_email_logs" on public.email_logs
  for all to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- service_role bypass (for API routes)
create policy "service_all_subscribers" on public.subscribers
  for all to service_role using (true) with check (true);
create policy "service_all_email_logs" on public.email_logs
  for all to service_role using (true) with check (true);
