'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="nav-glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold gradient-text">
          Cohort Blog
        </Link>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="h-5 w-5 animate-pulse rounded-full bg-indigo-500/30" />
          ) : session?.user ? (
            <>
              <span className="hidden text-sm text-white/60 sm:inline">
                {session.user.name}
              </span>
              <Link href="/create-post" className="btn-primary text-sm">
                New Post
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/70">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
