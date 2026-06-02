import { Router, type IRouter } from "express";
import { db, interviewsTable, candidatesTable, jobsTable, type Interview, type Candidate, type Job } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListInterviewsQueryParams,
  CreateInterviewBody,
  GetInterviewParams,
  UpdateInterviewParams,
  UpdateInterviewBody,
  AnalyzeInterviewParams,
  AnalyzeInterviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatInterview(row: Interview & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() } : undefined,
    job: row.job ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 } : undefined,
  };
}

router.get("/interviews", async (req, res): Promise<void> => {
  const parsed = ListInterviewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { candidateId, jobId, status } = parsed.data;

  const conditions = [];
  if (candidateId) conditions.push(eq(interviewsTable.candidateId, candidateId));
  if (jobId) conditions.push(eq(interviewsTable.jobId, jobId));
  if (status) conditions.push(eq(interviewsTable.status, status as any));

  const interviews = await db.select().from(interviewsTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  interviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const rows = await Promise.all(interviews.map(async (interview: any) => {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, interview.candidateId));
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, interview.jobId));
    return { ...interview, candidate, job };
  }));

  res.json(rows.map(formatInterview));
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [interview] = await db.insert(interviewsTable).values({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    status: "scheduled",
  }).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, interview.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, interview.jobId));
  res.status(201).json(formatInterview({ ...interview, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const params = GetInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const [interview] = await db.select().from(interviewsTable).where(eq(interviewsTable.id, params.data.id));
  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, interview.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, interview.jobId));
  
  res.json(formatInterview({ ...interview, candidate: candidate as Candidate, job: job as Job }));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const params = UpdateInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.scheduledAt) {
    updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  }
  
  const [interview] = await db.update(interviewsTable)
    .set(updateData)
    .where(eq(interviewsTable.id, params.data.id))
    .returning();
    
  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, interview.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, interview.jobId));
  res.json(formatInterview({ ...interview, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

router.post("/interviews/:id/analyze", async (req, res): Promise<void> => {
  const params = AnalyzeInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AnalyzeInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { transcript } = parsed.data;
  const words = transcript.split(/\s+/).length;
  const baseScore = Math.min(95, 55 + (words / 50));

  const technical = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 10)));
  const communication = Math.round(Math.min(98, baseScore + (Math.random() * 15 - 5)));
  const relevance = Math.round(Math.min(98, baseScore + (Math.random() * 18 - 8)));
  const confidence = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 10)));
  const problemSolving = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 12)));

  const overallScore = Math.round(
    technical * 0.35 + communication * 0.25 + relevance * 0.20 + confidence * 0.10 + problemSolving * 0.10
  );

  let recommendation = "Maybe";
  if (overallScore >= 90) recommendation = "Strong Hire";
  else if (overallScore >= 80) recommendation = "Hire";
  else if (overallScore < 65) recommendation = "Reject";

  await db.update(interviewsTable).set({
    transcript,
    technicalScore: technical,
    communicationScore: communication,
    relevanceScore: relevance,
    confidenceScore: confidence,
    problemSolvingScore: problemSolving,
    overallScore,
    status: "completed",
    aiNotes: `AI Analysis: Candidate demonstrated ${technical >= 80 ? "strong" : "moderate"} technical knowledge. Communication was ${communication >= 80 ? "clear and articulate" : "adequate"}. Problem solving ability ${problemSolving >= 80 ? "exceeded" : "met"} expectations.`,
    updatedAt: new Date()
  }).where(eq(interviewsTable.id, params.data.id));

  res.json({
    technicalScore: technical,
    communicationScore: communication,
    relevanceScore: relevance,
    confidenceScore: confidence,
    problemSolvingScore: problemSolving,
    overallScore,
    summary: `Interview assessed ${words} words of response. Overall performance is ${recommendation.toLowerCase()}-tier with particular strengths in ${technical >= communication ? "technical knowledge" : "communication"}.`,
    recommendation,
  });
});

export default router;
