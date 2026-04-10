import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, eid, message } = body

    if (!email || !message) {
      return Response.json(
        { error: 'Email and message are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        email: email.trim(),
        name: name?.trim() || null,
        eid: eid?.trim() || null,
        message: message.trim()
      })

    if (error) {
      console.error('Supabase error:', error)
      return Response.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
