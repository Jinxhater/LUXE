import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/static-data';

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    const result = validateCoupon(code, subtotal);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: code.toUpperCase(),
        discount: result.discount,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
