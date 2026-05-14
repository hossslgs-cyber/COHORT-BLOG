'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import type { Interaction } from '@/lib/types'

export default function CommentSection({ postId, userId }: { postId: string; userId?: string }) {
  const [comments, setComments] = useState<Interaction[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    fetch(`/api/posts/${postId}/interactions?type=comment`)
      .then((res) => res.json())
      .then(setComments)
      .finally(() => setLoading(false))
  }, [postId])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !content.trim() || submitting) return
    setSubmitting(true)

    const res = await fetch(`/api/posts/${postId}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'comment', content: content.trim() }),
    })

    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [...prev, comment])
      setContent('')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-3 pt-2 border-t border-zinc-100">
      {session && (
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-zinc-400"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-700"
          >
            Post
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-zinc-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-400">No comments yet.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <img
                src={comment.user?.avatar || '/default-avatar.png'}
                alt=""
                className="h-5 w-5 rounded-full mt-0.5"
              />
              <div>
                <p className="text-xs font-medium text-zinc-900">
                  {comment.user?.github_user}
                  <span className="font-normal text-zinc-400 ml-1">
                    {formatDate(comment.created_at)}
                  </span>
                </p>
                <p className="text-sm text-zinc-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
