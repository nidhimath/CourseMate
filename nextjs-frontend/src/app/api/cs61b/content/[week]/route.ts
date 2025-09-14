import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { week: string } }
) {
  try {
    const week = params.week;
    
    // Path to the study guide file
    const studyGuidePath = path.join(process.cwd(), '..', 'CS61B_New', `W${week}`, 'study_guide.md');
    
    // Check if file exists
    if (!fs.existsSync(studyGuidePath)) {
      return NextResponse.json({ 
        lessons: [],
        error: `No study guide found for week ${week}` 
      });
    }
    
    // Read the study guide content
    const studyGuideContent = fs.readFileSync(studyGuidePath, 'utf-8');
    
    // Parse the markdown content into lessons
    const lessons = parseStudyGuideToLessons(studyGuideContent, week);
    
    return NextResponse.json({ lessons });
    
  } catch (error) {
    console.error('Error reading CS61B study guide:', error);
    return NextResponse.json(
      { error: 'Failed to read study guide' },
      { status: 500 }
    );
  }
}

function parseStudyGuideToLessons(content: string, week: string) {
  const lines = content.split('\n');
  const lessons: any[] = [];
  let currentLesson: any = null;
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for main headers (##)
    if (line.startsWith('## ')) {
      // Save previous lesson if exists
      if (currentLesson && currentContent.length > 0) {
        currentLesson.content = currentContent.join('\n');
        lessons.push(currentLesson);
      }
      
      // Start new lesson
      const title = line.replace(/^##\s*/, '').trim();
      // Remove leading # characters from title
      const cleanTitle = title.replace(/^#+\s*/, '').trim();
      
      currentLesson = {
        title: cleanTitle,
        content: '',
        week: parseInt(week),
        order: lessons.length + 1
      };
      currentContent = [];
    } else if (line.startsWith('# ')) {
      // Skip main course title headers
      continue;
    } else if (currentLesson) {
      // Add content to current lesson
      currentContent.push(line);
    }
  }
  
  // Save the last lesson
  if (currentLesson && currentContent.length > 0) {
    currentLesson.content = currentContent.join('\n');
    lessons.push(currentLesson);
  }
  
  // Filter out lessons with no content or title
  const validLessons = lessons.filter(lesson => 
    lesson.title && lesson.content && lesson.title.trim() !== ''
  );
  
  return validLessons;
}
