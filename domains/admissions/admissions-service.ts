// domains/admissions/admissions-service.ts
import { CurriculumService } from "../curriculum/curriculum-service";

export interface EnrollmentRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentBirthDate: string;
  programKey: string;
  referralCode?: string;
  status: "pending_payment" | "enrolled";
  tuitionAmount: number;
}

export class AdmissionsService {
  private static enrollments: EnrollmentRequest[] = [];

  public static createEnrollment(
    parentName: string,
    parentEmail: string,
    studentName: string,
    studentBirthDate: string,
    programKey: string,
    siblingCount: number,
    referralCode?: string
  ): EnrollmentRequest {
    // Base tuition rates
    let baseTuition = 750000; // Default Primary
    if (programKey === "eyfs") baseTuition = 600000;
    if (programKey === "secondary") baseTuition = 900000;

    // Sibling discounts
    const siblingDiscount = CurriculumService.calculateSiblingDiscount(baseTuition, siblingCount);
    // Referral discounts
    const referralDiscount = referralCode ? CurriculumService.calculateReferralDiscount(baseTuition, 1) : 0;

    const tuitionAmount = Math.max(baseTuition - siblingDiscount - referralDiscount, 0);

    const enrollment: EnrollmentRequest = {
      id: `enr-${Math.floor(Math.random() * 100000)}`,
      parentName,
      parentEmail,
      studentName,
      studentBirthDate,
      programKey,
      referralCode,
      status: "pending_payment",
      tuitionAmount
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  public static getEnrollments(): EnrollmentRequest[] {
    return this.enrollments;
  }
}
