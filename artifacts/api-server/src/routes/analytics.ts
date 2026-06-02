import { Router, type IRouter } from "express";
import { db, applicationsTable, candidatesTable, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const allApps = await db.select().from(applicationsTable);
  const total = allApps.length;

  const shortlistedCount = allApps.filter((a: any) => a.status === "shortlisted").length;
  const interviewedCount = allApps.filter((a: any) => a.status === "interviewed").length;
  const hired = allApps.filter((a: any) => a.status === "hired").length;
  const rejectedCount = allApps.filter((a: any) => a.status === "rejected").length;
  
  const allJobs = await db.select().from(jobsTable).where(eq(jobsTable.status, "open"));
  const activeJobsCount = allJobs.length;

  const hiringSuccessRate = total > 0 ? Math.round((hired / total) * 100 * 10) / 10 : 0;

  res.json({
    totalApplicants: total,
    shortlisted: shortlistedCount,
    interviewed: interviewedCount,
    hired,
    rejected: rejectedCount,
    hiringSuccessRate,
    avgTimeToHire: 18.5,
    activeJobs: activeJobsCount,
  });
});

router.get("/analytics/hiring-funnel", async (req, res): Promise<void> => {
  const allApps = await db.select().from(applicationsTable);
  
  const applied = allApps.length;
  const shortlisted = allApps.filter((a: any) => a.status === "shortlisted").length;
  const interviewed = allApps.filter((a: any) => a.status === "interviewed").length;
  const offered = allApps.filter((a: any) => a.status === "offered").length;
  const hired = allApps.filter((a: any) => a.status === "hired").length;

  res.json([
    { stage: "Applied", count: applied },
    { stage: "Shortlisted", count: shortlisted },
    { stage: "Interviewed", count: interviewed },
    { stage: "Offered", count: offered },
    { stage: "Hired", count: hired },
  ]);
});

router.get("/analytics/applications-over-time", async (_req, res): Promise<void> => {
  const allApps = await db.select().from(applicationsTable);
  
  const grouped = new Map<string, number>();
  for (const app of allApps) {
    const dateStr = new Date(app.createdAt).toISOString().split("T")[0];
    grouped.set(dateStr, (grouped.get(dateStr) ?? 0) + 1);
  }

  // Fill in the last 30 days
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, count: grouped.get(dateStr) ?? 0 });
  }
  res.json(result);
});

router.get("/analytics/skill-distribution", async (_req, res): Promise<void> => {
  const candidates = await db.select().from(candidatesTable);
  const skillMap = new Map<string, number>();
  for (const c of candidates) {
    for (const skill of c.skills ?? []) {
      skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
    }
  }
  const result = Array.from(skillMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  res.json(result);
});

router.get("/analytics/top-candidates", async (req, res): Promise<void> => {
  const limit = parseInt(String(req.query.limit ?? "10"), 10) || 10;
  const candidates = await db.select().from(candidatesTable);
  const sorted = candidates
    .filter((c: any) => c.finalScore !== null && c.finalScore !== undefined)
    .sort((a: any, b: any) => b.finalScore - a.finalScore)
    .slice(0, limit);
    
  res.json(sorted.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt).toISOString() })));
});

export default router;
