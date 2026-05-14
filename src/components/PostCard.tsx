'use client'

import { formatDate } from '@/lib/utils'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import type { Post } from '@/lib/types'

export default function PostCard({ post, userId }: { post: Post; userId?: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <img
          src={post.author?.avatar || '/default-avatar.png'}
          alt={post.author?.github_user || 'user'}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {post.author?.github_user}
          </p>
          <p className="text-xs text-zinc-500">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {post.type === 'image' ? (
        <img
          src={post.media_url}
          alt={post.caption || 'Post image'}
          className="w-full max-h-[600px] object-contain bg-zinc-100"
        />
      ) : (
        <video
          src={post.media_url}
          controls
          className="w-full max-h-[600px] object-contain bg-zinc-100"
        />
      )}

      <div className="px-4 py-3 space-y-2">
        {post.caption && (
          <p className="text-sm text-zinc-800">{post.caption}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <LikeButton
            postId={post.id}
            initialCount={post.likes_count ?? 0}
            initialLiked={post.user_has_liked ?? false}
            userId={userId}
          />
          <span>{post.comments_count ?? 0} comments</span>
        </div>
        <CommentSection postId={post.id} userId={userId} />
      </div>
    </article>
  )
}
