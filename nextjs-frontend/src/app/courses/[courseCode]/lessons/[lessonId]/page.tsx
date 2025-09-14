import LessonContent from '@/components/LessonContent';

interface LessonPageProps {
  params: {
    courseCode: string;
    lessonId: string;
  };
}

// Course data - in a real app, this would come from an API
const courseData: Record<string, any> = {
  'CS162': {
    name: 'Operating Systems and System Programming'
  },
  'CS170': {
    name: 'Efficient Algorithms and Intractable Problems'
  }
};

export default function LessonPage({ params }: LessonPageProps) {
  const courseCode = params.courseCode.toUpperCase();
  const lessonId = params.lessonId;
  const course = courseData[courseCode] || {
    name: `${courseCode} Course`
  };

  // Generate lesson title based on lessonId
  const generateLessonTitle = (courseCode: string, lessonId: string): string => {
    if (courseCode === 'CS162') {
      const week = parseInt(lessonId.split('-')[0]);
      const lessonNum = parseInt(lessonId.split('-')[1]);
      
      const weekTopics: Record<number, string[]> = {
        1: ['Introduction to Operating Systems', 'Process Abstraction', 'System Calls'],
        2: ['Threads and Concurrency', 'Synchronization', 'Deadlocks'],
        3: ['Memory Management', 'Virtual Memory', 'Page Replacement'],
        4: ['File Systems', 'Storage Management', 'I/O Systems'],
        5: ['Scheduling Algorithms', 'Real-time Systems', 'Multiprocessing']
      };
      
      const topics = weekTopics[week] || ['Operating Systems Concepts'];
      return topics[lessonNum - 1] || `Week ${week} Lesson ${lessonNum}`;
    }
    
    return `${courseCode} Lesson ${lessonId}`;
  };

  const lessonTitle = generateLessonTitle(courseCode, lessonId);

  return (
    <LessonContent
      courseCode={courseCode}
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      courseName={course.name}
    />
  );
}
