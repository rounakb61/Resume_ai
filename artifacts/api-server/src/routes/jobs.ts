import { Router, type IRouter } from "express";
import { db, jobsTable, applicationsTable, type Job } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function formatJob(j: Job) {
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, j.id));
  return {
    ...j,
    applicantCount: apps.length,
    createdAt: new Date(j.createdAt).toISOString(),
  };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, search, location, employmentType } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(jobsTable.status, status as any));
  if (location) conditions.push(ilike(jobsTable.location, `%${location}%`));
  if (employmentType) conditions.push(eq(jobsTable.employmentType, employmentType));
  if (search) conditions.push(ilike(jobsTable.title, `%${search}%`));

  const jobs = await db.select().from(jobsTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  jobs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const formatted = await Promise.all(jobs.map(formatJob));
  res.json(formatted);
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const insertData: any = {
    ...parsed.data,
    requiredSkills: parsed.data.requiredSkills ?? [],
    status: parsed.data.status ?? "open",
    employmentType: parsed.data.employmentType,
    description: parsed.data.description ?? "",
    experience: parsed.data.experience ?? "",
    salaryMin: parsed.data.salaryMin ?? 0,
    salaryMax: parsed.data.salaryMax ?? 0,
    location: parsed.data.location ?? "",
  };
  const [job] = await db.insert(jobsTable).values(insertData).returning();
  
  res.status(201).json(await formatJob(job as Job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(await formatJob(row as Job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  const [job] = await db.update(jobsTable)
    .set(updateData)
    .where(eq(jobsTable.id, params.data.id))
    .returning();
    
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(await formatJob(job as Job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
