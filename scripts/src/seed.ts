import { db, jobsTable, candidatesTable, applicationsTable, interviewsTable, onboardingTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database to PostgreSQL...");
  
  const now = new Date();

  // Clear existing data to avoid conflicts during multiple runs
  await db.delete(onboardingTable);
  await db.delete(interviewsTable);
  await db.delete(applicationsTable);
  await db.delete(candidatesTable);
  await db.delete(jobsTable);

  console.log("Cleared existing tables.");

  // Jobs
  const jobs = await db.insert(jobsTable).values([
    {
      id: Math.floor(Math.random() * 1000000),
      title: "Senior Full Stack Engineer",
      description: "We're looking for a Senior Full Stack Engineer to build scalable web applications. You will work closely with product and design teams to ship high-quality features.",
      requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      experience: "4+ years",
      salaryMin: 130000,
      salaryMax: 170000,
      location: "San Francisco, CA",
      employmentType: "full-time",
      status: "open",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      title: "ML Engineer",
      description: "Join our AI team to build and deploy machine learning models at scale. You'll work on recommendation systems, NLP pipelines, and model serving infrastructure.",
      requiredSkills: ["Python", "PyTorch", "Machine Learning", "Docker", "Kubernetes"],
      experience: "3+ years",
      salaryMin: 140000,
      salaryMax: 190000,
      location: "Remote",
      employmentType: "full-time",
      status: "open",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      title: "Product Designer",
      description: "We need a talented Product Designer to craft intuitive and beautiful user experiences. You'll own the design process from research to final pixel-perfect specs.",
      requiredSkills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      experience: "3+ years",
      salaryMin: 110000,
      salaryMax: 145000,
      location: "New York, NY",
      employmentType: "full-time",
      status: "open",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      title: "DevOps Engineer",
      description: "Own our cloud infrastructure and CI/CD pipelines. Work with Kubernetes, Terraform, and AWS to keep our platform reliable and scalable.",
      requiredSkills: ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD"],
      experience: "3+ years",
      salaryMin: 120000,
      salaryMax: 160000,
      location: "Austin, TX",
      employmentType: "full-time",
      status: "open",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      title: "Data Analyst",
      description: "Turn data into actionable business insights. Build dashboards, run A/B tests, and partner with cross-functional teams to drive decisions.",
      requiredSkills: ["SQL", "Python", "Tableau", "A/B Testing", "Statistics"],
      experience: "2+ years",
      salaryMin: 85000,
      salaryMax: 110000,
      location: "Chicago, IL",
      employmentType: "full-time",
      status: "open",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      title: "iOS Engineer",
      description: "Build native iOS experiences used by millions of people. We value clean code, great UX, and shipping fast.",
      requiredSkills: ["Swift", "SwiftUI", "Xcode", "REST APIs", "Git"],
      experience: "3+ years",
      salaryMin: 125000,
      salaryMax: 160000,
      location: "Seattle, WA",
      employmentType: "full-time",
      status: "paused",
      createdAt: now,
      updatedAt: now
    },
  ]).returning();

  console.log(`Created ${jobs.length} jobs`);

  // Candidates
  const candidates = await db.insert(candidatesTable).values([
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+1-415-555-0101",
      location: "San Francisco, CA",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "GraphQL", "Redis"],
      experience: 6,
      education: "Master of Science in Computer Science",
      university: "Stanford University",
      resumeScore: 92,
      interviewScore: 88,
      finalScore: 90,
      recommendation: "Strong Hire",
      status: "active",
      summary: "Sarah is an exceptional full-stack engineer with 6 years of experience building production systems at scale. She has led engineering teams at two Y Combinator startups and contributed to open-source projects with thousands of GitHub stars.",
      source: "LinkedIn",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Marcus Johnson",
      email: "marcus.johnson@example.com",
      phone: "+1-212-555-0182",
      location: "New York, NY",
      skills: ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Docker", "Kubernetes", "NLP"],
      experience: 5,
      education: "PhD in Computer Science",
      university: "MIT",
      resumeScore: 96,
      interviewScore: 91,
      finalScore: 94,
      recommendation: "Strong Hire",
      status: "active",
      summary: "Marcus is a top-tier ML engineer with a PhD from MIT and 5 years of industry experience. He has published research on large language models and has experience deploying ML systems serving 100M+ requests per day.",
      source: "Referral",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+1-650-555-0134",
      location: "San Jose, CA",
      skills: ["React", "TypeScript", "Vue.js", "Node.js", "MySQL", "Redis"],
      experience: 4,
      education: "Bachelor of Engineering in Software Engineering",
      university: "UC Berkeley",
      resumeScore: 84,
      interviewScore: 79,
      finalScore: 82,
      recommendation: "Hire",
      status: "active",
      summary: "Priya is a solid full-stack engineer with 4 years of experience. She has a strong foundation in frontend development and has contributed to products serving 5M+ users.",
      source: "Job Board",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "James O'Brien",
      email: "james.obrien@example.com",
      phone: "+1-512-555-0196",
      location: "Austin, TX",
      skills: ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD", "Ansible", "Python"],
      experience: 7,
      education: "Bachelor of Science in Information Technology",
      university: "University of Texas",
      resumeScore: 88,
      interviewScore: 85,
      finalScore: 87,
      recommendation: "Hire",
      status: "active",
      summary: "James is an experienced DevOps engineer with 7 years of infrastructure experience. He has managed cloud infrastructure at 3 unicorn startups and reduced deployment time by 70% at his last role.",
      source: "Direct",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Aisha Williams",
      email: "aisha.williams@example.com",
      phone: "+1-312-555-0143",
      location: "Chicago, IL",
      skills: ["SQL", "Python", "Tableau", "A/B Testing", "Statistics", "R", "Spark"],
      experience: 3,
      education: "Master of Science in Statistics",
      university: "University of Chicago",
      resumeScore: 81,
      interviewScore: 76,
      finalScore: 79,
      recommendation: "Hire",
      status: "active",
      summary: "Aisha is a skilled data analyst with a statistics background. She has run hundreds of A/B tests and built dashboards that inform product decisions for teams of 50+ people.",
      source: "LinkedIn",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "David Kim",
      email: "david.kim@example.com",
      phone: "+1-206-555-0167",
      location: "Seattle, WA",
      skills: ["Swift", "SwiftUI", "Objective-C", "Xcode", "REST APIs", "Git"],
      experience: 4,
      education: "Bachelor of Science in Computer Science",
      university: "University of Washington",
      resumeScore: 79,
      interviewScore: 72,
      finalScore: 75,
      recommendation: "Maybe",
      status: "active",
      summary: "David is an iOS engineer with 4 years of experience. He has shipped 3 apps to the App Store and has solid SwiftUI skills, though his architecture experience is still developing.",
      source: "Job Board",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Fatima Al-Hassan",
      email: "fatima.alhassan@example.com",
      phone: null,
      location: "Remote",
      skills: ["Python", "Machine Learning", "Scikit-learn", "SQL", "Statistics"],
      experience: 2,
      education: "Bachelor of Science in Mathematics",
      university: "Cairo University",
      resumeScore: 71,
      interviewScore: 65,
      finalScore: 68,
      recommendation: "Maybe",
      status: "active",
      summary: "Fatima is a junior ML engineer with strong mathematical foundations. She has 2 years of experience and shows promise for growth, though lacks production deployment experience.",
      source: "LinkedIn",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Ryan Thompson",
      email: "ryan.thompson@example.com",
      phone: null,
      location: "Denver, CO",
      skills: ["JavaScript", "React", "CSS", "HTML"],
      experience: 1,
      education: "Coding Bootcamp Certificate",
      university: null,
      resumeScore: 52,
      interviewScore: 48,
      finalScore: 51,
      recommendation: "Reject",
      status: "rejected",
      summary: "Ryan is a bootcamp graduate with 1 year of experience. His skills don't yet align with our senior engineering requirements, but shows enthusiasm.",
      source: "Job Board",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Mei Lin",
      email: "mei.lin@example.com",
      phone: "+1-408-555-0188",
      location: "Palo Alto, CA",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Adobe XD", "Sketch", "UX Writing"],
      experience: 5,
      education: "Bachelor of Fine Arts in Design",
      university: "RISD",
      resumeScore: 89,
      interviewScore: 86,
      finalScore: 88,
      recommendation: "Hire",
      status: "active",
      summary: "Mei is an outstanding product designer with 5 years of experience. She has built design systems used by 20+ designers and has shipped products loved by millions of users.",
      source: "Referral",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      name: "Carlos Rivera",
      email: "carlos.rivera@example.com",
      phone: null,
      location: "Miami, FL",
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
      experience: 3,
      education: "Bachelor of Computer Engineering",
      university: "University of Miami",
      resumeScore: 77,
      interviewScore: 73,
      finalScore: 75,
      recommendation: "Maybe",
      status: "active",
      summary: "Carlos is a mid-level full-stack engineer with 3 years of experience. Good foundational skills but needs more experience with distributed systems.",
      source: "LinkedIn",
      createdAt: now,
      updatedAt: now
    },
  ]).returning();

  console.log(`Created ${candidates.length} candidates`);

  // Applications
  const apps = await db.insert(applicationsTable).values([
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[0].id, jobId: jobs[0].id, status: "shortlisted", matchScore: 94, resumeScore: 92, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[1].id, jobId: jobs[1].id, status: "interviewed", matchScore: 97, resumeScore: 96, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[2].id, jobId: jobs[0].id, status: "applied", matchScore: 82, resumeScore: 84, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[3].id, jobId: jobs[3].id, status: "offered", matchScore: 91, resumeScore: 88, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[4].id, jobId: jobs[4].id, status: "hired", matchScore: 88, resumeScore: 81, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[5].id, jobId: jobs[5].id, status: "shortlisted", matchScore: 79, resumeScore: 79, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[6].id, jobId: jobs[1].id, status: "applied", matchScore: 65, resumeScore: 71, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[7].id, jobId: jobs[0].id, status: "rejected", matchScore: 42, resumeScore: 52, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[8].id, jobId: jobs[2].id, status: "interviewed", matchScore: 93, resumeScore: 89, createdAt: now, updatedAt: now },
    { id: Math.floor(Math.random() * 1000000), candidateId: candidates[9].id, jobId: jobs[0].id, status: "applied", matchScore: 74, resumeScore: 77, createdAt: now, updatedAt: now },
  ]).returning();

  console.log(`Created ${apps.length} applications`);

  // Interviews
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() - 3);

  const interviews = await db.insert(interviewsTable).values([
    {
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidates[1].id,
      jobId: jobs[1].id,
      status: "completed",
      scheduledAt: interviewDate,
      transcript: "Interviewer: Tell me about your experience with PyTorch. Candidate: I've been using PyTorch for 4 years and have built large-scale NLP models. At my last company, I designed a transformer-based model that improved recommendation accuracy by 23%. I also have experience with model quantization and optimizing inference latency for production deployments. Interviewer: How do you approach system design for ML infrastructure? Candidate: I think about it in layers — data ingestion, feature engineering, training, evaluation, and serving. Each stage has different reliability requirements. For high-throughput serving, I use batching and caching strategies to reduce latency. I also ensure there are monitoring systems in place to detect model drift.",
      technicalScore: 92,
      communicationScore: 88,
      relevanceScore: 94,
      confidenceScore: 90,
      problemSolvingScore: 91,
      overallScore: 91,
      aiNotes: "AI Analysis: Candidate demonstrated strong technical knowledge. Communication was clear and articulate. Problem solving ability exceeded expectations.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidates[8].id,
      jobId: jobs[2].id,
      status: "completed",
      scheduledAt: interviewDate,
      transcript: "Interviewer: Walk me through your design process. Candidate: I start every project with research — user interviews, competitive analysis, and stakeholder discovery. Then I move to problem framing and ideation. I use Figma for prototyping and test early with real users before any engineering work begins. My goal is always to find the simplest solution that solves the core user problem. Interviewer: Tell me about a design system you built. Candidate: At my previous company, I led the creation of a design system used by 20 designers and 50 engineers. We built it on top of atomic design principles with semantic tokens. It reduced our design-to-development time by 40%.",
      technicalScore: 87,
      communicationScore: 90,
      relevanceScore: 92,
      confidenceScore: 88,
      problemSolvingScore: 85,
      overallScore: 86,
      aiNotes: "AI Analysis: Candidate demonstrated strong design thinking. Communication was clear and articulate. Problem solving ability exceeded expectations.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidates[0].id,
      jobId: jobs[0].id,
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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
    },
  ]).returning();

  console.log(`Created ${interviews.length} interviews`);

  // Onboarding
  const joining = new Date();
  joining.setDate(joining.getDate() + 30);

  const onboardings = await db.insert(onboardingTable).values([
    {
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidates[4].id,
      jobId: jobs[4].id,
      status: "in-progress",
      offerAccepted: true,
      documentsUploaded: true,
      verificationComplete: false,
      trainingAssigned: false,
      joiningDate: joining,
      salary: 95000,
      notes: "Aisha is excited to join. Background check initiated.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: Math.floor(Math.random() * 1000000),
      candidateId: candidates[3].id,
      jobId: jobs[3].id,
      status: "pending",
      offerAccepted: false,
      documentsUploaded: false,
      verificationComplete: false,
      trainingAssigned: false,
      joiningDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      salary: 140000,
      notes: "Offer letter sent, awaiting response.",
      createdAt: now,
      updatedAt: now
    },
  ]).returning();

  console.log(`Created ${onboardings.length} onboarding records`);
  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
