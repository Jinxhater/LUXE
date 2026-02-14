import { NextResponse } from 'next/server';
import {
  getProductBySlug,
  type Product,
} from '@/lib/static-data';

// GET /api/products/[slug] - Get single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const product = getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Add computed fields
    const productWithRating = {
      ...product,
      avgRating: 4.5,
      reviewCount: Math.floor(Math.random() * 50) + 5,
    };

    return NextResponse.json({
      success: true,
      data: productWithRating,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
