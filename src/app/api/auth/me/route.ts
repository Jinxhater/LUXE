import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

declare global {
  var sessions: Map<string, { userId: string; email: string; name: string; role: string }> | undefined;
}

// Initialize global sessions if not exists
if (!global.sessions) {
  global.sessions = new Map();
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sessionData = global.sessions!.get(sessionId);
    
    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }
}
