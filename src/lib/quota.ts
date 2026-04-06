import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 在 session 开始时调用（第一题生成前）。
 * 检查额度 → 若允许则原子扣减一回，返回结果。
 * 未登录用户直接放行（不追踪）。
 */
export async function checkAndConsumeSession(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<{ allowed: boolean; used: number; limit: number; plan: string }> {
  if (!userId) return { allowed: true, used: 0, limit: 1, plan: 'free' }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, interviews_used, interviews_limit, status')
    .eq('user_id', userId)
    .maybeSingle()

  // Pro 无限
  if (sub?.plan === 'pro' && sub.status === 'active') {
    return { allowed: true, used: sub.interviews_used, limit: 9999, plan: 'pro' }
  }

  const used  = sub?.interviews_used  ?? 0
  const limit = sub?.interviews_limit ?? 1
  const plan  = sub?.plan             ?? 'free'

  if (used >= limit) {
    return { allowed: false, used, limit, plan }
  }

  // 扣减一回
  if (sub) {
    await supabase
      .from('subscriptions')
      .update({ interviews_used: used + 1, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  } else {
    // 首次使用的 free 用户，建立记录
    await supabase.from('subscriptions').insert({
      user_id:          userId,
      plan:             'free',
      interviews_used:  1,
      interviews_limit: 1,
    })
  }

  return { allowed: true, used: used + 1, limit, plan }
}
