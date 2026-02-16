-- Extend media_assets with campaign/content/channel grouping
alter table media_assets
  add column if not exists campaign_id uuid references campaigns(id) on delete set null,
  add column if not exists content_id uuid references contents(id) on delete set null,
  add column if not exists channel text,
  add column if not exists group_key text,
  add column if not exists position int default 0,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint;

create index if not exists media_assets_campaign_id on media_assets (campaign_id);
create index if not exists media_assets_content_id on media_assets (content_id);
create index if not exists media_assets_channel on media_assets (channel);
create index if not exists media_assets_group_key on media_assets (group_key);

-- RLS policy for admin access (service role bypasses, anon blocked)
drop policy if exists "admin_media_assets" on media_assets;
create policy "admin_media_assets" on media_assets
  for all using (auth.uid() is not null);
