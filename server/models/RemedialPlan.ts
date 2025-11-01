import mongoose, { Schema, Types } from "mongoose";

export interface IRemedialPlan {
  studentId: Types.ObjectId;
  planDetails: string;
  assignedBy: string;
  progress: number; // 0..100
}

const RemedialPlanSchema = new Schema<IRemedialPlan>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    planDetails: { type: String, required: true },
    assignedBy: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

export const RemedialPlan =
  mongoose.models.RemedialPlan || mongoose.model<IRemedialPlan>("RemedialPlan", RemedialPlanSchema);
