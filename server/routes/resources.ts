import { RequestHandler } from "express";
import { connectMongo } from "../db";
import { Resource } from "../models/Resource";
import { requireAuth } from "../middleware/auth";

export const listResources: RequestHandler = async (_req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const items = await (Resource as any).find().sort({ createdAt: -1 });
  res.json(items);
};

export const createResource: RequestHandler = async (req, res) => {
  const db = await connectMongo();
  if (!db.connected) return res.status(503).json({ error: "Database not connected" });
  const { title, description, method, uploadedBy } = req.body as {
    title: string;
    description: string;
    method: string;
    uploadedBy: string;
  };
  if (!title || !description || !method || !uploadedBy)
    return res.status(400).json({ error: "Missing fields" });
  const resource = await (Resource as any).create({ title, description, method, uploadedBy });
  res.status(201).json(resource);
};

export const resourcesMiddleware = [requireAuth];
