import { Response } from "express";
import JobApplication, { type IJobApplication } from "../models/jobApplication";
import { AuthRequest, ApiResponse } from "../config/types";
import { sendEmail, interviewReminderTemplate } from "../config/emailService";
import User from "../models/user";

export const getJobs = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const jobs = await JobApplication.find({ userId: req.user?._id }).sort({
      createdAt: -1,
    });

    const response: ApiResponse<IJobApplication[]> = {
      success: true,
      data: jobs,
      message: "Jobs fetched successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createJob = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      company,
      role,
      status,
      appliedDate,
      notes,
      jobUrl,
      salary,
      interviewDate,
    } = req.body;

    const job: IJobApplication = await JobApplication.create({
      company,
      role,
      status,
      appliedDate,
      notes,
      jobUrl,
      salary,
      interviewDate: interviewDate || undefined,
      userId: req.user?._id,
    });

    const response: ApiResponse<IJobApplication> = {
      success: true,
      data: job,
      message: "Job added successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateJob = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
   
    const {
      company,
      role,
      status,
      appliedDate,
      notes,
      jobUrl,
      salary,
      interviewDate,
    } = req.body;

    const updateData: Partial<IJobApplication> = {
      company,
      role,
      status,
      appliedDate,
      notes: notes || undefined,
      jobUrl: jobUrl || undefined,
      salary: salary || undefined,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
    };

    if (interviewDate) {
      updateData.reminderSent = false;
    }

    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id },
      { $set: updateData },
      { new: true },
    );


    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const response: ApiResponse<IJobApplication> = {
      success: true,
      data: job,
      message: "Job updated successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteJob = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const job: IJobApplication | null = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendInterviewReminder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const job = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

  

    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    if (job.status !== "Interview") {
      res.status(400).json({
        success: false,
        message: "Job must be in Interview status to send reminder",
      });
      return;
    }

    if (!job.interviewDate) {
      res.status(400).json({
        success: false,
        message:
          "No interview date set — please edit the job and add an interview date first",
      });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const html = interviewReminderTemplate(
      job.company,
      job.role,
      job.interviewDate,
    );

    await sendEmail({
      to: user.email,
      subject: `🎯 Interview Reminder — ${job.company} for ${job.role}`,
      html,
    });

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${user.email}`,
    });
  } catch (error) {
    console.error("Send reminder error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send reminder" });
  }
};
