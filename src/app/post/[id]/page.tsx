import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/db'
import { auth } from '@/lib/auth'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const supabase = getSupabase()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  const { count: likes_count } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)
    .eq('type', 'like')

  const { count: comments_count } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)
    .eq('type', 'comment')

  let user_has_liked = false
  if (session?.user?.id) {
    const { data: like } = await supabase
      .from('interactions')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', session.user.id)
      .eq('type', 'like')
      .single()
    user_has_liked = !!like
  }

  const enriched: Post = {
    ...post,
    likes_count: likes_count ?? 0,
    comments_count: comments_count ?? 0,
    user_has_liked,
  }

  return (
    <div>
      <PostCard post={enriched} userId={session?.user?.id} />
    </div>
  )
}
