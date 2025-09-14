'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { LessonProvider } from '@/contexts/LessonContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LessonProvider>
        {children}
      </LessonProvider>
    </SessionProvider>
  )
}
