import mongoose, { Schema, Types } from "mongoose";

export interface IAssessment {
  studentId: Types.ObjectId;
  subject: string;
  score: number;
  date: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Assessment =
  mongoose.models.Assessment || mongoose.model<IAssessment>("Assessment", AssessmentSchema);
