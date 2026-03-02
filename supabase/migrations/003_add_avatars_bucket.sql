-- Storage Bucket for Avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Avatar Access" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Avatar Upload" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.uid() = owner );
create policy "Avatar Update" on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );
create policy "Avatar Delete" on storage.objects for delete using ( bucket_id = 'avatars' and auth.uid() = owner );
