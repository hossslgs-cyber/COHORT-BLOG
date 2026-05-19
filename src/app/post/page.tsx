import { auth } from '@/lib/auth'
import { getSupabase } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id
  const supabase = getSupabase()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`*, author:users(id, username, avatar)`)
    .eq('id', id)
    .single()

  if (error || !post) notFound()

  const [likesResult, commentsResult, userLikeResult] = await Promise.all([
    supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('post_id', id).eq('type', 'like'),
    supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('post_id', id).eq('type', 'comment'),
    userId ? supabase.from('interactions').select('id').eq('post_id', id).eq('user_id', userId).eq('type', 'like').maybeSingle() : Promise.resolve({ data: null }),
  ])

  const { data: comments } = await supabase
    .from('interactions')
    .select(`id, content, created_at, user:users(id, username, avatar)`)
    .eq('post_id', id)
    .eq('type', 'comment')
    .order('created_at', { ascending: false })

  const authorInitial = post.author?.username?.[0]?.toUpperCase() || '?'
  const authorColor = stringToColor(post.author?.username || 'unknown')

  return (
    <div className="min-h-[calc(100vh-73px)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to feed
        </Link>

        <article className="glass-card mt-6 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg" style={{ background: authorColor }}>
              {authorInitial}
            </div>
            <div>
              <p className="font-medium text-white">{post.author?.username || "text-white">{post.author?.username || 'Unknown'}</p>
              <p className="text-xs text-white/40">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {post.type === 'image' && (
            <div className="relative aspect-video bg-black/20">
              <img src={post.media_url} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
            </div>
          )}

          {post.type === 'video' && (
            <div className="relative aspect-video bg-black/40">
              <video src={post.media_url} className="w-full h-full" controls />
            </div>
          )}

          {post.caption && (
            <div className="p-4">
              <p className="text-white/80 leading-relaxed">{post.caption}</p>
            </div>
          )}

          <div className="flex items-center gap-6 border-t border-white/5 px-4 py-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {likesResult.count ?? 0} likes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {commentsResult.count ?? 0} comments
            </span>
          </div>
        </article>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Comments <span className="text-white/30">({commentsResult.count ?? 0})</span></h2>

          {session?.user && (
            <form action={async (formData) => {
              'use server'
              const content = formData.get('content') as string
              if (!content?.trim()) return
              const serverSupabase = getSupabase()
              await serverSupabase.from('interactions').insert({ post_id: id, user_id: session.user.id, type: 'comment', content })
            }} className="mb-6">
              <div className="glass-card rounded-xl p-4">
                <textarea name="content" rows={3} className="input-field w-full resize-none" placeholder="Add a comment..." required />
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="btn-primary text-sm">Post Comment</button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {(comments || []).map((comment: any) => (
              <div key={comment.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: stringToColor(comment.user?.username || 'unknown') }}>
                    {comment.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{comment.user?.username || 'Unknown'}</span>
                      <span className="text-xs text-white/30">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {(!comments || comments.length === 0) && (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-sm text-white/50">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function stringToColor(str: string): string {
  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
