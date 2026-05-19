import { auth } from '@/lib/auth'
import { getSupabase } from '@/lib/db'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id
  const supabase = getSupabase()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`*, author:users(id, username, avatar)`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)

  const postsWithDetails = await Promise.all(
    (posts || []).map(async (post) => {
      const [likesResult, commentsResult, userLikeResult] = await Promise.all([
        supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('post_id', post.id).eq('type', 'like'),
        supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('post_id', post.id).eq('type', 'comment'),
        userId ? supabase.from('interactions').select('id').eq('post_id', post.id).eq('user_id', userId).eq('type', 'like').maybeSingle() : Promise.resolve({ data: null }),
      ])
      return { ...post, likes_count: likesResult.count ?? 0, comments_count: commentsResult.count ?? 0, user_has_liked: !!userLikeResult.data }
    })
  )

  return (
    <div className="min-h-[calc(100vh-73px)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Your <span className="gradient-text">Feed</span></h1>
            <p className="mt-1 text-sm text-white/50">See what your cohort is sharing</p>
          </div>
          {session?.user && (
            <Link href="/create-post" className="btn-primary flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Post
            </Link>
          )}
        </div>

        {postsWithDetails.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/10">
              <svg className="h-12 w-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">No posts yet</h3>
            <p className="mt-2 text-sm text-white/50">Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {postsWithDetails.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}