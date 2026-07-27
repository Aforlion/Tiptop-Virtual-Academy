// domains/shared/services/integration-service.ts

export interface IntegrationLog {
  id: string;
  timestamp: string;
  eventType: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  message: string;
  details?: Record<string, any>;
}

export class IntegrationService {
  private static logs: IntegrationLog[] = [
    {
      id: "log-1",
      timestamp: "2026-07-24T10:00:00Z",
      eventType: "student.enrolled",
      status: "SUCCESS",
      message: "Provisioned Google Directory account: alice.smith@tiptopacademy.co.uk"
    },
    {
      id: "log-2",
      timestamp: "2026-07-24T10:01:00Z",
      eventType: "student.enrolled",
      status: "SUCCESS",
      message: "Enrolled in Google Classroom Course: Mathematics - Year 5 - Cohort A"
    }
  ];

  public static getLogs(): IntegrationLog[] {
    return this.logs;
  }

  public static triggerSync(eventType: string, data: Record<string, any>): IntegrationLog {
    const logId = `log-${Math.floor(Math.random() * 100000)}`;
    const newLog: IntegrationLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      eventType,
      status: "PENDING",
      message: `Received outbox event ${eventType}. Beginning Google Workspace sync pipeline.`
    };
    
    this.logs.push(newLog);

    // Simulate async sync steps
    setTimeout(() => {
      newLog.status = "SUCCESS";
      if (eventType === "student.enrolled") {
        newLog.message = `Successfully sync'd student: ${data.studentName}. Directory account provisioned, Google Classroom membership updated.`;
      } else if (eventType === "session.scheduled") {
        newLog.message = `Successfully sync'd session. Google Calendar event created, Meet link generated: ${data.meetUrl}`;
      } else {
        newLog.message = `Completed integration sync for ${eventType}.`;
      }
    }, 1500);

    return newLog;
  }
}
