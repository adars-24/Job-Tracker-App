import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { error } = await resend.emails.send({
    from: "Job Tracker <onboarding@resend.dev>",
    to: options.to,
    subject: options.subject,
    html: options.html
  })

  if (error) {
    console.error("Resend error:", error)
    throw new Error(error.message)
  }

  console.log(`Email sent to ${options.to}`)
}

export { interviewReminderTemplate } from "./emailTemplate"