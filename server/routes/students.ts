import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { Student } from "../models/Student";
import { requireAuth } from "../middleware/auth";

export const listStudents: RequestHandler = async (_req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const students = await (Student as any).find().sort({ createdAt: -1 });
  res.json(students);
};

export const createStudent: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { name, class: klass } = req.body as { name: string; class: string };
  if (!name || !klass) return res.status(400).json({ error: "Missing fields" });
  const student = await (Student as any).create({ name, class: klass });
  res.status(201).json(student);
};

export const getStudent: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const student = await (Student as any).findById(req.params.id).populate([
    "assessments",
    "remedialPlans",
    { path: "userId", select: "email name" },
  ]);
  if (!student) return res.status(404).json({ error: "Not found" });
  res.json(student);
};

export const getMyStudent: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const student = await (Student as any).findOne({ userId: user.id }).populate(["assessments", "remedialPlans"]);
  if (!student) return res.status(404).json({ error: "No student linked to this account" });
  res.json(student);
};

export const linkStudentUser: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { studentId, email, password, name } = req.body as { studentId: string; email: string; password?: string; name?: string };
  if (!studentId || !email) return res.status(400).json({ error: "Missing fields" });
  const User = (await import("../models/User")).User as any;
  const existing = await User.findOne({ email });
  let user;
  if (!existing) {
    if (!password) return res.status(400).json({ error: "Password required to create new user" });
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ name: name || email.split("@")[0], email, password: hash, role: "student" });
  } else {
    user = existing;
  }
  await (Student as any).findByIdAndUpdate(studentId, { $set: { userId: user._id } });
  res.json({ ok: true, userId: user._id });
};

export const unlinkStudentUser: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { studentId } = req.body as { studentId: string };
  if (!studentId) return res.status(400).json({ error: "Missing studentId" });
  await (Student as any).findByIdAndUpdate(studentId, { $unset: { userId: 1 } });
  res.json({ ok: true });
};

export const removeStudent: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  await (Student as any).findByIdAndDelete(req.params.id);
  res.status(204).end();
};

export const studentsMiddleware = [requireAuth];
