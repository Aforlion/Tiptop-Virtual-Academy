// domains/students/learning-service.ts
import { getDb } from "../shared/db/client";
import { cohorts, sessions, attendance } from "../shared/db/schema";
import { eq, and } from "drizzle-orm";

export interface Cohort {
  id: string;
  name: string;
  level: string;
}

export interface Session {
  id: string;
  cohortId: string;
  title: string;
  startTime: string;
  endTime: string;
  meetUrl: string;
  teacherId: string;
}

export interface AttendanceRecord {
  id?: string;
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  loggedAt: string;
}

export class LearningService {
  public static async getCohorts(): Promise<Cohort[]> {
    const db = await getDb();
    const dbCohorts = await db.query.cohorts.findMany();
    return dbCohorts.map((c: any) => ({
      id: c.id,
      name: c.name,
      level: c.level
    }));
  }

  public static async getSessions(cohortId?: string): Promise<Session[]> {
    const db = await getDb();
    let dbSessions;
    
    if (cohortId) {
      dbSessions = await db.query.sessions.findMany({
        where: eq(sessions.cohortId, cohortId)
      });
    } else {
      dbSessions = await db.query.sessions.findMany();
    }

    return dbSessions.map((s: any) => ({
      id: s.id,
      cohortId: s.cohortId,
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      meetUrl: s.meetUrl,
      teacherId: s.teacherId
    }));
  }

  public static async logAttendance(sessionId: string, studentId: string, status: "PRESENT" | "ABSENT" | "LATE"): Promise<AttendanceRecord> {
    const db = await getDb();
    const newId = crypto.randomUUID();
    const loggedAtStr = new Date().toISOString();

    await db.insert(attendance).values({
      id: newId,
      sessionId,
      studentId,
      status,
      loggedAt: loggedAtStr
    });

    return {
      id: newId,
      sessionId,
      studentId,
      status,
      loggedAt: loggedAtStr
    };
  }

  public static async getAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const db = await getDb();
    const records = await db.query.attendance.findMany({
      where: eq(attendance.studentId, studentId)
    });

    return records.map((r: any) => ({
      id: r.id,
      sessionId: r.sessionId,
      studentId: r.studentId,
      status: r.status as "PRESENT" | "ABSENT" | "LATE",
      loggedAt: r.loggedAt
    }));
  }
}
