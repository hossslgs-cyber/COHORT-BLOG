import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id
  const supabase = getSupabase()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const postsWithDetails = await Promise.all(
    (posts || []).map(async (post) => {
      const { count: likes_count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
        .eq('type', 'like')

      const { count: comments_count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
        .eq('type', 'comment')

      let user_has_liked = false
      if (userId) {
        const { data: like } = await supabase
          .from('interactions')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .eq('type', 'like')
          .single()
        user_has_liked = !!like
      }

      return {
        ...post,
        likes_count: likes_count ?? 0,
        comments_count: comments_count ?? 0,
        user_has_liked,
      }
    })
  )

  return NextResponse.json(postsWithDetails)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { media_url, type, caption } = await request.json()

  if (!media_url || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: session.user.id,
      media_url,
      type,
      caption: caption || '',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
