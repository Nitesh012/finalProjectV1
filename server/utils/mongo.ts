import mongoose from "mongoose";

let isConnected = false;

export const connectMongo = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return { connected: true };
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Missing MONGO_URI in environment variables");
    return { connected: false };
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ MongoDB connected");
    return { connected: true };
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    return { connected: false };
  }
};
