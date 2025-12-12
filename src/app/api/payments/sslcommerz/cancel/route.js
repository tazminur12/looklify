import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// SSL Commerz Cancel Redirect Handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get('tran_id');

    if (!tran_id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=invalid_callback`
      );
    }

    await dbConnect();

    // Find order
    const order = await Order.findOne({ orderId: tran_id });

    if (order) {
      // Update order payment status to cancelled
      order.payment.status = 'cancelled';
      order.payment.provider = 'sslcommerz';
      await order.save();
    }

    // Redirect back to checkout
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=payment_cancelled&orderId=${tran_id}`
    );

  } catch (error) {
    console.error('SSL Commerz cancel handler error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=callback_error`
    );
  }
}
