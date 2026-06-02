import { Router, type IRouter } from "express";
import { db, candidatesTable, jobsTable, type Candidate } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import {
  ListCandidatesQueryParams,
  CreateCandidateBody,
  GetCandidateParams,
  UpdateCandidateParams,
  UpdateCandidateBody,
  GetCandidateResumeAnalysisParams,
  GetCandidateMatchScoreParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatCandidate(c: Candidate) {
  return {
    ...c,
    createdAt: new Date(c.createdAt).toISOString(),
  };
}

router.get("/candidates", async (req, res): Promise<void> => {
  const parsed = ListCandidatesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, status } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(candidatesTable.status, status as any));
  if (search) conditions.push(ilike(candidatesTable.name, `%${search}%`));

  const candidates = await db.select().from(candidatesTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  candidates.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(candidates.map(formatCandidate));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const [c] = await db.insert(candidatesTable).values({
    ...parsed.data,
    skills: parsed.data.skills?.map((sk: any) => String(sk)) ?? [],
    status: "active",
    phone: null,
    location: null,
    experience: 0,
    education: null,
    university: null,
    resumeScore: 0,
    interviewScore: 0,
    finalScore: 0,
    recommendation: null,
    summary: null,
    source: null,
  }).returning();
  
  res.status(201).json(formatCandidate(c as Candidate));
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [c] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!c) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(formatCandidate(c as Candidate));
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  const [c] = await db.update(candidatesTable)
    .set(updateData)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();
    
  if (!c) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(formatCandidate(c as Candidate));
});

// AI Resume Analysis
router.get("/candidates/:id/resume-analysis", async (req, res): Promise<void> => {
  const params = GetCandidateResumeAnalysisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [c] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!c) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const skills = c.skills ?? [];
  const experience = c.experience ?? 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingSkills: string[] = [];

  if (experience >= 5) strengths.push("Extensive professional experience");
  if (experience >= 3) strengths.push("Solid industry background");
  if (skills.length >= 8) strengths.push("Broad technical skill set");
  if (skills.includes("Python") || skills.includes("JavaScript") || skills.includes("TypeScript"))
    strengths.push("Proficiency in in-demand programming languages");
  if (c.education && (c.education.includes("Master") || c.education.includes("PhD")))
    strengths.push("Advanced academic credentials");
  if (c.university) strengths.push("Reputable educational background");
  if (strengths.length < 2) strengths.push("Demonstrated project contributions");

  if (experience < 2) weaknesses.push("Limited professional experience — strong portfolio can compensate");
  if (skills.length < 5) weaknesses.push("Narrower technical skill breadth than typical candidates");
  if (!c.education || c.education.includes("Bachelor")) weaknesses.push("No advanced degree on record");

  const demandedSkills = ["Docker", "Kubernetes", "AWS", "System Design", "GraphQL", "TypeScript", "PostgreSQL"];
  for (const s of demandedSkills) {
    if (!skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())) {
      missingSkills.push(s);
    }
    if (missingSkills.length >= 3) break;
  }

  const scoreNum = c.finalScore ?? (c.resumeScore ?? 70);
  let hiringRecommendation = "Maybe";
  if (scoreNum +
        (c.skills?.some((s: any) => typeof s === 'string' && s.toLowerCase().includes("python")) ? 20 : 0) +
        (c.skills?.some((s: any) => typeof s === 'string' && s.toLowerCase().includes("react")) ? 15 : 0) +
        (c.skills?.some((s: any) => typeof s === 'string' && s.toLowerCase().includes("node")) ? 15 : 0) +
        (c.skills?.some((s: any) => typeof s === 'string' && s.toLowerCase().includes("aws")) ? 10 : 0) >= 90) hiringRecommendation = "Strong Hire";
  else if (scoreNum >= 80) hiringRecommendation = "Hire";
  else if (scoreNum < 65) hiringRecommendation = "Reject";

  res.json({
    candidateId: c.id,
    summary: c.summary ?? `${c.name} is a ${experience}-year experienced professional with skills in ${skills.slice(0, 3).join(", ")}. Their profile shows ${strengths[0]?.toLowerCase() ?? "solid potential"} and they are positioned for ${hiringRecommendation === "Reject" ? "entry-level" : "mid-to-senior"} roles.`,
    strengths: strengths.length > 0 ? strengths : ["Demonstrated professional experience"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Profile completeness could be improved"],
    missingSkills,
    recommendedRoles: skills.includes("React") || skills.includes("Vue")
      ? ["Frontend Engineer", "Full Stack Developer", "UI Engineer"]
      : skills.includes("Python") || skills.includes("Machine Learning")
        ? ["ML Engineer", "Data Scientist", "AI Researcher"]
        : ["Software Engineer", "Backend Developer", "Technical Lead"],
    hiringRecommendation,
  });
});

// Match Score
router.get("/candidates/:id/match-score/:jobId", async (req, res): Promise<void> => {
  const params = GetCandidateMatchScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [c] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.jobId));
  if (!c || !job) {
    res.status(404).json({ error: "Candidate or job not found" });
    return;
  }

  const candidateSkills = (c.skills ?? []).map(s => s.toLowerCase());
  const requiredSkills = (job.requiredSkills ?? []).map(s => s.toLowerCase());
  const skillOverlap = (job.requiredSkills ?? []).filter(s => candidateSkills.includes(s.toLowerCase()));
  const missingSkills = (job.requiredSkills ?? []).filter(s => !candidateSkills.includes(s.toLowerCase()));
  const skillMatchPct = requiredSkills.length > 0 ? (skillOverlap.length / requiredSkills.length) * 100 : 50;

  const jobExpReq = parseInt(job.experience ?? "0") || 0;
  const expScore = Math.min(100, ((c.experience ?? 0) / Math.max(jobExpReq, 1)) * 100);
  const eduScore = c.education ? (c.education.includes("Master") || c.education.includes("PhD") ? 100 : 70) : 50;
  const matchScore = skillMatchPct * 0.60 + expScore * 0.25 + eduScore * 0.15;

  res.json({
    candidateId: c.id,
    jobId: job.id,
    matchScore: Math.round(matchScore * 10) / 10,
    skillOverlap,
    missingSkills,
    matchBreakdown: {
      skillMatch: Math.round(skillMatchPct),
      experienceMatch: Math.round(expScore),
      educationMatch: Math.round(eduScore),
    },
  });
});

export default router;
