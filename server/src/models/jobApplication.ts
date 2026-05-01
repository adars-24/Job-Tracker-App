import mongoose, { Document, Schema } from "mongoose";

export interface IJobApplication extends Document {
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Rejected" | "Offered";
  appliedDate: Date;
  notes?: string;
  jobUrl?: string;
  salary?: string;
  userId: mongoose.Types.ObjectId;
  interviewDate?: Date;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Rejected", "Offered"],
      default: "Applied",
    },
    appliedDate: { type: Date, required: true },
    notes: { type: String },
    jobUrl: { type: String },
    salary: { type: String },
    interviewDate: { type: Date },
    reminderSent: { type: Boolean, default: false },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IJobApplication>(
  "JobApplication",
  JobApplicationSchema,
);
