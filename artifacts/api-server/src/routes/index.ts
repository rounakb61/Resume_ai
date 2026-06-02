import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import applicationsRouter from "./applications";
import interviewsRouter from "./interviews";
import analyticsRouter from "./analytics";
import copilotRouter from "./copilot";
import onboardingRouter from "./onboarding";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(candidatesRouter);
router.use(applicationsRouter);
router.use(interviewsRouter);
router.use(analyticsRouter);
router.use(copilotRouter);
router.use(onboardingRouter);

router.post("/recruiter/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, role: "recruiter" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
