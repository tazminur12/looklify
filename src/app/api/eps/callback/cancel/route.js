/**
 * EPS Payment Gateway - Cancel Callback
 * Handles cancelled payment redirects from EPS
 */

import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get transaction details from query parameters
    const merchantTransactionId = searchParams.get('merchantTransactionId') || 
                                  searchParams.get('MerchantTransactionId') ||
                                  searchParams.get('merchant_transaction_id');

    console.log('🚫 EPS Cancel Callback:', {
      merchantTransactionId,
      allParams: Object.fromEntries(searchParams)
    });

    // Redirect to checkout with cancelled message
    const cancelUrl = `/checkout?error=payment_cancelled&merchantTransactionId=${merchantTransactionId || ''}`;
    
    return redirect(cancelUrl);

  } catch (error) {
    console.error('❌ EPS Cancel Callback Error:', error);
    return redirect('/checkout?error=payment_callback_failed');
  }
}

export async function POST(request) {
  // Handle POST callback
  return GET(request);
}
