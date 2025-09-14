import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cs162Path = path.join(process.cwd(), '..', 'CS162_New');
    
    // Check if CS162_New directory exists
    if (!fs.existsSync(cs162Path)) {
      return NextResponse.json({ error: 'CS162 content not found' }, { status: 404 });
    }

    const weeks: any[] = [];
    const totalWeeks = 15;
    let availableWeeks = 0;

    // Check each week folder
    for (let week = 1; week <= totalWeeks; week++) {
      const weekPath = path.join(cs162Path, `W${week}`);
      const studyGuidePath = path.join(weekPath, 'study_guide.md');
      
      const hasContent = fs.existsSync(studyGuidePath);
      if (hasContent) {
        availableWeeks++;
      }

      // Read the study guide to get a title (first line or first heading)
      let title = `Week ${week} Content`;
      if (hasContent) {
        try {
          const content = fs.readFileSync(studyGuidePath, 'utf-8');
          const lines = content.split('\n');
          const firstLine = lines.find(line => line.trim().length > 0);
          if (firstLine && firstLine.startsWith('#')) {
            title = firstLine.replace(/^#+\s*/, '').trim();
          } else if (firstLine) {
            title = firstLine.trim().substring(0, 50) + (firstLine.length > 50 ? '...' : '');
          }
        } catch (error) {
          console.error(`Error reading week ${week} content:`, error);
        }
      }

      weeks.push({
        week,
        title,
        hasContent,
        content: '' // Don't include full content in overview
      });
    }

    return NextResponse.json({
      weeks,
      totalWeeks,
      availableWeeks
    });

  } catch (error) {
    console.error('Error fetching CS162 weeks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
