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
    const studyGuidePath = path.join(process.cwd(), '..', 'CS162_New', `W${week}`, 'study_guide.md');
    
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
    
    // Filter out the main title section (starts with "# CS162")
    const contentSections = sections.filter(section => {
      const [titleLine] = section.split('\n');
      return !titleLine.trim().startsWith('# CS162');
    });
    
    const lessons = await Promise.all(
      contentSections.map(async (section, idx) => {
        const [titleLine, ...contentLines] = section.split('\n');
        const content = contentLines.join('\n');
        
        const processedContent = await remark()
          .use(html)
          .process(content);
        
        return {
          id: `${week}-${idx + 1}`,
          title: titleLine.trim(),
          content: processedContent.toString(),
        };
      })
    );
    
    return NextResponse.json({ lessons });
    
  } catch (error) {
    console.error('Error reading study guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
