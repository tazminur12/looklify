import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Set up fetch polyfill for sslcommerz-lts package (similar to Express.js example)
// The package needs fetch available globally
if (typeof globalThis.fetch === 'undefined') {
  try {
    const nodeFetch = require('node-fetch');
    const fetchImpl = nodeFetch.default || nodeFetch;
    globalThis.fetch = fetchImpl;
    global.fetch = fetchImpl;
  } catch (err) {
    // Fallback to native fetch (Node.js 18+)
    if (typeof fetch !== 'undefined') {
      globalThis.fetch = fetch;
      global.fetch = fetch;
    }
  }
}

// SSL Commerz Payment Initiation
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated and guest users
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { amount, orderId, customerInfo } = body;

    // Validate required fields
    if (!amount || !orderId || !customerInfo) {
      return NextResponse.json(
        { error: 'Amount, orderId, and customerInfo are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get SSL Commerz credentials from environment variables
    const storeId = process.env.STORE_ID;
    const storePassword = process.env.STORE_PASSWORD;
    // Developer credentials are for sandbox, so isLive should be false
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true'; // Keep false for developer/sandbox credentials

    if (!storeId || !storePassword) {
      return NextResponse.json(
        { error: 'SSL Commerz credentials are not configured' },
        { status: 500 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Prepare product name (limit to 250 chars as per SSL Commerz requirements)
    const productNames = order.items.map(item => item.name).join(', ');
    const productName = productNames.length > 250 
      ? productNames.substring(0, 247) + '...' 
      : productNames || 'Products';

    // Prepare payment data
    const paymentData = {
      total_amount: parseFloat(amount.toFixed(2)), // Convert to number
      currency: 'BDT',
      tran_id: orderId, // Transaction ID (using orderId)
      success_url: `${baseUrl}/api/payments/sslcommerz/success`,
      fail_url: `${baseUrl}/api/payments/sslcommerz/fail`,
      cancel_url: `${baseUrl}/api/payments/sslcommerz/cancel`,
      ipn_url: `${baseUrl}/api/payments/sslcommerz/callback`,
      shipping_method: 'NO',
      product_name: productName,
      product_category: 'General',
      product_profile: 'general',
      cus_name: (customerInfo.name || order.shipping.fullName).substring(0, 50),
      cus_email: customerInfo.email || order.shipping.email,
      cus_add1: (customerInfo.address || order.shipping.address || 'N/A').substring(0, 50),
      cus_add2: '',
      cus_city: (customerInfo.city || order.shipping.city || 'Dhaka').substring(0, 50),
      cus_state: (customerInfo.state || 'Dhaka').substring(0, 50),
      cus_postcode: customerInfo.postcode || '1200',
      cus_country: customerInfo.country || 'Bangladesh',
      cus_phone: customerInfo.phone || order.shipping.phone,
      cus_fax: customerInfo.phone || order.shipping.phone || '',
      multi_card_name: 'all',
      value_a: orderId, // Store orderId for reference
      value_b: session?.user?.id || 'guest',
      value_c: 'sslcommerz',
      value_d: order._id.toString()
    };

    // Validate payment data
    if (!paymentData.cus_name || !paymentData.cus_email || !paymentData.cus_phone) {
      return NextResponse.json(
        { 
          error: 'Missing required customer information',
          details: {
            hasName: !!paymentData.cus_name,
            hasEmail: !!paymentData.cus_email,
            hasPhone: !!paymentData.cus_phone
          }
        },
        { status: 400 }
      );
    }

    // Ensure fetch is available right before using SSL Commerz (critical!)
    if (typeof globalThis.fetch === 'undefined' && typeof global.fetch === 'undefined') {
      try {
        const nodeFetch = require('node-fetch');
        const fetchImpl = nodeFetch.default || nodeFetch;
        globalThis.fetch = fetchImpl;
        global.fetch = fetchImpl;
        console.log('✅ Fetch polyfill set right before SSL Commerz call');
      } catch (err) {
        console.error('❌ Failed to set fetch before SSL Commerz:', err);
      }
    }

    // Import SSLCommerzPayment (like Express.js example from GitHub)
    const SSLCommerzPayment = require('sslcommerz-lts');
    
    // Initialize SSL Commerz (same pattern as Express.js example)
    const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);

    try {
      console.log('Initiating SSL Commerz payment with data:', {
        storeId: storeId ? `${storeId.substring(0, 4)}...` : 'missing',
        isLive,
        amount: paymentData.total_amount,
        orderId: paymentData.tran_id,
        hasCustomerInfo: !!customerInfo,
        customerName: paymentData.cus_name,
        customerEmail: paymentData.cus_email,
        customerPhone: paymentData.cus_phone,
        hasFetch: typeof globalThis.fetch !== 'undefined' || typeof global.fetch !== 'undefined'
      });

      // Use Promise pattern like Express.js example: sslcz.init(data).then(...)
      // Following the exact pattern from GitHub Express.js example
      const apiResponse = await sslcz.init(paymentData);

      console.log('SSL Commerz API Response:', {
        hasGatewayPageURL: !!apiResponse?.GatewayPageURL,
        status: apiResponse?.status,
        statusCode: apiResponse?.statusCode,
        statusMessage: apiResponse?.statusMessage,
        sessionkey: apiResponse?.sessionkey,
        fullResponse: JSON.stringify(apiResponse).substring(0, 500)
      });

      if (apiResponse?.GatewayPageURL) {
        // Update order with payment initiation info
        order.payment.provider = 'sslcommerz';
        order.payment.status = 'processing';
        order.payment.gatewaySessionKey = apiResponse.sessionkey || null;
        await order.save();

        return NextResponse.json({
          success: true,
          data: {
            gatewayPageURL: apiResponse.GatewayPageURL,
            sessionKey: apiResponse.sessionkey,
            status: apiResponse.status
          }
        });
      } else {
        // More detailed error message
        const errorMessage = apiResponse?.statusMessage || 
                           apiResponse?.failedreason || 
                           'Unable to initiate payment session';
        const errorDetails = {
          status: apiResponse?.status,
          statusCode: apiResponse?.statusCode,
          statusMessage: apiResponse?.statusMessage,
          failedreason: apiResponse?.failedreason,
          fullResponse: apiResponse
        };

        console.error('SSL Commerz initiation failed:', errorDetails);

        return NextResponse.json(
          { 
            error: errorMessage,
            details: errorDetails
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('SSL Commerz payment initiation error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response?.data
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to initiate SSL Commerz payment',
          details: error.message,
          errorType: error.name,
          ...(error.response?.data && { apiError: error.response.data })
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('SSL Commerz payment initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate SSL Commerz payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
