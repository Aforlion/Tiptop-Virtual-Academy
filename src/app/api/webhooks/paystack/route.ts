import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Verify webhook signature if key is present
    if (secretKey && signature) {
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    // Event Handling
    switch (event.event) {
      case 'charge.success': {
        const paymentData = event.data;
        const reference = paymentData.reference;
        const amount = paymentData.amount / 100;
        const customerEmail = paymentData.customer?.email;
        const metadata = paymentData.metadata || {};

        console.log(`[Paystack Webhook] Charge succeeded: ${reference} for ${customerEmail} (${amount})`);
        // Here: Update Supabase enrollment status to 'enrolled', issue PDF invoice, send email
        break;
      }

      case 'invoice.payment_failed': {
        console.warn(`[Paystack Webhook] Payment failed for reference: ${event.data.reference}`);
        break;
      }

      default:
        console.log(`[Paystack Webhook] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

