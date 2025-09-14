import CourseDetail from '@/components/CourseDetail';

interface CoursePageProps {
  params: {
    courseCode: string;
  };
}

// Course data - in a real app, this would come from an API
const courseData: Record<string, any> = {
  'CS162': {
    name: 'Operating Systems and System Programming',
    description: 'Concepts and basic techniques in the design and analysis of operating systems. Process management, memory management, file systems, and distributed systems.',
    instructor: 'Prof. John Doe',
    semester: 'Fall 2025',
    units: 4
  },
  'CS170': {
    name: 'Efficient Algorithms and Intractable Problems',
    description: 'Concept and basic techniques in the design and analysis of algorithms; models of computation; lower bounds; algorithms for optimum search trees, balanced trees, VLSI layout, number theory.',
    instructor: 'Prof. Satish Rao',
    semester: 'Spring 2024',
    units: 4
  }
};

export default function CoursePage({ params }: CoursePageProps) {
  const courseCode = params.courseCode.toUpperCase();
  const course = courseData[courseCode] || {
    name: `${courseCode} Course`,
    description: 'Course description not available.',
    instructor: 'TBD',
    semester: 'TBD',
    units: 0
  };

  return (
    <CourseDetail
      courseCode={courseCode}
      courseName={course.name}
      description={course.description}
      instructor={course.instructor}
      semester={course.semester}
      units={course.units}
    />
  );
}
