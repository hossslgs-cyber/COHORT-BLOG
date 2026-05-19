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

  const handleFileChange = useCallback((e: React.ChangeEvent<<HTMLInputElement>) => {
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
    <div className="glass-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/70">Photo or Video</label>
          
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              {file?.type.startsWith('video') ? (
                <video src={preview} className="w-full max-h-80" controls />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
              )}
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center hover:border-indigo-500/30 transition-colors">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Click to upload</p>
                <p className="text-xs text-white/40 mt-1">Images or videos up to 8MB</p>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70">Caption <span className="text-white/30">(optional)</span></label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            className="input-field mt-1 resize-none"
            placeholder="What's on your mind?"
          />
          <p className="mt-1 text-right text-xs text-white/30">{caption.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Publish Post'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-white/10 px-6 py-3 text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
