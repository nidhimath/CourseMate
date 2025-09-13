'use client'

import { useState, useEffect } from 'react'
import { progressAPI } from '@/lib/api'

export function useProgress() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const response = await progressAPI.getProgress()
        setProgress(response.data)
      } catch (err) {
        setError(err)
        console.error('Error fetching progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const updateProgress = async (data: any) => {
    try {
      const response = await progressAPI.updateProgress(data)
      // Refresh progress data
      const progressResponse = await progressAPI.getProgress()
      setProgress(progressResponse.data)
      return response.data
    } catch (err) {
      setError(err)
      console.error('Error updating progress:', err)
      throw err
    }
  }

  return { progress, loading, error, updateProgress }
}

export function useLessonProgress(lessonId: string) {
  const [lessonProgress, setLessonProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lessonId) return

    const fetchLessonProgress = async () => {
      try {
        setLoading(true)
        const response = await progressAPI.getLessonProgress(lessonId)
        setLessonProgress(response.data)
      } catch (err) {
        setError(err)
        console.error('Error fetching lesson progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonProgress()
  }, [lessonId])

  return { lessonProgress, loading, error }
}
