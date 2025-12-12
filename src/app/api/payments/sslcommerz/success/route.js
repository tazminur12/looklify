import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Set up fetch polyfill for sslcommerz-lts package
if (typeof globalThis.fetch === 'undefined') {
  try {
    const nodeFetch = require('node-fetch');
    const fetchImpl = nodeFetch.default || nodeFetch;
    globalThis.fetch = fetchImpl;
    global.fetch = fetchImpl;
  } catch (err) {
    if (typeof fetch !== 'undefined') {
      globalThis.fetch = fetch;
      global.fetch = fetch;
    }
  }
}

// SSL Commerz Success Redirect Handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get('tran_id');
    const val_id = searchParams.get('val_id');
    const status = searchParams.get('status');

    if (!tran_id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=invalid_callback`
      );
    }

    await dbConnect();

    // Find order
    const order = await Order.findOne({ orderId: tran_id });

    if (!order) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=order_not_found`
      );
    }

    // Validate payment if val_id is provided
    if (val_id) {
      const storeId = process.env.STORE_ID;
      const storePassword = process.env.STORE_PASSWORD;
      const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

      if (storeId && storePassword) {
        try {
          const SSLCommerzPayment = require('sslcommerz-lts');
          const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
          const validationResponse = await sslcz.validate({ val_id });

          if (validationResponse.status === 'VALID') {
            order.payment.status = 'completed';
            order.payment.transactionId = validationResponse.bank_tran_id || val_id;
            order.payment.valId = val_id;
            order.payment.provider = 'sslcommerz';
            order.payment.paidAt = new Date();
            order.status = 'confirmed';
            await order.save();
          }
        } catch (error) {
          console.error('Payment validation error:', error);
          // Continue with redirect even if validation fails
        }
      }
    }

    // If status indicates success, update order
    if (status === 'VALID' || status === 'VALIDATED') {
      if (order.payment.status !== 'completed') {
        order.payment.status = 'completed';
        order.payment.transactionId = val_id || tran_id;
        order.payment.valId = val_id;
        order.payment.provider = 'sslcommerz';
        order.payment.paidAt = new Date();
        order.status = 'confirmed';
        await order.save();
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/success?orderId=${tran_id}&paymentMethod=sslcommerz&val_id=${val_id || ''}`
    );

  } catch (error) {
    console.error('SSL Commerz success handler error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?error=callback_error`
    );
  }
}
