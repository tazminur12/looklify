import { NextResponse } from 'next/server';
import { generateHash } from '@/lib/epsHash';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantTransactionId = searchParams.get('merchantTransactionId');
    const token = searchParams.get('token');

    if (!merchantTransactionId || !token) {
      return NextResponse.json(
        { error: 'merchantTransactionId and token required' },
        { status: 400 }
      );
    }

    const apiBase = process.env.EPS_API_BASE;
    if (!apiBase) {
      return NextResponse.json(
        { error: 'EPS configuration missing' },
        { status: 500 }
      );
    }

    // Hash input for Verify is merchantTransactionId
    const xHash = generateHash(merchantTransactionId);

    console.log('🔍 EPS Verify Request (New Spec):', {
      url: `${apiBase}/v1/EPSEngine/CheckMerchantTransactionStatus`,
      merchantTransactionId,
      xHash: xHash.substring(0, 20) + '...'
    });

    const response = await fetch(
      `${apiBase}/v1/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${merchantTransactionId}`,
      {
        method: 'GET',
        headers: {
          'x-hash': xHash,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    console.log('🔍 EPS Verify Response:', {
      status: response.status,
      data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Verification failed', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Verify Exception:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
