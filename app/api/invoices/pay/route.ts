import { NextRequest, NextResponse } from "next/server";
import { FinanceService } from "../../../../domains/finance/finance-service";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }
    const success = await FinanceService.payInvoice(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
