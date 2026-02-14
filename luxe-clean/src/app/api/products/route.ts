import { NextResponse } from 'next/server';
import {
  products,
  categories,
  getProductsByCategory,
  type Product,
} from '@/lib/static-data';

// GET /api/products - List products with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured');

    let filteredProducts = [...products];

    // Filter by active
    filteredProducts = filteredProducts.filter(p => p.active);

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category?.slug === category);
    }

    // Filter by featured
    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'bestselling':
        // Keep original order for now
        break;
      default:
        // newest - reverse order (newest first)
        filteredProducts.reverse();
    }

    // Pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    // Add computed fields
    const productsWithRating = paginatedProducts.map(p => ({
      ...p,
      avgRating: 4.5,
      reviewCount: Math.floor(Math.random() * 50) + 5,
    }));

    return NextResponse.json({
      success: true,
      data: productsWithRating,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
