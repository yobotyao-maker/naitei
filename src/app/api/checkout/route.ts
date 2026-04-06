import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'

const PRICE_IDS: Record<string, string> = {
  pack: process.env.STRIPE_PRICE_PACK ?? '',
  pro:  process.env.STRIPE_PRICE_PRO  ?? '',
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan = 'pack' } = await req.json().catch(() => ({}))
  const priceId = PRICE_IDS[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: plan === 'pro' ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    metadata: { user_id: user.id, plan },
    success_url: `${origin}/interview?upgraded=1`,
    cancel_url:  `${origin}/interview`,
  })

  return NextResponse.json({ url: session.url })
}
