import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface JwtUserClaims {
  id: string;
  role: "admin" | "teacher";
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(503).json({ error: "JWT_SECRET not configured" });

  try {
    const decoded = jwt.verify(token, secret) as JwtUserClaims;
    // @ts-expect-error attach user
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
