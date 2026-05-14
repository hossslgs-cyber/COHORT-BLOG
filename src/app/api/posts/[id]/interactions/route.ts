import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { auth } from '@/lib/auth'

  export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'like'
  const postId = request.url.split('/posts/')[1]?.split('/')[0]

  if (!postId) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('interactions')
    .select('*, user:users(*)')
    .eq('post_id', postId)
    .eq('type', type)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const postId = request.url.split('/posts/')[1]?.split('/')[0]
  if (!postId) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 })
  }

  const { type, content } = await request.json()
  const supabase = getSupabase()

  if (type === 'like') {
    const { data: existing } = await supabase
      .from('interactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .eq('type', 'like')
      .maybe_single()

    if (existing) {
      return NextResponse.json({ message: 'Already liked' })
    }
  }

  const { data, error } = await supabase
    .from('interactions')
    .insert({
      user_id: session.user.id,
      post_id: postId,
      type,
      content: type === 'comment' ? content : null,
    })
    .select('*, user:users(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const postId = request.url.split('/posts/')[1]?.split('/')[0]
  if (!postId) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 })
  }

  const { type } = await request.json()
  const supabase = getSupabase()
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .eq('type', type || 'like')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deleted' })
}
