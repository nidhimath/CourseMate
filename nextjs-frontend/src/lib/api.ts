import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or session
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token')
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  googleAuth: (userData: any) => api.post('/api/auth/google', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
}

export const coursesAPI = {
  getCourses: () => api.get('/api/courses/'),
  getCourse: (id: string) => api.get(`/api/courses/${id}`),
  getCourseLessons: (id: string) => api.get(`/api/courses/${id}/lessons`),
}

export const lessonsAPI = {
  getLesson: (id: string) => api.get(`/api/lessons/${id}`),
  getLessonConcepts: (id: string) => api.get(`/api/lessons/${id}/concepts`),
  getLessonExercises: (id: string) => api.get(`/api/lessons/${id}/exercises`),
}

export const progressAPI = {
  getProgress: () => api.get('/api/progress/'),
  getLessonProgress: (lessonId: string) => api.get(`/api/progress/lesson/${lessonId}`),
  updateProgress: (data: any) => api.post('/api/progress/update', data),
}

export default api
