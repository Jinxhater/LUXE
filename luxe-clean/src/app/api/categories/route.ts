import { NextResponse } from 'next/server';
import { categories } from '@/lib/static-data';

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categoriesWithCount = categories.map(c => ({
      ...c,
      productCount: Math.floor(Math.random() * 20) + 5,
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
