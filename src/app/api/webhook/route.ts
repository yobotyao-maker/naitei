import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabase } from '@supabase/supabase-js'

function getAdmin() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const db = getAdmin()

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ━━━ 付款成功 ━━━
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.user_id
    const plan    = session.metadata?.plan

    if (!userId || !plan) return NextResponse.json({ received: true })

    if (plan === 'pack') {
      await db.rpc('add_pack_quota', { p_user_id: userId })
    } else if (plan === 'pro') {
      await db.from('subscriptions').upsert({
        user_id:                userId,
        plan:                   'pro',
        interviews_limit:       9999,
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: (session.subscription as string) ?? null,
        updated_at:             new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
  }

  // ━━━ Pack 退款 ━━━
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge

    if (!charge.refunded && charge.amount_refunded === 0) {
      return NextResponse.json({ received: true })
    }

    try {
      const paymentIntentId = charge.payment_intent as string
      if (!paymentIntentId) return NextResponse.json({ received: true })

      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      const session = sessions.data[0]
      if (!session) return NextResponse.json({ received: true })

      const userId = session.metadata?.user_id
      const plan   = session.metadata?.plan

      if (!userId || plan !== 'pack') return NextResponse.json({ received: true })

      await db.rpc('refund_pack_quota', { p_user_id: userId })
    } catch (e) {
      console.error('refund handling error:', e)
    }
  }

  // ━━━ 订阅续费 ━━━
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
    const subId   = invoice.subscription
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId) as any
      await db.from('subscriptions')
        .update({
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at:         new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subId)
    }
  }

  // ━━━ 订阅取消（Pro 退款触发）━━━
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await db.from('subscriptions')
      .update({
        plan:             'free',
        interviews_limit: 1,
        updated_at:       new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
