import { NextRequest, NextResponse } from "next/server";
import { FinanceService } from "../../../domains/finance/finance-service";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const parentName = req.nextUrl.searchParams.get("parentName") || undefined;
    const invoices = await FinanceService.getInvoices(parentName);
    return NextResponse.json(invoices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { parentName, studentName, amount } = await req.json();
    const invoice = await FinanceService.addInvoice(parentName, studentName, amount);
    return NextResponse.json(invoice);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
