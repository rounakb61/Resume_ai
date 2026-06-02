import { Router, type IRouter } from "express";
import { db, onboardingTable, candidatesTable, jobsTable, type Onboarding, type Candidate, type Job } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListOnboardingsQueryParams,
  CreateOnboardingBody,
  GetOnboardingParams,
  UpdateOnboardingParams,
  UpdateOnboardingBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatOnboarding(row: Onboarding & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() } : undefined,
    job: row.job ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 } : undefined,
  };
}

router.get("/onboarding", async (req, res): Promise<void> => {
  const parsed = ListOnboardingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { candidateId, status } = parsed.data;

  const conditions = [];
  if (candidateId) conditions.push(eq(onboardingTable.candidateId, candidateId));
  if (status) conditions.push(eq(onboardingTable.status, status as any));

  const onboardings = await db.select().from(onboardingTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  onboardings.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const rows = await Promise.all(onboardings.map(async (o: any) => {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, o.candidateId));
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, o.jobId));
    return { ...o, candidate: candidate as Candidate, job: job as Job };
  }));

  res.json(rows.map(formatOnboarding));
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CreateOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const insertData: any = {
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null,
    salary: parsed.data.salary ?? null,
    notes: parsed.data.notes ?? null,
    status: "pending",
  };
  const [onboarding] = await db.insert(onboardingTable).values(insertData).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));
  res.status(201).json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

router.get("/onboarding/:id", async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const [onboarding] = await db.select().from(onboardingTable).where(eq(onboardingTable.id, params.data.id));
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));

  res.json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate, job: job as Job }));
});

router.patch("/onboarding/:id", async (req, res): Promise<void> => {
  const params = UpdateOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.joiningDate) updateData.joiningDate = new Date(parsed.data.joiningDate);

  const [onboarding] = await db.update(onboardingTable)
    .set(updateData)
    .where(eq(onboardingTable.id, params.data.id))
    .returning();
    
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));
  res.json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

export default router;
