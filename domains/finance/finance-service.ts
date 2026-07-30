// domains/finance/finance-service.ts
import { dbPromise } from "../shared/db/client";
import { invoices } from "../shared/db/schema";
import { eq } from "drizzle-orm";

export interface Invoice {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  status: "PAID" | "UNPAID";
  dueDate: string;
}

export class FinanceService {
  public static async getInvoices(parentName?: string): Promise<Invoice[]> {
    const db = await dbPromise;
    const dbInvoices = await db.query.invoices.findMany();
    
    // Map database rows to UI Invoice interface
    const mapped = dbInvoices.map((inv: any) => ({
      id: inv.id,
      parentName: "Sarah Smith", // Map to mock parent name or profile relations
      studentName: inv.studentName,
      amount: Number(inv.amount),
      status: inv.status as "PAID" | "UNPAID",
      dueDate: inv.dueDate
    }));

    if (parentName) {
      return mapped.filter((inv: any) => inv.parentName === parentName);
    }
    return mapped;
  }

  public static async addInvoice(parentName: string, studentName: string, amount: number): Promise<Invoice> {
    const db = await dbPromise;
    const newId = crypto.randomUUID();
    const dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    await db.insert(invoices).values({
      id: newId,
      studentName,
      amount: amount.toString(),
      status: "UNPAID",
      dueDate: dueDateStr
    });

    return {
      id: newId,
      parentName,
      studentName,
      amount,
      status: "UNPAID",
      dueDate: dueDateStr
    };
  }

  public static async payInvoice(id: string): Promise<boolean> {
    const db = await dbPromise;
    const targetInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id)
    });

    if (targetInvoice && targetInvoice.status === "UNPAID") {
      await db.update(invoices)
        .set({ status: "PAID" })
        .where(eq(invoices.id, id));
      return true;
    }
    return false;
  }
}
