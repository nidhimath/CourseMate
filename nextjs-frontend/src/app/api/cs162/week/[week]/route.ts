import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { week: string } }
) {
  try {
    const week = params.week;
    
    if (!week || isNaN(Number(week))) {
      return NextResponse.json({ error: 'Invalid week number' }, { status: 400 });
    }

    const weekNum = Number(week);
    if (weekNum < 1 || weekNum > 15) {
      return NextResponse.json({ error: 'Week number must be between 1 and 15' }, { status: 400 });
    }

    const cs162Path = path.join(process.cwd(), '..', 'CS162_New');
    const weekPath = path.join(cs162Path, `W${weekNum}`);
    const studyGuidePath = path.join(weekPath, 'study_guide.md');
    
    // Check if the study guide exists
    if (!fs.existsSync(studyGuidePath)) {
      return NextResponse.json({ error: `Week ${weekNum} content not found` }, { status: 404 });
    }

    // Read the study guide content
    const content = fs.readFileSync(studyGuidePath, 'utf-8');
    
    // Also try to read metadata if it exists
    let metadata = null;
    const metadataPath = path.join(weekPath, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      try {
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (error) {
        console.error(`Error reading metadata for week ${weekNum}:`, error);
      }
    }

    return NextResponse.json({
      week: weekNum,
      content,
      metadata,
      lastModified: fs.statSync(studyGuidePath).mtime
    });

  } catch (error) {
    console.error(`Error fetching week ${params.week} content:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
