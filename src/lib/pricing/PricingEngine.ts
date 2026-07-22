export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'full_time' | 'subject' | 'support' | 'holiday' | 'tutoring';
  base_price_ngn: number;
  registration_fee_ngn: number;
  pricing_model: 'termly' | 'monthly' | 'hourly' | 'one_time';
  is_active: boolean;
}

export interface StudentEnrollmentInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  target_year_group?: string;
  admission_doc_url?: string;
}

export interface PricingCalculationResult {
  product: Product;
  studentCount: number;
  basePriceTotal: number;
  registrationFeesTotal: number;
  siblingDiscountAmount: number;
  referralDiscountAmount: number;
  totalDiscount: number;
  finalTotal: number;
}

export class PricingEngine {
  /**
   * Calculates pricing dynamically per Tiptop Virtual Academy business rules:
   * 1. Registration Fee: Early Years = ₦50,000, Primary = ₦70,000 (per student)
   * 2. Sibling Discount: 10% off base tuition for 2nd and 3rd child enrolled concurrently
   * 3. Referral Discount: 5% off tuition when valid referral code provided
   */
  public static calculate(
    product: Product,
    students: StudentEnrollmentInput[],
    referralCode?: string
  ): PricingCalculationResult {
    const studentCount = Math.max(1, students.length);
    const basePriceTotal = product.base_price_ngn * studentCount;
    const registrationFeesTotal = product.registration_fee_ngn * studentCount;

    // Sibling discount applies 10% off base tuition for 2nd and 3rd enrolled child
    let siblingDiscountAmount = 0;
    if (studentCount > 1) {
      const eligibleSiblingCount = Math.min(studentCount - 1, 2); // 2nd and 3rd children (max 2 discounted)
      siblingDiscountAmount = product.base_price_ngn * 0.10 * eligibleSiblingCount;
    }

    // Referral discount applies 5% off base tuition after sibling discount if code present
    let referralDiscountAmount = 0;
    if (referralCode && referralCode.trim().length > 0) {
      const remainingTuition = basePriceTotal - siblingDiscountAmount;
      referralDiscountAmount = remainingTuition * 0.05;
    }

    const totalDiscount = siblingDiscountAmount + referralDiscountAmount;
    const finalTotal = basePriceTotal + registrationFeesTotal - totalDiscount;

    return {
      product,
      studentCount,
      basePriceTotal,
      registrationFeesTotal,
      siblingDiscountAmount,
      referralDiscountAmount,
      totalDiscount,
      finalTotal: Math.max(0, finalTotal)
    };
  }
}
