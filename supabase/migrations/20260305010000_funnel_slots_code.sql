-- Add code column for quick agent reference (T1, C1, M1, B1 etc.)
alter table funnel_slots add column if not exists code text;
create unique index if not exists funnel_slots_code on funnel_slots (code) where code is not null;
