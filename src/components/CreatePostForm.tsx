'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUploadThing } from '@/lib/uploadthing-client'
import { useSession } from 'next-auth/react'

export default function CreatePostForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const { startUpload } = useUploadThing('mediaUploader', {
    onClientUploadComplete: () => setUploading(false),
    onUploadError: (err) => {
      setError(err.message)
      setUploading(false)
    },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !session) return
    setUploading(true)
    setError('')

    try {
      const uploadRes = await startUpload([file])
      if (!uploadRes || uploadRes.length === 0) {
        throw new Error('Upload failed')
      }

      const uploadedFile = uploadRes[0]
      const url = uploadedFile?.url
      const type = uploadedFile?.type as 'image' | 'video' || 'image'

      if (!url) {
        throw new Error('No upload URL returned')
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: url, type, caption }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create post')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-zinc-300 p-8 text-center">
        {preview ? (
          <div className="space-y-4">
            {file?.type.startsWith('video') ? (
              <video src={preview} controls className="max-h-96 mx-auto rounded-lg" />
            ) : (
              <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
            )}
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null) }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm">Click to upload an image or video</p>
              <p className="text-xs">Max 8MB for images, 32MB for videos</p>
            </div>
          </label>
        )}
      </div>

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
        maxLength={1000}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-700"
      >
        {uploading ? 'Uploading...' : 'Share Post'}
      </button>
    </form>
  )
}
