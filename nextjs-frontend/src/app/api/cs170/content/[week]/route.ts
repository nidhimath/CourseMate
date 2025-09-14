import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

export async function GET(
  request: NextRequest,
  { params }: { params: { week: string } }
) {
  try {
    const week = params.week;
    
    // Construct the path to the study guide
    const studyGuidePath = path.join(process.cwd(), '..', 'CS170_New', `W${week}`, 'study_guide.md');
    
    // Check if the file exists
    if (!fs.existsSync(studyGuidePath)) {
      return NextResponse.json(
        { error: `Study guide for week ${week} not found` },
        { status: 404 }
      );
    }
    
    // Read the study guide content
    const fileContents = fs.readFileSync(studyGuidePath, 'utf-8');
    
    // Split sections by "## " headers
    const sections = fileContents.split(/^## /gm).filter(Boolean);
    
    // Filter out the main title section (starts with "# CS170")
    const contentSections = sections.filter(section => {
      const [titleLine] = section.split('\n');
      return !titleLine.trim().startsWith('# CS170');
    });
    
    const lessons = await Promise.all(
      contentSections.map(async (section, idx) => {
        const [titleLine, ...contentLines] = section.split('\n');
        const content = contentLines.join('\n');
        
        // Clean up the title by removing # at the beginning
        let cleanTitle = titleLine.trim();
        if (cleanTitle.startsWith('#')) {
          cleanTitle = cleanTitle.replace(/^#+\s*/, '').trim();
        }
        
        const processedContent = await remark()
          .use(html)
          .process(content);
        
        return {
          id: `${week}-${idx + 1}`,
          title: cleanTitle,
          content: processedContent.toString(),
        };
      })
    );
    
    // Filter out lessons with no content
    const validLessons = lessons.filter(lesson => {
      const hasContent = lesson.content && lesson.content.trim().length > 0;
      const hasTitle = lesson.title && lesson.title.trim().length > 0;
      return hasContent && hasTitle;
    });
    
    return NextResponse.json({ lessons: validLessons });
    
  } catch (error) {
    console.error('Error reading study guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
