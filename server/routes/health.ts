import { RequestHandler } from "express";
import { connectMongo } from "../db";

export const health: RequestHandler = async (_req, res) => {
  try {
    const db = await connectMongo();
    if (db.connected) {
      console.log("✅ MongoDB Connected successfully!");
      return res.json({
        status: "ok",
        message: "MongoDB Connected",
        mongodb: true,
      });
    } else {
      const reason = (db as any).reason || "Unknown error";
      console.error("❌ MongoDB Connection Failed:", reason);
      return res
        .status(503)
        .json({
          status: "error",
          message: "MongoDB not connected",
          reason,
          mongodb: false,
        });
    }
  } catch (error: any) {
    console.error("❌ Health check failed:", error.message);
    return res
      .status(503)
      .json({ status: "error", message: error.message, mongodb: false });
  }
};
