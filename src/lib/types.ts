export interface WhitelistEntry {
  email: string
  created_at: string
}

export interface User {
  id: string
  email: string
  username: string
  bio: string
  avatar: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  media_url: string
  type: 'image' | 'video'
  caption: string
  created_at: string
  author?: User
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

export interface Interaction {
  id: string
  user_id: string
  post_id: string
  type: 'like' | 'comment'
  content?: string
  created_at: string
  user?: User
}
