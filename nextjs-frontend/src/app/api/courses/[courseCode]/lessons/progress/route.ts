import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { courseCode: string } }
) {
  try {
    const { courseCode } = params;
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Proxy the request to the Flask backend
    const response = await fetch(`http://localhost:5001/api/courses/${courseCode}/lessons/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
