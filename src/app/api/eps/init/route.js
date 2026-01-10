import { NextResponse } from 'next/server';
import { generateHash, generateMerchantTransactionId } from '@/lib/epsHash';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      token,
      merchantTransactionId,
      totalAmount,
      customerName,
      customerEmail,
      customerAddress,
      customerCity,
      customerCountry,
      customerPhone,
      productName,
      productProfile,
      successUrl,
      failUrl,
      cancelUrl
    } = body;

    if (!token || !totalAmount) {
      return NextResponse.json(
        { error: 'Token and totalAmount required' },
        { status: 400 }
      );
    }

    const merchantId = process.env.EPS_MERCHANT_ID;
    const storeId = process.env.EPS_STORE_ID;
    const apiBase = process.env.EPS_API_BASE;

    if (!merchantId || !storeId || !apiBase) {
      return NextResponse.json(
        { error: 'EPS merchant configuration missing' },
        { status: 500 }
      );
    }

    const txnId = merchantTransactionId || generateMerchantTransactionId();
    
    // Hash input for InitializeEPS is merchantTransactionId
    const xHash = generateHash(txnId);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // EPS API exact field requirements
    const payload = {
      merchantId,
      storeId,
      merchantTransactionId: txnId,
      OrderId: txnId, // EPS needs this separate field
      transactionTypeId: 1, // Required by spec
      totalAmount: parseFloat(totalAmount).toFixed(2),
      successUrl: successUrl || `${baseUrl}/api/eps/callback/success`,
      failUrl: failUrl || `${baseUrl}/api/eps/callback/fail`,
      cancelUrl: cancelUrl || `${baseUrl}/api/eps/callback/cancel`,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || 'customer@example.com',
      customerAddress: customerAddress || 'Bangladesh',
      customerCity: customerCity || 'Dhaka',
      customerCountry: customerCountry || 'Bangladesh',
      customerPhone: customerPhone || '01700000000',
      productName: productName || 'Product',
      productProfile: productProfile || 'general' // Required by spec
    };

    console.log('💳 EPS Init Request (New Spec):', {
      url: `${apiBase}/v1/EPSEngine/InitializeEPS`,
      merchantTransactionId: txnId,
      totalAmount: payload.totalAmount,
      transactionTypeId: payload.transactionTypeId,
      hasOrderId: !!payload.OrderId, // Check if OrderId exists
      xHash: xHash.substring(0, 20) + '...',
      payload
    });

    const response = await fetch(`${apiBase}/v1/EPSEngine/InitializeEPS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': xHash,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('💳 EPS Init Response:', {
      status: response.status,
      hasRedirectURL: !!data.RedirectURL,
      fullResponse: data
    });

    if (!response.ok || !data.RedirectURL) {
      console.error('❌ Init Error:', data);
      return NextResponse.json(
        { error: 'Payment initialization failed', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: data.RedirectURL,
      merchantTransactionId: txnId
    });
  } catch (error) {
    console.error('❌ Init Exception:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
