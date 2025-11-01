import mongoose, { Schema } from "mongoose";

export interface IOTP {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
