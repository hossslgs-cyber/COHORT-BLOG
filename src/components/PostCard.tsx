'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Post {
  id: string
  media_url: string
  type: string
  caption: string
  created_at: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
  likes_count: number
  comments_count: number
  user_has_liked: boolean
}

export default function PostCard({ post }: { post: Post }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(post.user_has_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setLoading(false)
    }
  }

  const authorInitial = post.author?.username?.[0]?.toUpperCase() || '?'
  const authorColor = stringToColor(post.author?.username || 'unknown')

  return (
    <article className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
          style={{ background: authorColor }}
        >
          {authorInitial}
        </div>
        <div>
          <p className="font-medium text-white">{post.author?.username || 'Unknown'}</p>
          <p className="text-xs text-white/40">{formatDate(post.created_at)}</p>
        </div>
      </div>

      <Link href={`/post/${post.id}`} className="block">
        {post.type === 'image' && (
          <div className="relative aspect-video overflow-hidden bg-black/20">
            <img
              src={post.media_url}
              alt={post.caption || 'Post'}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {post.type === 'video' && (
          <div className="relative aspect-video bg-black/40">
            <video src={post.media_url} className="w-full h-full" controls preload="metadata" />
          </div>
        )}
      </Link>

      {post.caption && (
        <div className="px-4 pt-3">
          <p className="text-sm text-white/70">{post.caption}</p>
        </div>
      )}

      <div className="flex items-center gap-1 p-4 pt-3">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            liked
              ? 'bg-red-500/10 text-red-400'
              : 'text-white/50 hover:bg-white/5 hover:text-red-400'
          }`}
        >
          <svg
            className="h-5 w-5"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount > 0 && likesCount}
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-indigo-400 transition-all"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comments_count > 0 && post.comments_count}
        </Link>
      </div>
    </article>
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
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
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
