import { NextRequest, NextResponse } from "next/server";
import { AdmissionsService } from "../../../../domains/admissions/admissions-service";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { parentName, parentEmail, studentName, studentBirthDate, programKey, siblingCount, referralCode } = await req.json();
    const enrollment = await AdmissionsService.createEnrollment(
      parentName,
      parentEmail,
      studentName,
      studentBirthDate,
      programKey,
      siblingCount,
      referralCode
    );
    return NextResponse.json(enrollment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
