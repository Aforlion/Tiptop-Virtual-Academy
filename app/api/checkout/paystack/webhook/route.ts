import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../domains/shared/db/client";
import { invoices } from "../../../../../domains/shared/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature header." }, { status: 401 });
    }

    const payload = await req.json();

    // Verify successful charge event
    if (payload.event === "charge.success") {
      const invoiceId = payload.data.metadata?.invoiceId;
      if (invoiceId) {
        const db = await getDb();
        await db.update(invoices)
          .set({ status: "PAID" })
          .where(eq(invoices.id, invoiceId));
        
        console.log(`[Webhook] Invoice ${invoiceId} marked as PAID via Paystack webhook.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
