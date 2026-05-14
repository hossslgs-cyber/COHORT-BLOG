'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          Cohort Blog
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/create"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
              >
                New Post
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Sign Out
              </button>
              <span className="text-sm text-zinc-500">
                {session.user?.name}
              </span>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
