'use client'

import { useState, useEffect } from 'react'
import { coursesAPI } from '@/lib/api'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await coursesAPI.getCourses()
        setCourses(response.data)
      } catch (err) {
        setError(err)
        console.error('Error fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return { courses, loading, error }
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId) return

    const fetchCourse = async () => {
      try {
        setLoading(true)
        const response = await coursesAPI.getCourse(courseId)
        setCourse(response.data)
      } catch (err) {
        setError(err)
        console.error('Error fetching course:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  return { course, loading, error }
}
