'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/action-utils';

export async function initializePaystackCheckout(packageId: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get the credit package
  const { data: creditPackage, error: packageError } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (packageError || !creditPackage) {
    return { success: false, error: 'Credit package not found.' };
  }

  // Generate a unique reference
  const reference = `TIPTOP_${user.id.substring(0, 8)}_${Date.now()}`;

  // Insert a pending payment record
  const { error: insertError } = await supabase
    .from('payments')
    .insert({
      parent_id: user.id,
      package_id: packageId,
      reference,
      amount_cents: creditPackage.price_cents,
      status: 'pending',
    });

  if (insertError) {
    return { success: false, error: 'Failed to create payment record.' };
  }

  // Call Paystack API
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('PAYSTACK_SECRET_KEY is missing from environment variables');
    return { success: false, error: 'Payment gateway configuration error.' };
  }

  try {
    // Paystack requires amount in kobo/cents. Our price_cents is exactly that.
    const payload = {
      email: user.email,
      amount: creditPackage.price_cents,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/parent/billing?status=success`,
      metadata: {
        package_id: packageId,
        parent_id: user.id,
        credits: creditPackage.credits,
      }
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Paystack API Error:', result);
      return { success: false, error: result.message || 'Failed to initialize payment.' };
    }

    return { success: true, data: { url: result.data.authorization_url } };
  } catch (error: unknown) {
    console.error('Paystack fetch error:', error);
    return { success: false, error: 'A network error occurred while connecting to the payment gateway.' };
  }
}
