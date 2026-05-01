import express, { Application, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./routes/authRoutes"
import jobRoutes from "./routes/jobRoutes"
import { startReminderCron } from "./config/remainderCron"

dotenv.config()

const app: Application = express()
const PORT: number = parseInt(process.env.PORT || "5000")

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL || ""  
  ],
  credentials: true
}))
app.use(express.json())

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("MongoDB connected")
    startReminderCron()  
  })
  .catch((err) => console.log("MongoDB error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Job Tracker API running" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})