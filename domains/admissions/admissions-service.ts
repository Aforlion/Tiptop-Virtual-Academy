// domains/admissions/admissions-service.ts
import { CurriculumService } from "../curriculum/curriculum-service";
import { getDb } from "../shared/db/client";
import { outbox, invoices } from "../shared/db/schema";

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
  private static localEnrollments: EnrollmentRequest[] = [];

  public static async createEnrollment(
    parentName: string,
    parentEmail: string,
    studentName: string,
    studentBirthDate: string,
    programKey: string,
    siblingCount: number,
    referralCode?: string
  ): Promise<EnrollmentRequest> {
    const db = await getDb();

    // Base tuition rates
    let baseTuition = 750000;
    if (programKey === "eyfs") baseTuition = 600000;
    if (programKey === "secondary") baseTuition = 900000;

    // Sibling discounts
    const siblingDiscount = CurriculumService.calculateSiblingDiscount(baseTuition, siblingCount);
    // Referral discounts
    const referralDiscount = referralCode ? CurriculumService.calculateReferralDiscount(baseTuition, 1) : 0;

    const tuitionAmount = Math.max(baseTuition - siblingDiscount - referralDiscount, 0);
    const enrollmentId = `enr-${Math.floor(Math.random() * 100000)}`;

    const enrollment: EnrollmentRequest = {
      id: enrollmentId,
      parentName,
      parentEmail,
      studentName,
      studentBirthDate,
      programKey,
      referralCode,
      status: "pending_payment",
      tuitionAmount
    };

    this.localEnrollments.push(enrollment);

    // Insert outbox transactional log event
    await db.insert(outbox).values({
      eventType: "student.enrolled",
      payload: JSON.stringify({
        enrollmentId,
        studentName,
        parentName,
        tuitionAmount
      }),
      status: "PENDING"
    });

    return enrollment;
  }

  public static getEnrollments(): EnrollmentRequest[] {
    return this.localEnrollments;
  }
}
