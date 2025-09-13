import { coursesAPI, lessonsAPI, progressAPI } from './api'

// Types
export interface Course {
  id: string
  code: string
  name: string
  description: string
  instructor: string
  semester: string
  units: number
  is_active: boolean
  created_at: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  week: number
  order: number
  duration: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  course_id: string
  concepts?: Concept[]
  exercises?: Exercise[]
}

export interface Concept {
  id: string
  title: string
  content: string
  analogy: string
  lesson_id: string
  order: number
}

export interface Exercise {
  id: string
  title: string
  question: string
  hint: string
  solution: string
  lesson_id: string
  order: number
}

export interface Progress {
  id: string
  user_id: string
  lesson_id?: string
  concept_id?: string
  exercise_id?: string
  completed: boolean
  score?: number
  completed_at?: string
}

// Fallback data for development
const fallbackCourses: Course[] = [
  {
    id: 'cs170',
    code: 'CS 170',
    name: 'Efficient Algorithms and Intractable Problems',
    description: 'Concept and basic techniques in the design and analysis of algorithms; models of computation; lower bounds; algorithms for optimum search trees, balanced trees, VLSI layout, number theory.',
    instructor: 'Prof. Satish Rao',
    semester: 'Spring 2024',
    units: 4,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'math54',
    code: 'Math 54',
    name: 'Linear Algebra and Differential Equations',
    description: 'Linear algebra: matrix arithmetic, determinants, eigenvectors. Differential equations: first and second order.',
    instructor: 'Prof. Richard Bamler',
    semester: 'Spring 2024',
    units: 4,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  }
]

const fallbackLessons: { [courseId: string]: Lesson[] } = {
  cs170: [
    {
      id: 'cs170-intro',
      title: 'Course Introduction & Asymptotic Analysis',
      description: 'Overview of algorithmic thinking and Big-O notation review',
      week: 1,
      order: 1,
      duration: 45,
      difficulty: 'Beginner',
      course_id: 'cs170'
    },
    {
      id: 'cs170-divide-conquer',
      title: 'Divide and Conquer Algorithms',
      description: 'Master theorem and recursive algorithm analysis',
      week: 1,
      order: 2,
      duration: 60,
      difficulty: 'Intermediate',
      course_id: 'cs170'
    },
    {
      id: 'cs170-sorting',
      title: 'Advanced Sorting Algorithms',
      description: 'Beyond comparison sorts: counting, radix, and bucket sort',
      week: 1,
      order: 3,
      duration: 50,
      difficulty: 'Intermediate',
      course_id: 'cs170'
    },
    {
      id: 'cs170-graph-basics',
      title: 'Graph Algorithms Fundamentals',
      description: 'Graph representations and basic traversal algorithms',
      week: 2,
      order: 1,
      duration: 55,
      difficulty: 'Intermediate',
      course_id: 'cs170'
    },
    {
      id: 'cs170-bfs-dfs',
      title: 'BFS, DFS and Applications',
      description: 'Breadth-first and depth-first search with practical applications',
      week: 2,
      order: 2,
      duration: 65,
      difficulty: 'Intermediate',
      course_id: 'cs170'
    },
    {
      id: 'cs170-shortest-paths',
      title: "Dijkstra's Algorithm",
      description: "Learn shortest path algorithms using familiar concepts from CS 61B",
      week: 3,
      order: 1,
      duration: 70,
      difficulty: 'Advanced',
      course_id: 'cs170'
    }
  ],
  math54: [
    {
      id: 'math54-linear-algebra',
      title: 'Linear Algebra Foundations',
      description: 'Vectors, matrices, and linear transformations',
      week: 1,
      order: 1,
      duration: 50,
      difficulty: 'Beginner',
      course_id: 'math54'
    },
    {
      id: 'math54-determinants',
      title: 'Determinants and Eigenvalues',
      description: 'Computing determinants and finding eigenvalues and eigenvectors',
      week: 2,
      order: 1,
      duration: 60,
      difficulty: 'Intermediate',
      course_id: 'math54'
    },
    {
      id: 'math54-differential-equations',
      title: 'Differential Equations',
      description: 'First and second order differential equations',
      week: 3,
      order: 1,
      duration: 55,
      difficulty: 'Intermediate',
      course_id: 'math54'
    }
  ]
}

const fallbackLessonContent: { [lessonId: string]: any } = {
  'cs170-shortest-paths': {
    title: 'Dijkstra\'s Algorithm',
    description: 'Learn shortest path algorithms using familiar concepts from CS 61B',
    items: [
      {
        id: 'concept-1',
        type: 'concept',
        title: 'What is Dijkstra\'s Algorithm?',
        content: `Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph. Think of it like the **breadth-first search** you mastered in CS 61B, but now we're considering edge weights.

In CS 61B, you learned that BFS explores nodes level by level. Dijkstra's algorithm is similar, but instead of exploring by "levels," it explores by **distance from the source**. Just like how you used a **priority queue** for your A* implementation in the Berkeley Maps project!

The key insight: always process the **closest unvisited vertex** next. This greedy choice guarantees we find the shortest path, just like how the greedy approach worked for minimum spanning trees.`,
        analogy: 'Think of this like the BFS approach in CS 61B - we explored neighbors systematically, but now we prioritize by distance rather than discovery order.',
        completed: true
      },
      {
        id: 'exercise-1',
        type: 'exercise',
        title: '🎯 Quick Check: BFS vs Dijkstra\'s',
        problem: 'Given this simple graph, compare how BFS and Dijkstra\'s would explore vertices starting from A. What\'s the key difference?',
        hints: [
          'BFS uses a regular queue (FIFO)',
          'Dijkstra\'s uses a priority queue (min-heap)',
          'BFS finds shortest path in unweighted graphs',
          'Dijkstra\'s considers edge weights'
        ],
        cs61bConnection: 'Remember your BFS implementation from CS 61B? Dijkstra\'s is almost identical, just swap the queue for a priority queue!',
        completed: true
      }
    ]
  }
}

// Data service functions
export const dataService = {
  // Courses
  async getCourses(): Promise<Course[]> {
    try {
      const response = await coursesAPI.getCourses()
      return response.data
    } catch (error) {
      console.warn('Failed to fetch courses from API, using fallback data:', error)
      return fallbackCourses
    }
  },

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const response = await coursesAPI.getCourse(courseId)
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch course ${courseId} from API, using fallback data:`, error)
      return fallbackCourses.find(course => course.id === courseId) || null
    }
  },

  // Lessons
  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const response = await coursesAPI.getCourseLessons(courseId)
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch lessons for course ${courseId} from API, using fallback data:`, error)
      return fallbackLessons[courseId] || []
    }
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      const response = await lessonsAPI.getLesson(lessonId)
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch lesson ${lessonId} from API, using fallback data:`, error)
      // Find lesson in fallback data
      for (const courseLessons of Object.values(fallbackLessons)) {
        const lesson = courseLessons.find(l => l.id === lessonId)
        if (lesson) return lesson
      }
      return null
    }
  },

  async getLessonContent(lessonId: string): Promise<any> {
    try {
      // This would be a new API endpoint for lesson content
      const response = await lessonsAPI.getLesson(lessonId)
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch lesson content ${lessonId} from API, using fallback data:`, error)
      return fallbackLessonContent[lessonId] || null
    }
  },

  // Progress
  async getProgress(): Promise<Progress[]> {
    try {
      const response = await progressAPI.getProgress()
      return response.data
    } catch (error) {
      console.warn('Failed to fetch progress from API:', error)
      return []
    }
  },

  async updateProgress(data: Partial<Progress>): Promise<void> {
    try {
      await progressAPI.updateProgress(data)
    } catch (error) {
      console.warn('Failed to update progress:', error)
    }
  }
}
