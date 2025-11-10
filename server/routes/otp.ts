import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { OTP } from "../models/OTP";
import nodemailer from "nodemailer";

// Configure nodemailer transporter
let transporter: nodemailer.Transporter;

// Initialize transporter with credentials or test account
async function initTransporter() {
  if (transporter) return transporter;

  // If SMTP credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Using Ethereal test account for emails:", testAccount.user);
  }

  return transporter;
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOTP: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) {
    const reason = (db as any).reason || "Unknown error";
    console.error("❌ OTP/sendOTP - Database connection failed:", reason);
    return res.status(503).json({ error: "Database not connected", reason });
  }
  console.log("✅ OTP/sendOTP - Database connected successfully");

  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const transporter = await initTransporter();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await (OTP as any).deleteMany({ email });

    // Create new OTP record
    await (OTP as any).create({ email, otp, expiresAt, attempts: 0, verified: false });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to: email,
      subject: "Your OTP for Inclusive Education Platform",
      html: `
        <h2>Welcome to Inclusive Education Platform</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log("OTP sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // 👈 added line

    res.json({ message: "OTP sent successfully", email });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: error.message || "Failed to send OTP" });
  }
};

export const verifyOTP: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { email, otp } = req.body as { email: string; otp: string };
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const otpRecord = await (OTP as any).findOne({ email });

    if (!otpRecord) {
      return res.status(404).json({ error: "OTP not found or expired" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await (OTP as any).deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (otpRecord.attempts >= 5) {
      await (OTP as any).deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ error: "Too many attempts. Please request a new OTP." });
    }

    if (otpRecord.otp !== otp) {
      await (OTP as any).findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      return res.status(401).json({ error: "Invalid OTP" });
    }

    await (OTP as any).findByIdAndUpdate(otpRecord._id, { verified: true });

    res.json({ message: "OTP verified successfully", email });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: error.message || "Failed to verify OTP" });
  }
};

export const resendOTP: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });

  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const transporter = await initTransporter();

    await (OTP as any).deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await (OTP as any).create({ email, otp, expiresAt, attempts: 0, verified: false });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to: email,
      subject: "Your OTP for Inclusive Education Platform",
      html: `
        <h2>Welcome to Inclusive Education Platform</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log("OTP resent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // 👈 added line

    res.json({ message: "OTP resent successfully", email });
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ error: error.message || "Failed to resend OTP" });
  }
};
