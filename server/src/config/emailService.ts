import nodemailer, { Transporter } from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}


const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter()

  

  const mailOptions = {
    from: `"Job Tracker" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  }

  await transporter.sendMail(mailOptions)
  console.log(`Email sent to ${options.to}`)
}

export const interviewReminderTemplate = (
  company: string,
  role: string,
  interviewDate: Date
): string => {
  const formattedDate = interviewDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const formattedTime = interviewDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0f0f13;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background: #1e1e2e;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #2a2a3e;
        }
        .header {
          background: linear-gradient(135deg, #7c6af7, #6c5ce7);
          padding: 32px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }
        .header p {
          color: rgba(255,255,255,0.8);
          margin: 8px 0 0;
          font-size: 14px;
        }
        .body {
          padding: 32px;
        }
        .company-badge {
          background: rgba(124, 106, 247, 0.15);
          border: 1px solid rgba(124, 106, 247, 0.3);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
          text-align: center;
        }
        .company-name {
          color: #7c6af7;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .role-name {
          color: #8888a8;
          font-size: 14px;
          margin: 4px 0 0;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #2a2a3e;
          color: #e2e2f0;
          font-size: 14px;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-icon { font-size: 18px; }
        .detail-label {
          color: #8888a8;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .tips {
          background: rgba(0, 214, 143, 0.08);
          border: 1px solid rgba(0, 214, 143, 0.2);
          border-radius: 10px;
          padding: 16px 20px;
          margin-top: 24px;
        }
        .tips h3 {
          color: #00d68f;
          font-size: 13px;
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tips ul {
          margin: 0;
          padding-left: 18px;
          color: #8888a8;
          font-size: 13px;
          line-height: 1.8;
        }
        .footer {
          text-align: center;
          padding: 20px 32px;
          border-top: 1px solid #2a2a3e;
          color: #8888a8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Interview Tomorrow!</h1>
          <p>Your Job Tracker reminder</p>
        </div>
        <div class="body">
          <div class="company-badge">
            <p class="company-name">${company}</p>
            <p class="role-name">${role}</p>
          </div>
          <div class="detail-row">
            <span class="detail-icon">📅</span>
            <div>
              <div class="detail-label">Date</div>
              <div>${formattedDate}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🕐</span>
            <div>
              <div class="detail-label">Time</div>
              <div>${formattedTime}</div>
            </div>
          </div>
          <div class="tips">
            <h3>Quick Checklist</h3>
            <ul>
              <li>Research the company and recent news</li>
              <li>Prepare 2-3 questions to ask the interviewer</li>
              <li>Review your resume and project details</li>
              <li>Test your internet and camera if it's online</li>
              <li>Keep a glass of water nearby</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          Sent by Job Tracker · You're crushing it 🚀
        </div>
      </div>
    </body>
    </html>
  `
}