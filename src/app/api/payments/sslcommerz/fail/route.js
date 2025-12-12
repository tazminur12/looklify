import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// SSL Commerz Fail Redirect Handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get('tran_id');
    const error = searchParams.get('error');

    if (!tran_id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=invalid_callback`
      );
    }

    await dbConnect();

    // Find order
    const order = await Order.findOne({ orderId: tran_id });

    if (order) {
      // Update order payment status to failed
      order.payment.status = 'failed';
      order.payment.provider = 'sslcommerz';
      order.payment.gatewayError = error || 'Payment failed';
      await order.save();
    }

    // Redirect to checkout with error message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=payment_failed&orderId=${tran_id}`
    );

  } catch (error) {
    console.error('SSL Commerz fail handler error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=callback_error`
    );
  }
}
