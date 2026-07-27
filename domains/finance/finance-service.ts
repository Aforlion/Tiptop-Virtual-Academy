// domains/finance/finance-service.ts

export interface Invoice {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  status: "PAID" | "UNPAID";
  dueDate: string;
}

export class FinanceService {
  private static invoices: Invoice[] = [
    {
      id: "inv-2001",
      parentName: "Sarah Smith",
      studentName: "Alice Smith",
      amount: 675000, // Year 3 tuition after sibling discount
      status: "PAID",
      dueDate: "2026-08-01"
    },
    {
      id: "inv-2002",
      parentName: "Sarah Smith",
      studentName: "James Smith",
      amount: 675000,
      status: "UNPAID",
      dueDate: "2026-08-01"
    }
  ];

  public static getInvoices(parentName?: string): Invoice[] {
    if (parentName) {
      return this.invoices.filter((inv) => inv.parentName === parentName);
    }
    return this.invoices;
  }

  public static addInvoice(parentName: string, studentName: string, amount: number): Invoice {
    const invoice: Invoice = {
      id: `inv-${Math.floor(Math.random() * 9000) + 1000}`,
      parentName,
      studentName,
      amount,
      status: "UNPAID",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 14 days out
    };
    this.invoices.push(invoice);
    return invoice;
  }

  public static payInvoice(id: string): boolean {
    const invoice = this.invoices.find((inv) => inv.id === id);
    if (invoice && invoice.status === "UNPAID") {
      invoice.status = "PAID";
      return true;
    }
    return false;
  }
}
