import { NextRequest, NextResponse } from "next/server";
import { LearningService } from "../../../../domains/students/learning-service";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId parameter." }, { status: 400 });
    }
    const attendance = await LearningService.getAttendance(studentId);
    return NextResponse.json(attendance);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, studentId, status } = await req.json();
    if (!sessionId || !studentId || !status) {
      return NextResponse.json({ error: "Missing sessionId, studentId, or status parameter." }, { status: 400 });
    }
    const record = await LearningService.logAttendance(sessionId, studentId, status);
    return NextResponse.json(record);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
