import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreatePostForm from '@/components/CreatePostForm'

export default async function CreatePage() {
  const session = await auth()
  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900 mb-6">Create a Post</h1>
      <CreatePostForm />
    </div>
  )
}
