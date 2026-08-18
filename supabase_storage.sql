-- Create the 'artworks' bucket for storing uploaded images
insert into storage.buckets (id, name, public) 
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

-- Allow public read access to the artworks bucket
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'artworks' );

-- Allow authenticated users to upload files to the artworks bucket
create policy "Authenticated users can upload artworks"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'artworks' );
