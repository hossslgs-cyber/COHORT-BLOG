'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  userId,
}: {
  postId: string
  initialCount: number
  initialLiked: boolean
  userId?: string
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  async function toggleLike() {
    if (!session || loading) return
    setLoading(true)

    const res = await fetch(`/api/posts/${postId}/interactions`, {
      method: liked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'like' }),
    })

    if (res.ok) {
      setLiked(!liked)
      setCount((c) => (liked ? c - 1 : c + 1))
    }
    setLoading(false)
  }

  return (
    <button onClick={toggleLike} className="flex items-center gap-1 hover:text-red-500" disabled={loading}>
      <svg
        className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}
