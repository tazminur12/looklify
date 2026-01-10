/**
 * EPS Payment Gateway - Verify Payment
 * POST /api/eps/verify
 * 
 * This endpoint verifies a payment transaction with EPS
 * Should be called after customer returns from payment page
 */

import { NextResponse } from 'next/server';
import { generateXHash, getEPSConfig, validateEPSResponse } from '@/lib/eps';

export async function POST(request) {
  try {
    // Get EPS configuration
    const config = getEPSConfig();

    // Parse request body
    const body = await request.json();
    const { token, merchantTransactionId } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, error: 'Merchant Transaction ID is required' },
        { status: 400 }
      );
    }

    // Generate x-hash using merchantTransactionId
    const xHash = generateXHash(merchantTransactionId);

    // Prepare verification request
    const verificationRequest = {
      MerchantId: config.merchantId,
      MerchantTransactionId: merchantTransactionId
    };

    console.log('🔍 EPS Verify Request:', {
      url: `${config.apiBase}/v1/EPSEngine/VerifyTransaction`,
      merchantTransactionId,
      xHash: xHash.substring(0, 20) + '...'
    });

    // Call EPS API to verify transaction
    const response = await fetch(`${config.apiBase}/v1/EPSEngine/VerifyTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-hash': xHash
      },
      body: JSON.stringify(verificationRequest)
    });

    const data = await response.json();

    // Handle different field name casing
    const transactionStatus = data.transactionStatus || data.TransactionStatus;
    const merchantTransactionId = data.merchantTransactionId || data.MerchantTransactionId;
    const transactionId = data.transactionId || data.TransactionId;
    const amount = data.amount || data.Amount;
    const currency = data.currency || data.Currency;
    const responseCode = data.responseCode || data.ResponseCode;
    const responseMessage = data.responseMessage || data.ResponseMessage;

    console.log('🔍 EPS Verify Response:', {
      status: response.status,
      responseCode: responseCode,
      transactionStatus: transactionStatus,
      fullResponse: data
    });

    // Validate response
    const validation = validateEPSResponse(data);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: validation.code,
          details: data
        },
        { status: 400 }
      );
    }

    // Check transaction status
    const isSuccess = transactionStatus === 'Success' || 
                     transactionStatus === 'Approved' ||
                     transactionStatus === 'APPROVED' ||
                     transactionStatus === 'success';

    if (!isSuccess) {
      return NextResponse.json({
        success: false,
        verified: false,
        status: transactionStatus,
        message: responseMessage || 'Transaction not successful',
        data: {
          merchantTransactionId: merchantTransactionId,
          transactionId: transactionId,
          amount: amount,
          currency: currency,
          status: transactionStatus,
          timestamp: data.transactionTime || data.TransactionTime
        }
      });
    }

    // Transaction successful
    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      data: {
        merchantTransactionId: merchantTransactionId,
        transactionId: transactionId,
        amount: amount,
        currency: currency,
        status: transactionStatus,
        customerName: data.customerName || data.CustomerName,
        customerEmail: data.customerEmail || data.CustomerEmail,
        customerPhone: data.customerPhone || data.CustomerPhone,
        timestamp: data.transactionTime || data.TransactionTime,
        bankTransactionId: data.bankTransactionId || data.BankTransactionId
      }
    });

  } catch (error) {
    console.error('❌ EPS Verify Exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while verifying EPS payment',
        message: error.message
      },
      { status: 500 }
    );
  }
}
