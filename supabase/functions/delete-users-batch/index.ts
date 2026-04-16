import { createClient } from 'npm:@supabase/supabase-js@2'

const USER_IDS = [
  '93f9fe33-5c03-4ba3-986a-3e0acc92f20c',
  '265fd733-973c-4a5d-8372-81beaee7d7d5',
  'ab3c4645-b22e-44dd-b657-53eef06f6ab2',
  '5af2a67d-24b3-455d-9d26-0a71c906f15f',
  '4c8fefdc-753a-485e-9c15-a214efef2f66',
  'edf6042f-f503-4cfa-b8c6-9dcd07dc1bbb',
  'ace529b7-c959-408a-940f-831d647654f7',
  '750c4284-6aa0-4847-8386-1e519f6371d0',
]

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const results: Record<string, unknown>[] = []

  // Clear artist_profiles FK references first
  const { error: profileErr, count: profileCount } = await supabase
    .from('artist_profiles')
    .delete({ count: 'exact' })
    .in('artist_user_id', USER_IDS)

  // Null out artist_user_id refs in submissions/lls_artist_submissions/show_listings
  await supabase.from('lls_artist_submissions').update({ artist_user_id: null }).in('artist_user_id', USER_IDS)
  await supabase.from('submissions').update({ artist_user_id: null }).in('artist_user_id', USER_IDS)
  await supabase.from('show_listings').delete().in('artist_user_id', USER_IDS)

  for (const id of USER_IDS) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    results.push({ id, ok: !error, error: error?.message ?? null })
  }

  return new Response(
    JSON.stringify({
      profile_cleanup: { count: profileCount, error: profileErr?.message ?? null },
      results,
    }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
