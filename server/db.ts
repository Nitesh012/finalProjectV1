import mongoose from "mongoose";

let isConnecting = false;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return { connected: false, reason: "MONGODB_URI not set" } as const;
  }
  if (mongoose.connection.readyState === 1) return { connected: true } as const;
  if (isConnecting) return { connected: false, reason: "connecting" } as const;
  try {
    isConnecting = true;
    await mongoose.connect(uri);
    isConnecting = false;
    return { connected: true } as const;
  } catch (err) {
    isConnecting = false;
    return { connected: false, reason: (err as Error).message } as const;
  }
}
