import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { Assessment } from "../models/Assessment";
import { Student } from "../models/Student";
import { requireAuth } from "../middleware/auth";

export const addAssessment: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { studentId, subject, score, date } = req.body as {
    studentId: string;
    subject: string;
    score: number;
    date: string;
  };
  if (!studentId || !subject || score == null || !date)
    return res.status(400).json({ error: "Missing fields" });
  const assessment = await (Assessment as any).create({ studentId, subject, score, date: new Date(date) });
  await (Student as any).findByIdAndUpdate(studentId, { $push: { assessments: assessment._id } });
  res.status(201).json(assessment);
};

export const listAssessments: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { studentId } = req.query as { studentId?: string };
  const cond = studentId ? { studentId } : {};
  const items = await (Assessment as any).find(cond).sort({ date: -1 });
  res.json(items);
};

export const assessmentsMiddleware = [requireAuth];
