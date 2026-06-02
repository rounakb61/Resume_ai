import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().notNull(),
  experience: text("experience").notNull(),
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull(),
  status: text("status", { enum: ["open", "closed", "paused"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password"),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  skills: jsonb("skills").$type<string[]>().notNull(),
  experience: integer("experience").notNull(),
  education: text("education"),
  university: text("university"),
  resumeScore: integer("resume_score").notNull(),
  interviewScore: integer("interview_score").notNull(),
  finalScore: integer("final_score").notNull(),
  recommendation: text("recommendation"),
  status: text("status", { enum: ["active", "rejected", "hired", "withdrawn"] }).notNull(),
  summary: text("summary"),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  jobId: integer("job_id").notNull(),
  status: text("status", { enum: ["applied", "shortlisted", "interviewed", "offered", "hired", "rejected"] }).notNull(),
  matchScore: integer("match_score"),
  resumeScore: integer("resume_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const interviewsTable = pgTable("interviews", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  jobId: integer("job_id").notNull(),
  status: text("status", { enum: ["scheduled", "completed", "cancelled"] }).notNull(),
  scheduledAt: timestamp("scheduled_at"),
  transcript: text("transcript"),
  technicalScore: integer("technical_score"),
  communicationScore: integer("communication_score"),
  relevanceScore: integer("relevance_score"),
  confidenceScore: integer("confidence_score"),
  problemSolvingScore: integer("problem_solving_score"),
  overallScore: integer("overall_score"),
  aiNotes: text("ai_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const onboardingTable = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  jobId: integer("job_id").notNull(),
  status: text("status", { enum: ["pending", "in-progress", "completed"] }).notNull(),
  offerAccepted: boolean("offer_accepted").notNull().default(false),
  documentsUploaded: boolean("documents_uploaded").notNull().default(false),
  verificationComplete: boolean("verification_complete").notNull().default(false),
  trainingAssigned: boolean("training_assigned").notNull().default(false),
  joiningDate: timestamp("joining_date"),
  salary: integer("salary"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
