import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Bkash Payment Callback Handler
export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentID, status, merchantInvoiceNumber, transactionStatus } = body;

    await dbConnect();

    // Find order by invoice number
    const order = await Order.findOne({ orderId: merchantInvoiceNumber });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order payment status based on callback
    if (status === 'success' || transactionStatus === 'Completed') {
      order.payment.status = 'completed';
      order.status = 'confirmed';
      order.payment.transactionId = paymentID;
      order.payment.paymentID = paymentID;
      order.payment.provider = 'bkash';
      order.payment.paidAt = new Date();
      await order.save();
    } else {
      order.payment.status = 'failed';
      order.payment.provider = 'bkash';
      await order.save();
    }

    // Return success response to Bkash
    return NextResponse.json({
      statusCode: '0000',
      statusMessage: 'Successful'
    });

  } catch (error) {
    console.error('Bkash callback error:', error);
    return NextResponse.json(
      { 
        statusCode: '0010',
        statusMessage: 'Failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Also handle GET requests (for redirect-based callbacks)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');
    const merchantInvoiceNumber = searchParams.get('merchantInvoiceNumber');

    if (!paymentID || !status || !merchantInvoiceNumber) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=invalid_callback`
      );
    }

    await dbConnect();

    // Find order by invoice number
    const order = await Order.findOne({ orderId: merchantInvoiceNumber });

    if (!order) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=order_not_found`
      );
    }

    // Update order payment status
    if (status === 'success') {
      order.payment.status = 'completed';
      order.status = 'confirmed';
      order.payment.transactionId = paymentID;
      order.payment.paymentID = paymentID;
      order.payment.provider = 'bkash';
      order.payment.paidAt = new Date();
      await order.save();

      // Redirect to success page
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/success?orderId=${merchantInvoiceNumber}&paymentID=${paymentID}`
      );
    } else {
      order.payment.status = 'failed';
      order.payment.provider = 'bkash';
      await order.save();

      // Redirect to failure page
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=payment_failed`
      );
    }

  } catch (error) {
    console.error('Bkash callback GET error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=callback_error`
    );
  }
}

