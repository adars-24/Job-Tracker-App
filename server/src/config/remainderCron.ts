import cron from "node-cron"
import JobApplication from "../models/jobApplication"
import User from "../models/user"
import { sendEmail, interviewReminderTemplate } from "./emailService"

export const startReminderCron = (): void => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running interview reminder cron job...")

    try {
      const now = new Date()

      
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfter = new Date(tomorrow)
      dayAfter.setDate(dayAfter.getDate() + 1)

     
      const upcomingInterviews = await JobApplication.find({
        status: "Interview",
        interviewDate: {
          $gte: tomorrow,  
          $lt: dayAfter   
        },
        reminderSent: false
      })

      console.log(`Found ${upcomingInterviews.length} upcoming interviews`)

      for (const job of upcomingInterviews) {
        const user = await User.findById(job.userId)
        if (!user || !user.email) continue

        const html = interviewReminderTemplate(
          job.company,
          job.role,
          job.interviewDate as Date
        )

        await sendEmail({
          to: user.email,
          subject: `🎯 Interview Tomorrow — ${job.company} for ${job.role}`,
          html
        })

        await JobApplication.findByIdAndUpdate(job._id, {
          reminderSent: true
        })

        console.log(`Reminder sent for ${job.company} to ${user.email}`)
      }
    } catch (error) {
      console.error("Cron job error:", error)
    }
  })

  console.log("Interview reminder cron job scheduled — runs daily at 8 AM")
}