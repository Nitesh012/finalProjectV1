import mongoose, { Schema } from "mongoose";

export interface IResource {
  title: string;
  description: string;
  method: string;
  uploadedBy: string;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    method: { type: String, required: true },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Resource =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);
