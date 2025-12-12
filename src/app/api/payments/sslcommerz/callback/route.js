import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Set up fetch polyfill for sslcommerz-lts package (like Express.js example)
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

// SSL Commerz IPN (Instant Payment Notification) Handler
// This endpoint receives payment status updates from SSL Commerz
export async function POST(request) {
  try {
    await dbConnect();

    // Get POST data from SSL Commerz
    // SSL Commerz typically sends form data (application/x-www-form-urlencoded)
    let paymentData = {};
    
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Handle JSON payload
        paymentData = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // Handle URL-encoded form data
        const formData = await request.formData();
        paymentData = Object.fromEntries(formData.entries());
      } else {
        // Try form data first (default for SSL Commerz)
        try {
          const formData = await request.formData();
          paymentData = Object.fromEntries(formData.entries());
        } catch {
          // Fallback to JSON
          paymentData = await request.json();
        }
      }
    } catch (parseError) {
      console.error('Error parsing payment data:', parseError);
      // Try to get as text and parse manually
      const text = await request.text();
      if (text) {
        try {
          paymentData = JSON.parse(text);
        } catch {
          // Parse as URL-encoded
          const params = new URLSearchParams(text);
          paymentData = Object.fromEntries(params.entries());
        }
      }
    }

    const {
      tran_id,
      val_id,
      amount,
      store_amount,
      currency,
      status,
      bank_tran_id,
      card_type,
      card_no,
      card_issuer,
      card_brand,
      card_issuer_country,
      card_issuer_country_code,
      store_id,
      verify_sign,
      verify_key,
      currency_type,
      currency_amount,
      currency_rate
    } = paymentData;

    // Get SSL Commerz credentials
    const storeId = process.env.STORE_ID;
    const storePassword = process.env.STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

    if (!storeId || !storePassword) {
      return NextResponse.json(
        { error: 'SSL Commerz credentials are not configured' },
        { status: 500 }
      );
    }

    // Find order by transaction ID
    const order = await Order.findOne({ orderId: tran_id });

    if (!order) {
      console.error('Order not found for transaction:', tran_id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate payment using SSL Commerz validation API
    if (val_id) {
      try {
        // Import like Express.js example
        const SSLCommerzPayment = require('sslcommerz-lts');
        const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
        const validationResponse = await sslcz.validate({ val_id });

        if (validationResponse.status === 'VALID') {
          // Payment is valid
          order.payment.status = 'completed';
          order.payment.transactionId = bank_tran_id || val_id;
          order.payment.valId = val_id;
          order.payment.provider = 'sslcommerz';
          order.payment.paidAt = new Date();
          order.payment.gatewayResponse = {
            amount: amount,
            currency: currency,
            cardType: card_type,
            cardNo: card_no,
            cardIssuer: card_issuer,
            cardBrand: card_brand
          };
          order.status = 'confirmed';
          await order.save();

          return NextResponse.json({
            status: 'success',
            message: 'Payment validated and order updated successfully'
          });
        } else {
          // Payment validation failed
          order.payment.status = 'failed';
          order.payment.provider = 'sslcommerz';
          order.payment.gatewayResponse = {
            status: status,
            error: 'Validation failed'
          };
          await order.save();

          return NextResponse.json({
            status: 'failed',
            message: 'Payment validation failed'
          });
        }
      } catch (validationError) {
        console.error('SSL Commerz validation error:', validationError);
        
        // Still update order with payment status from callback
        if (status === 'VALID' || status === 'VALIDATED') {
          order.payment.status = 'completed';
          order.payment.transactionId = bank_tran_id || val_id || tran_id;
          order.payment.valId = val_id;
          order.payment.provider = 'sslcommerz';
          order.payment.paidAt = new Date();
          order.status = 'confirmed';
        } else {
          order.payment.status = 'failed';
          order.payment.provider = 'sslcommerz';
        }
        await order.save();

        return NextResponse.json({
          status: 'warning',
          message: 'Payment processed but validation failed',
          error: validationError.message
        });
      }
    } else {
      // No validation ID, update based on status
      if (status === 'VALID' || status === 'VALIDATED') {
        order.payment.status = 'completed';
        order.payment.transactionId = bank_tran_id || tran_id;
        order.payment.provider = 'sslcommerz';
        order.payment.paidAt = new Date();
        order.status = 'confirmed';
      } else {
        order.payment.status = 'failed';
        order.payment.provider = 'sslcommerz';
      }
      await order.save();

      return NextResponse.json({
        status: 'processed',
        message: 'Payment status updated'
      });
    }

  } catch (error) {
    console.error('SSL Commerz callback error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Callback processing failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
