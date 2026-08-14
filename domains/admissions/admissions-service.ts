// domains/admissions/admissions-service.ts
import { CurriculumService } from "../curriculum/curriculum-service";
import { getDb } from "../shared/db/client";
import { outbox, invoices } from "../shared/db/schema";

export interface OpenDayBooking {
  id: string;
  parentName: string;
  parentEmail: string;
  phone: string;
  preferredDate: string;
  keyStage: string;
  notes?: string;
  createdAt: string;
}

export interface EnrollmentRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentBirthDate: string;
  programKey: string;
  learningMode?: "full-time" | "homeschooling" | "modular";
  currency?: "NGN" | "GBP";
  referralCode?: string;
  status: "pending_payment" | "enrolled";
  tuitionAmount: number;
}

export class AdmissionsService {
  private static localEnrollments: EnrollmentRequest[] = [];
  private static localOpenDayBookings: OpenDayBooking[] = [];

  public static async bookOpenDay(
    parentName: string,
    parentEmail: string,
    phone: string,
    preferredDate: string,
    keyStage: string,
    notes?: string
  ): Promise<OpenDayBooking> {
    const booking: OpenDayBooking = {
      id: `odb-${Math.floor(Math.random() * 100000)}`,
      parentName,
      parentEmail,
      phone,
      preferredDate,
      keyStage,
      notes,
      createdAt: new Date().toISOString()
    };
    this.localOpenDayBookings.push(booking);
    return booking;
  }

  public static getOpenDayBookings(): OpenDayBooking[] {
    return this.localOpenDayBookings;
  }

  public static async createEnrollment(
    parentName: string,
    parentEmail: string,
    studentName: string,
    studentBirthDate: string,
    programKey: string,
    siblingCount: number,
    learningMode: "full-time" | "homeschooling" | "modular" = "full-time",
    currency: "NGN" | "GBP" = "NGN",
    referralCode?: string
  ): Promise<EnrollmentRequest> {
    const db = await getDb();

    // Base tuition rates in NGN
    let baseTuitionNGN = 750000;
    if (programKey === "eyfs") baseTuitionNGN = 600000;
    if (programKey === "secondary") baseTuitionNGN = 900000;

    // Adjust for learning mode (Homeschooling is 75%, Modular is 50%)
    if (learningMode === "homeschooling") baseTuitionNGN *= 0.75;
    if (learningMode === "modular") baseTuitionNGN *= 0.50;

    // Convert to GBP if requested (approx conversion factor: 1 GBP = 2000 NGN)
    let baseTuition = currency === "GBP" ? Math.round(baseTuitionNGN / 2000) : baseTuitionNGN;

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
      learningMode,
      currency,
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
        tuitionAmount,
        currency,
        learningMode
      }),
      status: "PENDING"
    });

    return enrollment;
  }

  public static getEnrollments(): EnrollmentRequest[] {
    return this.localEnrollments;
  }
}
