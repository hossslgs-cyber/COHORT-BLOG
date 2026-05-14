import { auth } from '@/lib/auth'
import Feed from './Feed'

export default async function HomePage() {
  const session = await auth()

  return <Feed userId={session?.user?.id} />
}
