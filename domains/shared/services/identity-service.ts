// domains/shared/services/identity-service.ts

export type UserRole = "STUDENT" | "PARENT" | "TEACHER" | "EXECUTIVE";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface StudentProfile extends User {
  parentId?: string;
  birthDate: string;
  ageGroup: "junior" | "senior";
  cohortId?: string;
}

export interface ParentProfile extends User {
  childrenIds: string[];
  referralCredits: number;
}

export interface TeacherProfile extends User {
  cohortsLed: string[];
}

export const MOCK_USERS: Record<string, User | StudentProfile | ParentProfile | TeacherProfile> = {
  "std-1": {
    id: "std-1",
    email: "alice.smith@tiptopacademy.co.uk",
    role: "STUDENT",
    fullName: "Alice Smith",
    parentId: "prt-1",
    birthDate: "2018-05-12",
    ageGroup: "junior", // 3-6 EYFS/Primary Key Stage 1
    cohortId: "coh-math-5a"
  } as StudentProfile,
  "std-2": {
    id: "std-2",
    email: "james.smith@tiptopacademy.co.uk",
    role: "STUDENT",
    fullName: "James Smith",
    parentId: "prt-1",
    birthDate: "2014-09-20",
    ageGroup: "senior", // 7-12 Key Stage 2
    cohortId: "coh-science-6b"
  } as StudentProfile,
  "prt-1": {
    id: "prt-1",
    email: "parent.smith@gmail.com",
    role: "PARENT",
    fullName: "Sarah Smith",
    childrenIds: ["std-1", "std-2"],
    referralCredits: 1
  } as ParentProfile,
  "tch-1": {
    id: "tch-1",
    email: "teacher.davis@tiptopacademy.co.uk",
    role: "TEACHER",
    fullName: "Mr. Arthur Davis",
    cohortsLed: ["coh-math-5a", "coh-science-6b"]
  } as TeacherProfile,
  "exec-1": {
    id: "exec-1",
    email: "barbara.exec@tiptopacademy.co.uk",
    role: "EXECUTIVE",
    fullName: "Barbara Hastings"
  }
};

export class IdentityService {
  private static activeUserId: string = "prt-1"; // Default active session for preview portal

  public static getActiveUser(): User {
    return MOCK_USERS[this.activeUserId];
  }

  public static setActiveUser(userId: string): void {
    if (MOCK_USERS[userId]) {
      this.activeUserId = userId;
    }
  }

  public static getUser(id: string): User | undefined {
    return MOCK_USERS[id];
  }

  public static getStudentProfile(id: string): StudentProfile | undefined {
    const user = MOCK_USERS[id];
    return user && user.role === "STUDENT" ? (user as StudentProfile) : undefined;
  }

  public static getParentProfile(id: string): ParentProfile | undefined {
    const user = MOCK_USERS[id];
    return user && user.role === "PARENT" ? (user as ParentProfile) : undefined;
  }

  public static getTeacherProfile(id: string): TeacherProfile | undefined {
    const user = MOCK_USERS[id];
    return user && user.role === "TEACHER" ? (user as TeacherProfile) : undefined;
  }
}
