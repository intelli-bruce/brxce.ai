-- Funnel Slots - 퍼널 대시보드용 슬롯 테이블
-- 2026-03-05

create table if not exists funnel_slots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  funnel_stage text not null check (funnel_stage in ('tofu', 'capture', 'mofu', 'bofu')),
  channel text,
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  phase int,
  status text default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  linked_campaign_id uuid references campaigns(id) on delete set null,
  linked_content_id uuid references contents(id) on delete set null,
  brxce_task_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists funnel_slots_stage on funnel_slots (funnel_stage);
create index if not exists funnel_slots_status on funnel_slots (status);

alter table funnel_slots enable row level security;
do $$ begin
  create policy "Admin full access funnel_slots" on funnel_slots for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

create trigger funnel_slots_updated_at before update on funnel_slots
  for each row execute function update_updated_at();
