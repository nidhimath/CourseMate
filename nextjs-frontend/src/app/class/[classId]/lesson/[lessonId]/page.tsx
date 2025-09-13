import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LessonView from '@/components/LessonView'

interface LessonPageProps {
  params: {
    classId: string
    lessonId: string
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <LessonView lessonId={params.lessonId} classId={params.classId} />
}
