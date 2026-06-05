import { Router, type IRouter } from "express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "matchpoint-super-secret-key-123";

function formatUser(row: any) {
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

router.post("/auth/register", async (req: any, res: any): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password, // In a real app, hash this with bcrypt!
      role,
    }).returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = formatUser(user);
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/auth/login", async (req: any, res: any): Promise<void> => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || user.password !== password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = formatUser(user);
    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/auth/me", async (req: any, res: any): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = formatUser(user);
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
