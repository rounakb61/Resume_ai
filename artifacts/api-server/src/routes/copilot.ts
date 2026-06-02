import { Router, type IRouter } from "express";
import { db, candidatesTable, applicationsTable } from "@workspace/db";
import { CopilotChatBody } from "@workspace/api-zod";
import { isNotNull, isNotNull as isNotNullFn } from "drizzle-orm"; // We can filter in memory or via db

const router: IRouter = Router();

router.post("/copilot/chat", async (req, res): Promise<void> => {
  const parsed = CopilotChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { message } = parsed.data;
  const lower = message.toLowerCase();

  let response = "";
  let suggestions: string[] = [];

  if (lower.includes("top") && (lower.includes("candidate") || lower.includes("applicant"))) {
    const allCandidates = await db.select().from(candidatesTable);
    const topCandidates = allCandidates
      .filter((c: any) => c.finalScore !== null && c.finalScore !== undefined)
      .sort((a: any, b: any) => b.finalScore - a.finalScore)
      .slice(0, 5);
      
    if (topCandidates.length > 0) {
      response = `Here are your top-scoring candidates:\n\n${topCandidates.map((c: any, i: any) =>
        `${i + 1}. **${c.name}** — Score: ${c.finalScore?.toFixed(1) ?? "N/A"} | ${c.recommendation ?? "Pending"} | Skills: ${c.skills?.slice(0, 3).join(", ")}`
      ).join("\n")}\n\nWould you like detailed analysis on any of them?`;
      suggestions = ["Show me their full profiles", "Schedule interviews with top 3", "Compare top 2 candidates"];
    } else {
      response = "No scored candidates found yet. Once resumes are analyzed and interviews are completed, I'll be able to rank candidates for you.";
      suggestions = ["How do I add candidates?", "How does scoring work?"];
    }
  } else if (lower.includes("python") || lower.includes("react") || lower.includes("javascript") || lower.includes("java") || lower.includes("node")) {
    const skill = lower.includes("python") ? "Python" : lower.includes("react") ? "React" : lower.includes("javascript") ? "JavaScript" : lower.includes("java") ? "Java" : "Node.js";
    const candidates = await db.select().from(candidatesTable);
    const matched = candidates.filter((c: any) => c.skills?.some((s: any) => typeof s === 'string' && s.toLowerCase().includes(skill.toLowerCase()))).slice(0, 5);
    
    if (matched.length > 0) {
      response = `Found **${matched.length} ${skill} developers** in your talent pool:\n\n${matched.map((c: any) =>
        `• **${c.name}** — ${c.experience ?? 0}yr exp | Score: ${c.finalScore?.toFixed(1) ?? "Not scored"} | ${c.location ?? "Remote"}`
      ).join("\n")}`;
      suggestions = [`Schedule interviews with ${skill} devs`, "Filter by experience level", "See full profiles"];
    } else {
      response = `No ${skill} candidates found in your current database. Consider posting a job opening to attract ${skill} talent.`;
      suggestions = [`Create a ${skill} job posting`, "See all available candidates"];
    }
  } else if ((lower.includes("reject") || lower.includes("why")) && lower.includes("reject")) {
    response = "Candidates are rejected when their Final Score falls below 65. The final score is calculated as:\n\n**Final Score = 40% × Resume Score + 60% × Interview Score**\n\nCommon rejection reasons:\n• Low skill match with job requirements\n• Insufficient experience\n• Poor interview performance on technical questions\n• Below-average communication score\n\nI can help you review any specific candidate's breakdown.";
    suggestions = ["Show rejected candidates", "Review interview scores", "Update rejection criteria"];
  } else if (lower.includes("interview question") || lower.includes("recommend question")) {
    response = "Here are recommended interview questions based on your active positions:\n\n**Technical Round:**\n• Describe your experience with system design for scale\n• Walk me through a challenging bug you debugged and how you solved it\n• How do you approach code review?\n\n**Behavioral Round:**\n• Tell me about a time you disagreed with a team decision\n• How do you prioritize under competing deadlines?\n• Describe your ideal engineering culture\n\n**Culture Fit:**\n• What type of problems do you find most energizing?\n• How do you stay current with industry trends?";
    suggestions = ["Questions for senior roles", "Questions for junior devs", "Culture-fit questions"];
  } else if (lower.includes("compar") && lower.includes("candidate")) {
    const allCandidates = await db.select().from(candidatesTable);
    const topTwo = allCandidates
      .filter((c: any) => c.finalScore !== null && c.finalScore !== undefined)
      .sort((a: any, b: any) => b.finalScore - a.finalScore)
      .slice(0, 2);
      
    if (topTwo.length >= 2) {
      const [a, b] = topTwo;
      response = `**Comparison: ${a.name} vs ${b.name}**\n\n| Metric | ${a.name} | ${b.name} |\n|--------|-------|-------|\n| Final Score | ${a.finalScore?.toFixed(1)} | ${b.finalScore?.toFixed(1)} |\n| Resume Score | ${a.resumeScore?.toFixed(1) ?? "N/A"} | ${b.resumeScore?.toFixed(1) ?? "N/A"} |\n| Interview | ${a.interviewScore?.toFixed(1) ?? "N/A"} | ${b.interviewScore?.toFixed(1) ?? "N/A"} |\n| Experience | ${a.experience ?? 0}yr | ${b.experience ?? 0}yr |\n| Recommendation | ${a.recommendation ?? "TBD"} | ${b.recommendation ?? "TBD"} |\n\n**Verdict:** ${a.finalScore! > b.finalScore! ? `**${a.name}** scores higher overall` : `**${b.name}** scores higher overall`}.`;
    } else {
      response = "I need at least two scored candidates to make a comparison. Once more interviews are completed, I'll be able to give you a side-by-side analysis.";
    }
    suggestions = ["See full candidate profiles", "Schedule interviews", "Export comparison report"];
  } else if (lower.includes("hire") || lower.includes("offer")) {
    const allCandidates = await db.select().from(candidatesTable);
    const hireReady = allCandidates
      .filter((c: any) => c.recommendation === 'Strong Hire' || c.recommendation === 'Hire')
      .slice(0, 5);
      
    response = `Found **${hireReady.length} hire-ready candidates** with Strong Hire or Hire recommendation:\n\n${hireReady.map((c: any) =>
      `• **${c.name}** — ${c.recommendation} | Score: ${c.finalScore?.toFixed(1)} | ${c.skills?.slice(0, 2).join(", ")}`
    ).join("\n") || "No candidates ready yet."}\n\nShall I generate offer letters for any of these?`;
    suggestions = ["Generate offer letters", "See their full profiles", "Schedule final rounds"];
  } else if (lower.includes("analytics") || lower.includes("metric") || lower.includes("stat")) {
    const apps = await db.select().from(applicationsTable);
    const total = apps.length;
    const hired = apps.filter((a: any) => a.status === "hired").length;
    response = `**Platform Analytics Summary:**\n\n• **Total Applications:** ${total}\n• **Hired:** ${hired}\n• **Hiring Rate:** ${total ? Math.round((hired / total) * 100) : 0}%\n• **Avg Time to Hire:** 18.5 days\n\nThe analytics dashboard has full charts including hiring funnel, applications over time, and skill distribution.`;
    suggestions = ["Open full analytics", "Hiring funnel details", "Skill distribution"];
  } else {
    response = `I'm your AI recruitment copilot. Here's how I can help:\n\n• **Find candidates** — "Show me top Python developers"\n• **Compare applicants** — "Compare top candidates for job #3"\n• **Interview prep** — "Recommend interview questions"\n• **Hiring decisions** — "Who is ready for an offer?"\n• **Analytics** — "What are my key hiring metrics?"\n\nWhat would you like to know?`;
    suggestions = ["Show top candidates", "Find React developers", "Compare top applicants", "Recommend interview questions"];
  }

  res.json({ response, suggestions });
});

export default router;
