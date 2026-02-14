import { NextResponse } from 'next/server';

// Simple in-memory session store
const sessions = new Map<string, { userId: string; email: string; name: string; role: string }>();

// Register
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Create a simple user (in production, use proper DB and password hashing)
    const userId = Math.random().toString(36).substr(2, 9);
    const sessionId = Math.random().toString(36).substr(2, 16);

    sessions.set(sessionId, {
      userId,
      email,
      name: name || 'User',
      role: 'USER',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name: name || 'User',
        role: 'USER',
      },
    });

    // Set cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
