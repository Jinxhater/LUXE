import { NextResponse } from 'next/server';

// Cart is handled client-side with Zustand + localStorage
// This endpoint just returns success for persistence sync

export async function GET() {
  return NextResponse.json({ success: true, data: { items: [] } });
}

export async function POST() {
  return NextResponse.json({ success: true });
}

export async function PUT() {
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
