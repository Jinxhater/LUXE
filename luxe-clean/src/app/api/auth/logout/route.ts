import { NextResponse } from 'next/server';

declare global {
  var sessions: Map<string, { userId: string; email: string; name: string; role: string }> | undefined;
}

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}
