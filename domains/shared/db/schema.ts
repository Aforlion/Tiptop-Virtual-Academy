import { pgTable, uuid, text, date, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["STUDENT", "PARENT", "TEACHER", "EXECUTIVE"]);
export const ageGroupEnum = pgEnum("age_group", ["junior", "senior"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["PRESENT", "ABSENT", "LATE"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["PAID", "UNPAID"]);
export const outboxStatusEnum = pgEnum("outbox_status", ["PENDING", "PROCESSED", "FAILED"]);
export const logStatusEnum = pgEnum("log_status", ["PENDING", "PROCESSING", "SUCCESS", "FAILED"]);

// 1. PROFILES TABLE
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  role: text("role").notNull(), // STUDENT, PARENT, TEACHER, EXECUTIVE
  fullName: text("full_name").notNull(),
  parentId: uuid("parent_id").references((): any => profiles.id, { onDelete: "set null" }),
  birthDate: date("birth_date"),
  ageGroup: text("age_group"), // junior, senior
  cohortId: uuid("cohort_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 2. COHORTS TABLE
export const cohorts = pgTable("cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 3. SESSIONS TABLE
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  meetUrl: text("meet_url"),
  teacherId: uuid("teacher_id").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 4. ATTENDANCE TABLE
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // PRESENT, ABSENT, LATE
  loggedAt: timestamp("logged_at").defaultNow().notNull()
});

// 5. INVOICES TABLE
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => profiles.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").default("UNPAID").notNull(), // PAID, UNPAID
  dueDate: date("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 6. ASSIGNMENTS TABLE
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 7. SUBMISSIONS TABLE
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").references(() => assignments.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => profiles.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  fileUrl: text("file_url").notNull(),
  grade: text("grade"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 8. OUTBOX TABLE
export const outbox = pgTable("outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  payload: text("payload").notNull(), // Store JSON stringified
  status: text("status").default("PENDING").notNull(), // PENDING, PROCESSED, FAILED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at")
});

// 9. INTEGRATION LOGS TABLE
export const integrationLogs = pgTable("integration_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  eventType: text("event_type").notNull(),
  status: text("status").notNull(), // PENDING, PROCESSING, SUCCESS, FAILED
  message: text("message").notNull(),
  details: text("details") // Store JSON stringified
});
