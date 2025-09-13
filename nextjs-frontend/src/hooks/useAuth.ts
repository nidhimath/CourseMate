'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { authAPI } from '@/lib/api'

export function useAuth() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Store access token if available
      if (session.accessToken) {
        localStorage.setItem('access_token', session.accessToken)
      }
      
      // Fetch user data from backend
      const fetchUser = async () => {
        try {
          const response = await authAPI.getCurrentUser()
          setUser(response.data)
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchUser()
    } else if (status === 'unauthenticated') {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  return {
    user,
    session,
    loading,
    isAuthenticated: status === 'authenticated'
  }
}
