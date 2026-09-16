import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  if (request.headers.get('content-type') !== 'application/json') return NextResponse.json({ error: 'Unsupported media type' }, { status: 415 })
  const body = await request.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

  const cookieStore = await cookies()
  const key = `viewed_${slug}`
  if (cookieStore.get(key)) return NextResponse.json({ ok: true, counted: false })
  const supabase = await createClient()
  const { error } = await supabase.rpc('increment_post_views', { p_slug: slug })
  if (error) return NextResponse.json({ error: 'Could not record view' }, { status: 500 })
  const response = NextResponse.json({ ok: true, counted: true })
  response.cookies.set(key, '1', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 })
  return response
}
