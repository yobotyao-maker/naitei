import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const sessions = await stripe.checkout.sessions.list({
    limit: 20,
    expand: ['data.line_items'],
  })

  const orders = sessions.data
    .filter(s => s.payment_status === 'paid')
    .map(s => ({
      id:        s.id,
      email:     s.customer_email,
      plan:      s.metadata?.plan ?? '-',
      amount:    s.amount_total ? s.amount_total / 100 : 0,
      currency:  s.currency?.toUpperCase() ?? 'JPY',
      createdAt: new Date(s.created * 1000).toISOString(),
      userId:    s.metadata?.user_id ?? null,
    }))

  return NextResponse.json({ orders })
}
