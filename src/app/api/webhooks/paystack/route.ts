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

    if (!parentId || isNaN(creditsToAdd)) {
      console.error('Webhook error: Missing metadata');
      return new NextResponse('Bad metadata', { status: 400 });
    }

    // 1. Update the payment record to success
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('reference', reference)
      .eq('status', 'pending') // Only update if it's pending to prevent double-crediting
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Webhook error: Payment record not found or already processed', paymentError);
      return new NextResponse('Payment already processed', { status: 200 }); // Return 200 so Paystack stops retrying
    }

    // 2. Add flexible credits to the parent's profile
    // Note: To make this atomic without an RPC, we could just read then write, but RPC is safer.
    // However, since we locked the payment record (only processing it once), 
    // a simple read-and-update or a stored procedure works. We'll use a fast read/write here
    // because we don't expect high concurrency on the exact same parent profile for billing.

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

  return new NextResponse('Webhook processed', { status: 200 });
}
