import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { RemedialPlan } from "../models/RemedialPlan";
import { Student } from "../models/Student";
import { requireAuth } from "../middleware/auth";

export const assignRemedial: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { studentId, planDetails, assignedBy } = req.body as {
    studentId: string;
    planDetails: string;
    assignedBy: string;
  };
  if (!studentId || !planDetails || !assignedBy)
    return res.status(400).json({ error: "Missing fields" });

  const plan = await (RemedialPlan as any).create({ studentId, planDetails, assignedBy, progress: 0 });
  await (Student as any).findByIdAndUpdate(studentId, { $push: { remedialPlans: plan._id } });
  res.status(201).json(plan);
};

export const updateProgress: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { id } = req.params;
  const { progress } = req.body as { progress: number };
  if (progress == null) return res.status(400).json({ error: "Missing progress" });
  const updated = await (RemedialPlan as any).findByIdAndUpdate(id, { progress }, { new: true });
  res.json(updated);
};

export const listRemedial: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { studentId } = req.query as { studentId?: string };
  const cond = studentId ? { studentId } : {};
  const items = await (RemedialPlan as any).find(cond).sort({ createdAt: -1 });
  res.json(items);
};

export const remedialMiddleware = [requireAuth];
