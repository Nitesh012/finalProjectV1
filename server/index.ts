import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { health } from "./routes/health";
import { signup, login, resetPassword } from "./routes/auth";
import { sendOTP, verifyOTP, resendOTP } from "./routes/otp";
import {
  listStudents,
  createStudent,
  getStudent,
  removeStudent,
  studentsMiddleware,
  getMyStudent,
  linkStudentUser,
  unlinkStudentUser,
} from "./routes/students";
import {
  addAssessment,
  listAssessments,
  assessmentsMiddleware,
} from "./routes/assessments";
import {
  assignRemedial,
  listRemedial,
  updateProgress,
  remedialMiddleware,
} from "./routes/remedial";
import {
  listResources,
  createResource,
  resourcesMiddleware,
} from "./routes/resources";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", health);

  // Demo
  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.post("/api/auth/reset-password", resetPassword);

  // OTP
  app.post("/api/otp/send", sendOTP);
  app.post("/api/otp/verify", verifyOTP);
  app.post("/api/otp/resend", resendOTP);

  // Students
  app.get("/api/students", studentsMiddleware, listStudents);
  app.post("/api/students", studentsMiddleware, createStudent);
  app.get("/api/students/me", studentsMiddleware, getMyStudent);
  app.get("/api/students/:id", studentsMiddleware, getStudent);
  app.post("/api/students/link", studentsMiddleware, linkStudentUser);
  app.post("/api/students/unlink", studentsMiddleware, unlinkStudentUser);
  app.delete("/api/students/:id", studentsMiddleware, removeStudent);

  // Assessments
  app.get("/api/assessments", assessmentsMiddleware, listAssessments);
  app.post("/api/assessments", assessmentsMiddleware, addAssessment);

  // Remedial
  app.get("/api/remedial", remedialMiddleware, listRemedial);
  app.post("/api/remedial", remedialMiddleware, assignRemedial);
  app.patch("/api/remedial/:id", remedialMiddleware, updateProgress);

  // Resources
  app.get("/api/resources", resourcesMiddleware, listResources);
  app.post("/api/resources", resourcesMiddleware, createResource);

  return app;
}
