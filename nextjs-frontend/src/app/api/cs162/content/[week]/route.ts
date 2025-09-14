import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { week: string } }
) {
  try {
    const week = params.week;
    
    // Construct the path to the study guide
    const studyGuidePath = path.join(process.cwd(), '..', 'CS162_New', `W${week}`, 'study_guide.md');
    
    // Check if the file exists
    if (!fs.existsSync(studyGuidePath)) {
      return NextResponse.json(
        { error: `Study guide for week ${week} not found` },
        { status: 404 }
      );
    }
    
    // Read the study guide content
    const content = fs.readFileSync(studyGuidePath, 'utf-8');
    
    // Parse the content into sections
    const sections = parseStudyGuideContent(content);
    
    return NextResponse.json({
      week: week,
      content: content,
      sections: sections,
      metadata: {
        totalSections: sections.length,
        wordCount: content.split(/\s+/).length
      }
    });
    
  } catch (error) {
    console.error('Error reading study guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseStudyGuideContent(content: string): string[] {
  // Split content by ## headers to get main sections
  const sections = content
    .split(/^## /m)
    .filter(section => section.trim().length > 0)
    .map(section => {
      // Extract the section title (first line)
      const lines = section.split('\n');
      const title = lines[0].trim();
      return title;
    })
    .filter(title => title.length > 0);
  
  return sections;
}
