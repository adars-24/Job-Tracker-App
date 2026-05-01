// jobRoutes.ts
import { Router } from "express"
import { getJobs, createJob, updateJob, deleteJob, sendInterviewReminder } from "../controllers/jobController"
import { protect } from "../middleware/auth"

const router: Router = Router()


router.use(protect)

router.get("/", getJobs)
router.post("/", createJob)
router.put("/:id", updateJob)
router.delete("/:id", deleteJob)
router.post("/:id/remind", sendInterviewReminder)


export default router