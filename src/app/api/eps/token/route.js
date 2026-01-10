import { NextResponse } from 'next/server';
import { generateHash } from '@/lib/epsHash';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const userName = process.env.EPS_USERNAME;
    const password = process.env.EPS_PASSWORD;
    const apiBase = process.env.EPS_API_BASE;

    if (!userName || !password || !apiBase) {
      return NextResponse.json(
        { error: 'EPS configuration missing' },
        { status: 500 }
      );
    }

    // Hash input for GetToken is userName
    const xHash = generateHash(userName);

    console.log('🔐 EPS Token Request (New Spec):', {
      url: `${apiBase}/v1/Auth/GetToken`,
      userName: userName,
      xHash: xHash.substring(0, 20) + '...'
    });

    const response = await fetch(`${apiBase}/v1/Auth/GetToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': xHash
      },
      body: JSON.stringify({
        userName,
        password
      })
    });

    const data = await response.json();

    console.log('🔐 EPS Token Response:', {
      status: response.status,
      hasToken: !!data.token
    });

    if (!response.ok || !data.token) {
      console.error('❌ Token Error:', data);
      return NextResponse.json(
        { error: 'Failed to get token', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('❌ Token Exception:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
