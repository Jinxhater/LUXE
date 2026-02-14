import { NextResponse } from 'next/server';

// Static orders storage (in-memory, resets on server restart)
const orders: Array<{
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  items: Array<{
    variantId: string;
    productName: string;
    size: string;
    color: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}> = [];

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, discount = 0, notes } = body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: { variantId: string; quantity: number; price: number; productName: string; size: string; color: string; image: string }) => {
      subtotal += item.price * item.quantity;
      return {
        variantId: item.variantId,
        productName: item.productName,
        size: item.size,
        color: item.color,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber,
      userId: 'guest',
      status: 'PENDING',
      subtotal,
      shipping,
      discount,
      total,
      shippingAddress,
      items: orderItems,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(order);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
