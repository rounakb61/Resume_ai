// @ts-nocheck
import { db, jobsTable, candidatesTable, applicationsTable, interviewsTable, onboardingTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const jobTitles = ["Frontend Engineer", "Backend Developer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer", "QA Engineer", "Security Analyst", "System Administrator", "Cloud Architect", "Machine Learning Engineer", "Sales Executive", "Marketing Specialist", "Customer Success Manager", "HR Generalist", "Financial Analyst", "Operations Manager", "Technical Writer", "Graphic Designer", "Legal Counsel"];
const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Chicago, IL", "Remote", "London, UK", "Berlin, DE", "Toronto, CA", "Sydney, AU"];
const skillPool = ["React", "TypeScript", "Node.js", "Python", "Java", "C++", "AWS", "Docker", "Kubernetes", "SQL", "NoSQL", "Figma", "Salesforce", "SEO", "Agile", "Scrum", "Git", "CI/CD", "Machine Learning", "GraphQL"];
const names = ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis", "Chris Brown", "Jessica Wilson", "Matthew Martinez", "Ashley Taylor", "Joshua Anderson", "Amanda Thomas", "Kevin Jackson", "Sarah White", "Brian Harris", "Laura Martin", "Jason Thompson", "Stephanie Garcia", "Justin Martinez", "Rebecca Robinson", "Scott Clark", "Melissa Rodriguez", "Eric Lewis", "Michelle Lee", "Stephen Walker", "Kimberly Hall", "Andrew Allen", "Elizabeth Young", "Thomas Hernandez", "Megan King", "Christopher Wright", "Samantha Lopez", "Daniel Hill", "Jessica Scott", "Paul Green", "Lauren Adams", "Mark Baker", "Nicole Gonzalez", "Donald Nelson", "Rachel Carter", "George Mitchell", "Amber Perez", "Kenneth Roberts", "Danielle Turner", "Steven Phillips", "Heather Campbell", "Edward Parker", "Tiffany Evans", "Brian Edwards", "Brittany Collins", "Ronald Stewart", "Christina Sanchez"];

const randStr = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randSkills = () => Array.from({ length: randInt(3, 7) }, () => randStr(skillPool)).filter((v, i, a) => a.indexOf(v) === i);

async function seed() {
  console.log("Adding additional synthetic data...");
  const now = new Date();

  // Generate 20 Jobs
  const newJobs = [];
  for (let i = 0; i < 20; i++) {
    newJobs.push({
      id: Math.floor(Math.random() * 1000000),
      title: randStr(jobTitles),
      description: "This is an exciting opportunity to join a fast-growing company. We are looking for highly motivated individuals who are passionate about their work.",
      requiredSkills: randSkills(),
      experience: `${randInt(1, 10)}+ years`,
      salaryMin: randInt(60, 100) * 1000,
      salaryMax: randInt(110, 180) * 1000,
      location: randStr(locations),
      employmentType: Math.random() > 0.8 ? "contract" : "full-time",
      status: Math.random() > 0.8 ? (Math.random() > 0.5 ? "closed" : "paused") : "open",
      createdAt: new Date(now.getTime() - randInt(1, 30) * 24 * 60 * 60 * 1000),
      updatedAt: now
    });
  }
  const insertedJobs = await db.insert(jobsTable).values(newJobs).returning();
  console.log(`Added ${insertedJobs.length} jobs`);

  // Generate 50 Candidates
  const newCandidates: any[] = [];
  for (let i = 0; i < 50; i++) {
    const score = randInt(50, 100);
    const recommendation = score >= 90 ? "Strong Hire" : (score >= 75 ? "Hire" : (score >= 60 ? "Maybe" : "Reject"));

    // Status must be logically consistent with recommendation
    let status: string;
    if (recommendation === "Reject") {
      status = "rejected";
    } else if (recommendation === "Strong Hire" || recommendation === "Hire") {
      // Strong hires/hires: most are active (in pipeline), some get hired
      status = Math.random() > 0.7 ? "hired" : "active";
    } else {
      // "Maybe" candidates stay active — they haven't been decided on yet
      status = "active";
    }

    // Interview score: null if not yet interviewed (low-score rejects), otherwise proportional
    const hasBeenInterviewed = recommendation !== "Reject" || Math.random() > 0.5;
    const interviewScore = hasBeenInterviewed ? Math.max(40, score - randInt(-5, 10)) : null;

    newCandidates.push({
      id: Math.floor(Math.random() * 1000000),
      name: names[i],
      email: `${names[i].toLowerCase().replace(" ", ".")}@example.com`,
      phone: `+1-555-${randInt(1000, 9999)}`,
      location: randStr(locations),
      skills: randSkills(),
      experience: randInt(1, 12),
      education: Math.random() > 0.5 ? "Bachelor's Degree" : "Master's Degree",
      university: "State University",
      resumeScore: score,
      interviewScore: interviewScore ?? 0,
      finalScore: score,
      recommendation,
      status,
      summary: "A dedicated professional with a strong track record of success in dynamic environments.",
      source: randStr(["LinkedIn", "Job Board", "Referral", "Direct Application"]),
      createdAt: new Date(now.getTime() - randInt(1, 60) * 24 * 60 * 60 * 1000),
      updatedAt: now
    });
  }
  const insertedCandidates = await db.insert(candidatesTable).values(newCandidates as any).returning();
  console.log(`Added ${insertedCandidates.length} candidates`);

  // Generate 100 Applications
  // Application status must align with the candidate's recommendation/status
  const newApps: any[] = [];
  for (let i = 0; i < 100; i++) {
    const candidate = randStr(insertedCandidates);
    let appStatus: string;

    if (candidate.status === "rejected") {
      // Rejected candidates: application is rejected or early-stage
      appStatus = Math.random() > 0.3 ? "rejected" : "applied";
    } else if (candidate.status === "hired") {
      // Hired candidates: application progressed through the full funnel
      appStatus = randStr(["hired", "offered"]);
    } else {
      // Active candidates: in various stages of the pipeline
      const rec = candidate.recommendation;
      if (rec === "Strong Hire" || rec === "Hire") {
        appStatus = randStr(["shortlisted", "interviewed", "offered"]);
      } else {
        // "Maybe" — still early in the process
        appStatus = randStr(["applied", "shortlisted", "interviewed"]);
      }
    }

    newApps.push({
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidate.id,
      jobId: randStr(insertedJobs).id,
      status: appStatus,
      matchScore: randInt(40, 99),
      resumeScore: randInt(50, 95),
      createdAt: new Date(now.getTime() - randInt(1, 30) * 24 * 60 * 60 * 1000),
      updatedAt: now
    });
  }
  const insertedApps = await db.insert(applicationsTable).values(newApps as any).returning();
  console.log(`Added ${insertedApps.length} applications`);

  // Generate 40 Interviews
  const interviewStatuses = ["scheduled", "completed", "cancelled"];
  const newInterviews: any[] = [];
  for (let i = 0; i < 40; i++) {
    const isCompleted = Math.random() > 0.5;
    newInterviews.push({
      id: Math.floor(Math.random() * 1000000),
      candidateId: randStr(insertedCandidates).id,
      jobId: randStr(insertedJobs).id,
      status: isCompleted ? "completed" : "scheduled",
      scheduledAt: new Date(now.getTime() + (isCompleted ? -1 : 1) * randInt(1, 5) * 24 * 60 * 60 * 1000),
      transcript: isCompleted ? "Interviewer: Tell me about your background. Candidate: I have a solid background in this field..." : null,
      technicalScore: isCompleted ? randInt(60, 95) : null,
      communicationScore: isCompleted ? randInt(70, 95) : null,
      relevanceScore: isCompleted ? randInt(60, 95) : null,
      confidenceScore: isCompleted ? randInt(65, 95) : null,
      problemSolvingScore: isCompleted ? randInt(60, 95) : null,
      overallScore: isCompleted ? randInt(65, 95) : null,
      aiNotes: isCompleted ? "AI Analysis: Candidate performed well during the interview process." : null,
      createdAt: now,
      updatedAt: now
    });
  }
  const insertedInterviews = await db.insert(interviewsTable).values(newInterviews as any).returning();
  console.log(`Added ${insertedInterviews.length} interviews`);

  // Generate Onboarding records — ONLY for candidates who were actually hired
  const hiredCandidates = insertedCandidates.filter(c => (c as any).status === "hired");
  const newOnboardings = [];
  for (const candidate of hiredCandidates) {
    newOnboardings.push({
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidate.id,
      jobId: randStr(insertedJobs).id,
      status: randStr(["pending", "in-progress", "completed"]),
      offerAccepted: true,
      documentsUploaded: Math.random() > 0.3,
      verificationComplete: Math.random() > 0.5,
      trainingAssigned: Math.random() > 0.6,
      joiningDate: new Date(now.getTime() + randInt(10, 45) * 24 * 60 * 60 * 1000),
      salary: randInt(80, 160) * 1000,
      notes: "Onboarding process has been initiated for this candidate.",
      createdAt: now,
      updatedAt: now
    });
  }
  const insertedOnboardings = await db.insert(onboardingTable).values(newOnboardings).returning();
  console.log(`Added ${insertedOnboardings.length} onboarding records (only for hired candidates)`);

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
