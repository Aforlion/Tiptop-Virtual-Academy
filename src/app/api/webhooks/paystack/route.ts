import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient } from '@/lib/supabase';

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

    if (event.event === 'charge.success') {
      const paymentData = event.data;
      const reference = paymentData.reference;
      const amount = paymentData.amount / 100; // convert kobo/cents to main unit
      const currency = paymentData.currency || 'NGN';
      const customerEmail = paymentData.customer?.email;
      const metadata = paymentData.metadata || {};

      console.log(`[Paystack Webhook] Charge succeeded: ${reference} for ${customerEmail} (${amount} ${currency})`);

      try {
        const supabase = getAdminClient();

        // 1. Update application status
        await supabase
          .from('admissions_applications')
          .update({
            payment_status: 'deposit_paid',
            status: 'enrolled',
            deposit_amount: amount,
            currency: currency
          })
          .eq('paystack_reference', reference);

        // 2. Insert invoice payment record
        await supabase
          .from('invoices')
          .insert({
            title: metadata.title || 'Admissions Registration Deposit',
            amount: amount,
            currency: currency,
            status: 'paid',
            paystack_reference: reference,
            payment_method: paymentData.channel || 'card',
            paid_at: new Date().toISOString(),
            due_date: new Date().toISOString().split('T')[0]
          });
      } catch (dbErr) {
        console.warn('[Paystack Webhook] Database reconciliation note:', dbErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Paystack webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
