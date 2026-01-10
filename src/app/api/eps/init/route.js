import { NextResponse } from 'next/server';
import { generateHash, generateMerchantTransactionId } from '@/lib/epsHash';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      token,
      merchantTransactionId,
      customerOrderId,
      totalAmount,
      customerName,
      customerEmail,
      customerAddress,
      customerAddress2,
      customerCity,
      customerState,
      customerPostcode,
      customerCountry,
      customerPhone,
      productName,
      productProfile,
      productCategory,
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
    const orderId = customerOrderId || `ORDER-${Date.now()}`;
    
    // Hash input for InitializeEPS is merchantTransactionId (per documentation)
    const xHash = generateHash(txnId);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // EPS API exact field requirements from documentation
    const payload = {
      merchantId,
      storeId,
      CustomerOrderId: orderId, // ← This is the "OrderId" field!
      merchantTransactionId: txnId, // Note: typo in doc says "merchantTransactonId"
      TransactionTypeId: 1, // 1 = Web
      totalAmount: parseFloat(totalAmount).toFixed(2),
      successUrl: successUrl || `${baseUrl}/api/eps/callback/success`,
      failUrl: failUrl || `${baseUrl}/api/eps/callback/fail`,
      cancelUrl: cancelUrl || `${baseUrl}/api/eps/callback/cancel`,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || 'customer@example.com',
      CustomerAddress: customerAddress || 'Bangladesh', // Capital C per doc
      CustomerAddress2: customerAddress2 || '', // Optional
      CustomerCity: customerCity || 'Dhaka', // Capital C
      CustomerState: customerState || 'Dhaka', // Mandatory!
      CustomerPostcode: customerPostcode || '1000', // Mandatory!
      CustomerCountry: customerCountry || 'BD', // Capital C
      CustomerPhone: customerPhone || '01700000000', // Capital C
      // Optional shipping fields
      ShipmentName: '',
      ShipmentAddress: '',
      ShipmentAddress2: '',
      ShipmentCity: '',
      ShipmentState: '',
      ShipmentPostcode: '',
      ShipmentCountry: '',
      // Optional value fields
      ValueA: '',
      ValueB: '',
      ValueC: '',
      ValueD: '',
      ShippingMethod: 'NO',
      NoOfItem: '1',
      ProductName: productName || 'Product',
      ProductProfile: productProfile || 'general',
      ProductCategory: productCategory || 'General'
    };

    console.log('💳 EPS Init Request (Correct Spec):', {
      url: `${apiBase}/v1/EPSEngine/InitializeEPS`,
      CustomerOrderId: orderId,
      merchantTransactionId: txnId,
      totalAmount: payload.totalAmount,
      TransactionTypeId: payload.TransactionTypeId,
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
        { 
          success: false,
          error: data.ErrorMessage || 'Payment initialization failed', 
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: data.RedirectURL,
      transactionId: data.TransactionId,
      merchantTransactionId: txnId,
      customerOrderId: orderId
    });
  } catch (error) {
    console.error('❌ Init Exception:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
