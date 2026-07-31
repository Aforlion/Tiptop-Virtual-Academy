import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../domains/shared/db/client";
import { invoices } from "../../../../domains/shared/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY environment variable." }, { status: 500 });
  }

  try {
    const { invoiceId, email } = await req.json();
    if (!invoiceId || !email) {
      return NextResponse.json({ error: "Missing invoiceId or email parameter." }, { status: 400 });
    }

    const db = await getDb();
    const targetInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });

    if (!targetInvoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Paystack amounts are in Kobo (1 Naira = 100 Kobo)
    const amountInKobo = Math.round(Number(targetInvoice.amount) * 100);

    // Call Paystack Transaction Initialize API
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        callback_url: `${req.nextUrl.origin}/?payment=success&invoiceId=${invoiceId}`,
        metadata: {
          invoiceId
        }
      })
    });

    const data = await paystackResponse.json();
    if (!data.status) {
      return NextResponse.json({ error: data.message || "Paystack initialization failed." }, { status: 400 });
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference
    });

  } catch (err: any) {
    console.error("Paystack initialize error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
