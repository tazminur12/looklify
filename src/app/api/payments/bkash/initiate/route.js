import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import axios from 'axios';

// Bkash Payment Initiation
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, orderId, invoiceNumber } = body;

    // Validate required fields
    if (!amount || !orderId || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Amount, orderId, and invoiceNumber are required' },
        { status: 400 }
      );
    }

    // Get Bkash credentials from environment variables
    const bkashAppKey = process.env.BKASH_APP_KEY;
    const bkashAppSecret = process.env.BKASH_APP_SECRET;
    const bkashUsername = process.env.BKASH_USERNAME;
    const bkashPassword = process.env.BKASH_PASSWORD;
    const bkashBaseUrl = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

    if (!bkashAppKey || !bkashAppSecret || !bkashUsername || !bkashPassword) {
      return NextResponse.json(
        { error: 'Bkash credentials are not configured' },
        { status: 500 }
      );
    }

    // Step 1: Get Grant Token
    const grantTokenResponse = await axios.post(
      `${bkashBaseUrl}/tokenized/checkout/token/grant`,
      {
        app_key: bkashAppKey,
        app_secret: bkashAppSecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          username: bkashUsername,
          password: bkashPassword
        }
      }
    );

    if (!grantTokenResponse.data || !grantTokenResponse.data.id_token) {
      return NextResponse.json(
        { error: 'Failed to obtain grant token from Bkash' },
        { status: 500 }
      );
    }

    const idToken = grantTokenResponse.data.id_token;

    // Step 2: Create Payment
    const callbackUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/bkash/callback`;
    
    const createPaymentResponse = await axios.post(
      `${bkashBaseUrl}/tokenized/checkout/payment/create`,
      {
        mode: '0011', // Checkout payment mode
        payerReference: invoiceNumber,
        callbackURL: callbackUrl,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoiceNumber,
        orderId: orderId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: idToken,
          'X-App-Key': bkashAppKey
        }
      }
    );

    if (!createPaymentResponse.data || !createPaymentResponse.data.paymentID) {
      return NextResponse.json(
        { error: 'Failed to create payment in Bkash' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentID: createPaymentResponse.data.paymentID,
        bkashURL: createPaymentResponse.data.bkashURL,
        statusCode: createPaymentResponse.data.statusCode,
        statusMessage: createPaymentResponse.data.statusMessage
      }
    });

  } catch (error) {
    console.error('Bkash payment initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Bkash payment',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}

