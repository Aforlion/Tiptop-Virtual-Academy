// domains/students/learning-service.ts

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
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  loggedAt: string;
}

export class LearningService {
  private static cohorts: Cohort[] = [
    { id: "coh-math-5a", name: "Mathematics - Year 5 - Cohort A", level: "Key Stage 2" },
    { id: "coh-science-6b", name: "Science - Year 6 - Cohort B", level: "Key Stage 2" }
  ];

  private static sessions: Session[] = [
    {
      id: "ses-101",
      cohortId: "coh-math-5a",
      title: "Introduction to Fractions & Equivalent Values",
      startTime: "2026-07-27T09:00:00Z",
      endTime: "2026-07-27T10:00:00Z",
      meetUrl: "https://meet.google.com/abc-defg-hij",
      teacherId: "tch-1"
    },
    {
      id: "ses-102",
      cohortId: "coh-science-6b",
      title: "Exploring Mammal and Insect Life Cycles",
      startTime: "2026-07-27T11:00:00Z",
      endTime: "2026-07-27T12:00:00Z",
      meetUrl: "https://meet.google.com/xyz-uvwx-yza",
      teacherId: "tch-1"
    }
  ];

  private static attendanceLogs: AttendanceRecord[] = [];

  public static getCohorts(): Cohort[] {
    return this.cohorts;
  }

  public static getSessions(cohortId?: string): Session[] {
    if (cohortId) {
      return this.sessions.filter((ses) => ses.cohortId === cohortId);
    }
    return this.sessions;
  }

  public static logAttendance(sessionId: string, studentId: string, status: "PRESENT" | "ABSENT" | "LATE"): AttendanceRecord {
    const record: AttendanceRecord = {
      sessionId,
      studentId,
      status,
      loggedAt: new Date().toISOString()
    };
    this.attendanceLogs.push(record);
    return record;
  }

  public static getAttendance(studentId: string): AttendanceRecord[] {
    return this.attendanceLogs.filter((rec) => rec.studentId === studentId);
  }
}
