/**
 * EPS Payment Gateway - Fail Callback
 * Handles failed payment redirects from EPS
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
    
    const message = searchParams.get('message') || 
                   searchParams.get('Message') ||
                   'Payment failed';

    console.log('❌ EPS Fail Callback:', {
      merchantTransactionId,
      message,
      allParams: Object.fromEntries(searchParams)
    });

    // Redirect to checkout with error message
    const errorUrl = `/checkout?error=payment_failed&message=${encodeURIComponent(message)}&merchantTransactionId=${merchantTransactionId || ''}`;
    
    return redirect(errorUrl);

  } catch (error) {
    console.error('❌ EPS Fail Callback Error:', error);
    return redirect('/checkout?error=payment_callback_failed');
  }
}

export async function POST(request) {
  // Handle POST callback
  return GET(request);
}
