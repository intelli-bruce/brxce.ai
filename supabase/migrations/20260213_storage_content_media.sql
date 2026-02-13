-- Create content-media storage bucket
insert into storage.buckets (id, name, public) 
values ('content-media', 'content-media', true)
on conflict (id) do nothing;

-- Allow public read access
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'content-media');

-- Allow authenticated admins to upload
create policy "Admin upload" on storage.objects
  for insert with check (
    bucket_id = 'content-media'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow authenticated admins to update
create policy "Admin update" on storage.objects
  for update using (
    bucket_id = 'content-media'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow authenticated admins to delete
create policy "Admin delete" on storage.objects
  for delete using (
    bucket_id = 'content-media'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
