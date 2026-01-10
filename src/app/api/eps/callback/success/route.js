/**
 * EPS Payment Gateway - Success Callback
 * Handles successful payment redirects from EPS
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
    
    const transactionId = searchParams.get('transactionId') || 
                         searchParams.get('TransactionId') ||
                         searchParams.get('transaction_id');

    console.log('✅ EPS Success Callback:', {
      merchantTransactionId,
      transactionId,
      allParams: Object.fromEntries(searchParams)
    });

    // Redirect to success page with transaction details
    const successUrl = `/checkout/success?merchantTransactionId=${merchantTransactionId || ''}&transactionId=${transactionId || ''}&payment=eps`;
    
    return redirect(successUrl);

  } catch (error) {
    console.error('❌ EPS Success Callback Error:', error);
    return redirect('/checkout?error=payment_callback_failed');
  }
}

export async function POST(request) {
  // Handle POST callback (some gateways send POST instead of GET)
  return GET(request);
}
