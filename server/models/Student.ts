import mongoose, { Schema, Types } from "mongoose";

export interface IStudent {
  name: string;
  class: string;
  userId?: Types.ObjectId | null;
  assessments: Types.ObjectId[];
  remedialPlans: Types.ObjectId[];
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    class: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    assessments: [{ type: Schema.Types.ObjectId, ref: "Assessment" }],
    remedialPlans: [{ type: Schema.Types.ObjectId, ref: "RemedialPlan" }],
  },
  { timestamps: true },
);

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
