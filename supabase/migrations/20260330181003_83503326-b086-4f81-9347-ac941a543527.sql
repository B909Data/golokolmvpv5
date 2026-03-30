create policy "allow public uploads to partner_flyers"
on storage.objects
for insert
to public
with check (bucket_id = 'partner_flyers');