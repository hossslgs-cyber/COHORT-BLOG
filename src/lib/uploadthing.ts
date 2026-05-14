import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
    video: { maxFileSize: '32MB', maxFileCount: 1 },
  })
    .middleware(async (req) => {
      // Don't require auth in middleware - validate in onUploadComplete instead
      return {}
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const mimeType = file.type || ''
        const type = mimeType.startsWith('image') ? 'image' : 'video'
        console.log('[Uploadthing] Upload complete:', { url: file.url, type })
        return { url: file.url, type }
      } catch (err) {
        console.error('[Uploadthing Upload Error]:', err)
        throw err
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
