import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default async function KnowledgeGraphPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <KnowledgeGraph />
}
