import { NextResponse } from 'next/server';
import { products } from '@/lib/static-data';

// GET /api/seed - Seed database (static version - just returns success)
export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Using static data - no seeding needed',
      data: { 
        categories: 4, 
        products: products.length,
        variants: products.reduce((acc, p) => acc + p.variants.length, 0)
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
