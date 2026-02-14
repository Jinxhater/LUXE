import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please login' },
        { status: 401 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddress),
        billingAddress: order.billingAddress ? JSON.parse(order.billingAddress) : null,
        items: order.items.map((item) => ({
          ...item,
          image: item.image ? JSON.parse(item.image) : null,
        })),
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    const { id } = await params;
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber } = body;

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      
      if (status === 'PAID') {
        updateData.paidAt = new Date();
      } else if (status === 'SHIPPED') {
        updateData.shippedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
