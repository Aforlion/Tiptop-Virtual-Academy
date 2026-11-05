import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, amount, currency = 'NGN', metadata } = body;

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // If Paystack Secret Key is configured, make live call to Paystack API
    if (secretKey && secretKey.startsWith('sk_')) {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // convert to kobo / cents
          currency,
          metadata: metadata || {},
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admissions/confirmation`
        })
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Development / Demo Simulation Mode
    const mockRef = `TVA_PSK_${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({
      status: true,
      message: 'Authorization URL created (Simulation Mode)',
      data: {
        authorization_url: `https://checkout.paystack.com/simulate/${mockRef}`,
        access_code: `mock_acc_${mockRef}`,
        reference: mockRef
      }
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize Paystack payment' },
      { status: 500 }
    );
  }
}

