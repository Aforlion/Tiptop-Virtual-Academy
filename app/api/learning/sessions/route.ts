import { NextRequest, NextResponse } from "next/server";
import { LearningService } from "../../../../domains/students/learning-service";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const cohortId = req.nextUrl.searchParams.get("cohortId") || undefined;
    const sessions = await LearningService.getSessions(cohortId);
    return NextResponse.json(sessions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
