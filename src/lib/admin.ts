import type { SupabaseClient } from '@supabase/supabase-js'

export async function isAdmin(supabase: SupabaseClient, userId: string | undefined): Promise<boolean> {
  if (!userId) return false
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
