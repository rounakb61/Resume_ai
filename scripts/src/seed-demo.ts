// @ts-nocheck
import { db, jobsTable, candidatesTable, applicationsTable, interviewsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Adding demo candidates...");
  const now = new Date();

  try {
    await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS password text`);
    console.log("Added password column to candidates table");
  } catch (e) {
    console.log("Password column might already exist or error: ", e.message);
  }

  // Get some jobs to apply to
  const allJobs = await db.select().from(jobsTable).limit(5);

  if (allJobs.length < 2) {
    console.error("Not enough jobs in DB to apply to.");
    process.exit(1);
  }

  // Create Candidate 1
  const candidate1 = {
    id: 9000001,
    name: "Rounak Banerjee",
    password: "Rounak1",
    email: "rounak@example.com",
    phone: "+1-555-0001",
    location: "San Francisco, CA",
    skills: ["React", "TypeScript", "Node.js"],
    experience: 3,
    education: "Bachelor's Degree",
    university: "State University",
    resumeScore: 85,
    interviewScore: 80,
    finalScore: 82,
    recommendation: "Hire",
    status: "active",
    summary: "Demo candidate with 2 applications.",
    source: "Direct Application",
    createdAt: now,
    updatedAt: now
  };

  // Create Candidate 2
  const candidate2 = {
    id: 9000002,
    name: "Vishal kumar",
    password: "vishal1",
    email: "vishal@example.com",
    phone: "+1-555-0002",
    location: "New York, NY",
    skills: ["Python", "Data Science", "SQL"],
    experience: 2,
    education: "Master's Degree",
    university: "City College",
    resumeScore: 78,
    interviewScore: 75,
    finalScore: 76,
    recommendation: "Maybe",
    status: "active",
    summary: "Demo candidate with 1 application.",
    source: "LinkedIn",
    createdAt: now,
    updatedAt: now
  };

  await db.insert(candidatesTable).values([candidate1, candidate2]).onConflictDoUpdate({
    target: candidatesTable.id,
    set: { name: sql`excluded.name`, password: sql`excluded.password` }
  });

  // Add applications
  await db.insert(applicationsTable).values([
    {
      id: 9000001,
      candidateId: candidate1.id,
      jobId: allJobs[0].id,
      status: "applied",
      matchScore: 88,
      resumeScore: 85,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 9000002,
      candidateId: candidate1.id,
      jobId: allJobs[1].id,
      status: "interviewing",
      matchScore: 92,
      resumeScore: 88,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 9000003,
      candidateId: candidate2.id,
      jobId: allJobs[0].id,
      status: "applied",
      matchScore: 75,
      resumeScore: 78,
      createdAt: now,
      updatedAt: now
    }
  ]).onConflictDoNothing();

  // Add 1 interview for candidate1
  await db.insert(interviewsTable).values([
    {
      id: 9000001,
      candidateId: candidate1.id,
      jobId: allJobs[1].id,
      status: "scheduled",
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      transcript: null,
      technicalScore: null,
      communicationScore: null,
      relevanceScore: null,
      confidenceScore: null,
      problemSolvingScore: null,
      overallScore: null,
      aiNotes: null,
      createdAt: now,
      updatedAt: now
    }
  ]).onConflictDoNothing();

  console.log("✅ Demo candidates seeded!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
