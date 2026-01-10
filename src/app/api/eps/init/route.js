/**
 * EPS Payment Gateway - Initialize Payment
 * POST /api/eps/init
 * 
 * This endpoint initializes a payment with EPS
 * Returns a redirect URL for the customer to complete payment
 */

import { NextResponse } from 'next/server';
import { generateXHash, getEPSConfig, generateMerchantTransactionId } from '@/lib/eps';

export async function POST(request) {
  try {
    // Get EPS configuration
    const config = getEPSConfig();

    // Parse request body
    const body = await request.json();
    const {
      token,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      orderId,
      successUrl,
      failUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Generate unique merchant transaction ID
    const merchantTransactionId = orderId || generateMerchantTransactionId();

    // Generate x-hash using merchantTransactionId
    const xHash = generateXHash(merchantTransactionId);

    // Get base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';

    // Prepare EPS payment request
    const paymentRequest = {
      MerchantId: config.merchantId,
      StoreId: config.storeId,
      MerchantTransactionId: merchantTransactionId,
      OrderId: merchantTransactionId, // EPS requires OrderId field
      Amount: parseFloat(amount).toFixed(2),
      Currency: 'BDT',
      CustomerName: customerName || 'Customer',
      CustomerEmail: customerEmail || 'customer@example.com',
      CustomerPhone: customerPhone || '01700000000',
      SuccessUrl: successUrl || `${baseUrl}/api/eps/callback/success`,
      FailUrl: failUrl || `${baseUrl}/api/eps/callback/fail`,
      CancelUrl: cancelUrl || `${baseUrl}/api/eps/callback/cancel`,
      OrderDetails: `Order #${merchantTransactionId}`,
      ProductDetails: `Order #${merchantTransactionId}` // Some gateways need this
    };

    console.log('💳 EPS Init Request:', {
      url: `${config.apiBase}/v1/EPSEngine/InitializeEPS`,
      merchantTransactionId,
      amount: paymentRequest.Amount,
      xHash: xHash.substring(0, 20) + '...'
    });

    // Call EPS API to initialize payment
    const response = await fetch(`${config.apiBase}/v1/EPSEngine/InitializeEPS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-hash': xHash
      },
      body: JSON.stringify(paymentRequest)
    });

    const data = await response.json();

    // EPS API may return fields with different casing
    const redirectUrl = data.redirectUrl || data.RedirectURL || data.redirectURL;
    const transactionId = data.transactionId || data.TransactionId;
    const responseMessage = data.responseMessage || data.ResponseMessage;
    const responseCode = data.responseCode || data.ResponseCode;

    console.log('💳 EPS Init Response:', {
      status: response.status,
      responseCode: responseCode,
      hasRedirectUrl: !!redirectUrl,
      fullResponse: data
    });

    if (!response.ok || !redirectUrl) {
      console.error('❌ EPS Init Error:', data);
      
      // Get error message from different possible fields
      const errorMessage = data.errorMessage || data.ErrorMessage || 
                          responseMessage || 
                          'Failed to initialize EPS payment';
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCode: data.errorCode || data.ErrorCode,
          details: data
        },
        { status: response.status || 500 }
      );
    }

    // Return payment initialization data
    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl,
      merchantTransactionId: merchantTransactionId,
      transactionId: transactionId,
      message: 'Payment initialized successfully'
    });

  } catch (error) {
    console.error('❌ EPS Init Exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while initializing EPS payment',
        message: error.message
      },
      { status: 500 }
    );
  }
}
