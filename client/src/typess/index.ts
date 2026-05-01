export interface IJobApplication {
  _id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Rejected" | "Offered";
  appliedDate: string;
  notes?: string;
  jobUrl?: string;
  salary?: string;
  userId: string;
  interviewDate?: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatusType = "Applied" | "Interview" | "Rejected" | "Offered"

export interface JobFormData {
  company: string
  role: string
  status: StatusType
  appliedDate: string
  notes: string
  jobUrl: string
  salary: string
  interviewDate: string  
}

export interface IUser {
  token: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}
