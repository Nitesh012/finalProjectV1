import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { User } from "../models/User";
import { OTP } from "../models/OTP";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ensureConfig = () => {
  if (!process.env.JWT_SECRET) return "JWT_SECRET not set";
  return null;
};

export const signup: RequestHandler = async (req, res) => {
  const cfgErr = ensureConfig();
  if (cfgErr) return res.status(503).json({ error: cfgErr });
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: string;
  };
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await (User as any).findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const userRole = role === "admin" ? "admin" : role === "student" ? "student" : "teacher";
  const user = await (User as any).create({ name, email, password: hash, role: userRole });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
  return res.json({ token });
};

export const login: RequestHandler = async (req, res) => {
  const cfgErr = ensureConfig();
  if (cfgErr) return res.status(503).json({ error: cfgErr });
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await (User as any).findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!);
  return res.json({ token });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const cfgErr = ensureConfig();
  if (cfgErr) return res.status(503).json({ error: cfgErr });
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { email, otp, password } = req.body as { email: string; otp: string; password: string };
  if (!email || !otp || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    // Verify OTP
    const otpRecord = await (OTP as any).findOne({ email });
    if (!otpRecord) return res.status(404).json({ error: "OTP not found or expired" });

    if (new Date() > otpRecord.expiresAt) {
      await (OTP as any).deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (otpRecord.otp !== otp) return res.status(401).json({ error: "Invalid OTP" });

    if (!otpRecord.verified) return res.status(400).json({ error: "OTP not verified" });

    // Check user exists
    const user = await (User as any).findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update password
    const hash = await bcrypt.hash(password, 10);
    await (User as any).findByIdAndUpdate(user._id, { password: hash });

    // Clean up OTP
    await (OTP as any).deleteOne({ _id: otpRecord._id });

    return res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to reset password" });
  }
};
