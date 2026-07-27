// domains/assessment/assessment-service.ts

export interface Assignment {
  id: string;
  cohortId: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  fileUrl: string;
  grade?: string;
  feedback?: string;
}

export class AssessmentService {
  private static assignments: Assignment[] = [
    {
      id: "asg-301",
      cohortId: "coh-math-5a",
      title: "Adding unlike denominators exercises",
      description: "Complete tasks 1-5 on page 42 of the workbook and upload your notes.",
      dueDate: "2026-07-29T23:59:59Z"
    },
    {
      id: "asg-302",
      cohortId: "coh-science-6b",
      title: "Life cycle observation chart",
      description: "Draw and label a complete life cycle diagram of a butterfly.",
      dueDate: "2026-07-30T23:59:59Z"
    }
  ];

  private static submissions: Submission[] = [
    {
      id: "sub-1",
      assignmentId: "asg-301",
      studentId: "std-1",
      submittedAt: "2026-07-24T10:00:00Z",
      fileUrl: "https://drive.google.com/open?id=doc-12293",
      grade: "A",
      feedback: "Excellent work converting unlike denominators to common bases. Keep it up!"
    }
  ];

  public static getAssignments(cohortId?: string): Assignment[] {
    if (cohortId) {
      return this.assignments.filter((asg) => asg.cohortId === cohortId);
    }
    return this.assignments;
  }

  public static submitAssignment(assignmentId: string, studentId: string, fileUrl: string): Submission {
    const submission: Submission = {
      id: `sub-${Math.floor(Math.random() * 100000)}`,
      assignmentId,
      studentId,
      submittedAt: new Date().toISOString(),
      fileUrl
    };
    this.submissions.push(submission);
    return submission;
  }

  public static gradeSubmission(submissionId: string, grade: string, feedback: string): boolean {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (sub) {
      sub.grade = grade;
      sub.feedback = feedback;
      return true;
    }
    return false;
  }

  public static getSubmissions(studentId: string): Submission[] {
    return this.submissions.filter((s) => s.studentId === studentId);
  }
}
