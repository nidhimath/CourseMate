import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClassLessonsView from '@/components/ClassLessonsView'

interface ClassPageProps {
  params: {
    classId: string
  }
}

export default async function ClassPage({ params }: ClassPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <ClassLessonsView classId={params.classId} />
}
