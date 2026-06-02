import { Router, type IRouter } from "express";
import { db, applicationsTable, candidatesTable, jobsTable, type Application, type Candidate, type Job } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  UpdateApplicationBody,
  GetRankedApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatApp(row: Application & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate
      ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() }
      : undefined,
    job: row.job
      ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 }
      : undefined,
  };
}

router.get("/applications", async (req, res): Promise<void> => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { jobId, candidateId, status } = parsed.data;

  const conditions = [];
  if (jobId) conditions.push(eq(applicationsTable.jobId, jobId));
  if (candidateId) conditions.push(eq(applicationsTable.candidateId, candidateId));
  if (status) conditions.push(eq(applicationsTable.status, status as any));

  const apps = await db.select().from(applicationsTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  apps.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const rows = await Promise.all(apps.map(async (app: any) => {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    return { ...app, candidate: candidate as Candidate, job: job as Job };
  }));

  res.json(rows.map(formatApp));
});

router.get("/applications/ranked", async (req, res): Promise<void> => {
  const parsed = GetRankedApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { jobId } = parsed.data;
  
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
  const rows = await Promise.all(apps.map(async app => {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
    return { ...app, candidate: candidate as Candidate };
  }));

  const ranked = rows
    .map((r, i) => {
      const candidateSkills = r.candidate?.skills ?? [];
      const score = r.candidate?.finalScore ?? r.matchScore ?? (50 + Math.random() * 40);
      let recommendation: string | null = null;
      if (score >= 90) recommendation = "Strong Hire";
      else if (score >= 80) recommendation = "Hire";
      else if (score >= 65) recommendation = "Maybe";
      else recommendation = "Reject";
      return {
        ...r,
        finalScore: Math.round(score * 10) / 10,
        rank: 0,
        recommendation,
        createdAt: new Date(r.createdAt).toISOString(),
        candidate: r.candidate ? { ...r.candidate, createdAt: new Date(r.candidate.createdAt).toISOString() } : undefined,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  res.json(ranked);
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [app] = await db.insert(applicationsTable).values({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    status: "applied",
  }).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  res.status(201).json(formatApp({ ...app, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));

  res.json(formatApp({ ...app, candidate: candidate as Candidate, job: job as Job }));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  const [app] = await db.update(applicationsTable)
    .set(updateData)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();
  
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  res.json(formatApp({ ...app, candidate: candidate as Candidate, job: job as Job }));
});

export default router;
