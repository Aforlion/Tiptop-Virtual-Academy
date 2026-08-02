import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../domains/shared/db/client";
import { profiles, cohorts, sessions } from "../../../../domains/shared/db/schema";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();

    // 1. Create Mock Teacher Profile
    const teacherId = crypto.randomUUID();
    await db.insert(profiles).values({
      id: teacherId,
      name: "Tutor Mark",
      role: "teacher"
    }).onConflictDoNothing();

    // 2. Create Mock Student Profile
    const studentId = "std-10111111-1111-1111-1111-111111111111"; // Fixed valid UUID format
    await db.insert(profiles).values({
      id: studentId,
      name: "Sarah Junior",
      role: "student"
    }).onConflictDoNothing();

    // 3. Create Mock Cohort
    const cohortId = crypto.randomUUID();
    await db.insert(cohorts).values({
      id: cohortId,
      name: "Mathematics - Year 5 - Cohort A",
      level: "Key Stage 2"
    }).onConflictDoNothing();

    // 4. Create Mock Sessions
    const sessionId1 = "ses-10111111-1111-1111-1111-111111111111"; // Fixed valid UUID format
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId1,
      cohortId,
      title: "Introduction to Fractions & Equivalent Values",
      startTime: now,
      endTime: oneHourLater,
      meetUrl: "https://meet.google.com/abc-defg-hij",
      teacherId
    }).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with valid UUID models.",
      seededRecords: {
        teacherId,
        studentId,
        cohortId,
        sessionId: sessionId1
      }
    });

  } catch (err: any) {
    console.error("Database seed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
