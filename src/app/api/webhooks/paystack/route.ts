import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret || !supabaseServiceKey || !supabaseUrl) {
    console.error('Webhook error: Missing environment variables');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  // Get raw body for signature verification
  const bodyText = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    return new NextResponse('Missing signature', { status: 400 });
  }

  // Verify Paystack signature
  const hash = crypto.createHmac('sha512', paystackSecret).update(bodyText).digest('hex');
  if (hash !== signature) {
    console.error('Webhook error: Invalid signature');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(bodyText);

  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const metadata = event.data.metadata;
    const creditsToAdd = parseInt(metadata.credits, 10);
    const parentId = metadata.parent_id;
    const subscriptionCode = event.data.subscription?.subscription_code || null;

    if (!parentId || isNaN(creditsToAdd)) {
      console.error('Webhook error: Missing metadata');
      return new NextResponse('Bad metadata', { status: 400 });
    }

    // 1. Update the payment record to success
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'success', 
        subscription_code: subscriptionCode,
        updated_at: new Date().toISOString() 
      })
      .eq('reference', reference)
      .eq('status', 'pending') // Only update if it's pending to prevent double-crediting
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Webhook error: Payment record not found or already processed', paymentError);
      return new NextResponse('Payment already processed', { status: 200 }); // Return 200 so Paystack stops retrying
    }

    // 2. Add flexible credits to the parent's profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('flexible_credits')
      .eq('id', parentId)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ flexible_credits: profile.flexible_credits + creditsToAdd })
        .eq('id', parentId);
        
      console.log(`Webhook success: Added ${creditsToAdd} credits to parent ${parentId}`);
    }
  }

  // Handle recurring subscription renewal payments
  if (event.event === 'invoice.update' && event.data.status === 'success') {
    const subscriptionCode = event.data.subscription?.subscription_code;
    
    if (subscriptionCode) {
      // Find initial payment to map subscription back to parent_id and package_id
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('parent_id, package_id')
        .eq('subscription_code', subscriptionCode)
        .eq('status', 'success')
        .limit(1)
        .single();

      if (existingPayment) {
        const parentId = existingPayment.parent_id;
        const packageId = existingPayment.package_id;

        // Get credits amount from package
        const { data: creditPackage } = await supabaseAdmin
          .from('credit_packages')
          .select('credits')
          .eq('id', packageId)
          .single();

        if (creditPackage) {
          const creditsToAdd = creditPackage.credits;
          const invoiceReference = `INV_${event.data.invoice_code || event.data.id || Date.now()}`;

          // Check for duplicate invoice processing
          const { data: duplicatePayment } = await supabaseAdmin
            .from('payments')
            .select('id')
            .eq('reference', invoiceReference)
            .limit(1);

          if (!duplicatePayment || duplicatePayment.length === 0) {
            // 1. Create a new successful payment ledger entry for the renewal
            await supabaseAdmin
              .from('payments')
              .insert({
                parent_id: parentId,
                package_id: packageId,
                reference: invoiceReference,
                amount_cents: event.data.amount,
                status: 'success',
                subscription_code: subscriptionCode
              });

            // 2. Add credits to the parent's account
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('flexible_credits')
              .eq('id', parentId)
              .single();

            if (profile) {
              await supabaseAdmin
                .from('profiles')
                .update({ flexible_credits: profile.flexible_credits + creditsToAdd })
                .eq('id', parentId);
                
              console.log(`Webhook success (Renewal): Added ${creditsToAdd} credits to parent ${parentId} for subscription ${subscriptionCode}`);
            }
          }
        }
      }
    }
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
