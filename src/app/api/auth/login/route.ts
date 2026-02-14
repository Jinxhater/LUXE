import { NextResponse } from 'next/server';

// Simple in-memory session store (shared with register)
declare global {
  var sessions: Map<string, { userId: string; email: string; name: string; role: string }> | undefined;
}

// Initialize global sessions if not exists
if (!global.sessions) {
  global.sessions = new Map();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find existing session or create new one
    let sessionData = null;
    for (const [sessionId, data] of global.sessions!) {
      if (data.email === email) {
        sessionData = { sessionId, ...data };
        break;
      }
    }

    if (!sessionData) {
      // Create new user
      const userId = Math.random().toString(36).substr(2, 9);
      const sessionId = Math.random().toString(36).substr(2, 16);

      global.sessions!.set(sessionId, {
        userId,
        email,
        name: 'User',
        role: email.includes('admin') ? 'ADMIN' : 'USER',
      });

      sessionData = { sessionId, userId, email, name: 'User', role: email.includes('admin') ? 'ADMIN' : 'USER' };
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
      },
    });

    // Set cookie
    response.cookies.set('session', sessionData.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
