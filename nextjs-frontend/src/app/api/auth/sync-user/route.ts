import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, image, google_id } = body

    // Forward the request to Flask backend
    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        image,
        google_id,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: 'Failed to sync user with backend' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in sync-user route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
