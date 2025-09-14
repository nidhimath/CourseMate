import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { courseCode: string; lessonId: string } }
) {
  try {
    const { courseCode, lessonId } = params;
    const body = await request.json();
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Proxy the request to the Flask backend
    const response = await fetch(`http://localhost:5001/api/courses/${courseCode}/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { courseCode: string; lessonId: string } }
) {
  try {
    const { courseCode, lessonId } = params;

    // In a real application, you would:
    // 1. Authenticate the user
    // 2. Fetch the progress from the database
    
    // For now, we'll return mock progress data
    return NextResponse.json({
      courseCode,
      lessonId,
      completed: false,
      progress: 0,
      lastAccessed: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
