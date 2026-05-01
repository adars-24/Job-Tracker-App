import { useState, useEffect } from "react"
import {type IJobApplication, type StatusType } from "../typess"  // import StatusType from types

interface JobFormData {
  company: string
  role: string
  status: StatusType
  appliedDate: string
  notes: string
  jobUrl: string
  salary: string
  interviewDate: string
}

interface JobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: JobFormData) => Promise<void>
  editJob?: IJobApplication | null
  loading: boolean
}

const defaultForm: JobFormData = {
  company: "",
  role: "",
  status: "Applied",
  appliedDate: new Date().toISOString().split("T")[0],
  notes: "",
  jobUrl: "",
  salary: "",
  interviewDate: ""
}

const JobModal = ({
  isOpen,
  onClose,
  onSubmit,
  editJob,
  loading
}: JobModalProps) => {
  const [form, setForm] = useState<JobFormData>(defaultForm)

  useEffect(() => {
    if (editJob) {
      setForm({
        company: editJob.company,
        role: editJob.role,
        status: editJob.status,
        appliedDate: editJob.appliedDate.split("T")[0],
        notes: editJob.notes || "",
        jobUrl: editJob.jobUrl || "",
        salary: editJob.salary || "",
        interviewDate: editJob.interviewDate
          ? editJob.interviewDate.split("T")[0]
          : ""
      })
    } else {
      setForm(defaultForm)
    }
  }, [editJob, isOpen])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editJob ? "Edit Application" : "Add Application"}
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Google"
                required
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. SDE Intern"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label>Applied Date *</label>
              <input
                type="date"
                name="appliedDate"
                value={form.appliedDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Job URL</label>
              <input
                name="jobUrl"
                value={form.jobUrl}
                onChange={handleChange}
                placeholder="LinkedIn/JD link"
              />
            </div>
            <div className="form-group">
              <label>Salary (LPA)</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 8-12 LPA"
              />
            </div>
          </div>

          {form.status === "Interview" && (
            <div className="form-group">
              <label>Interview Date & Time</label>
              <input
                type="datetime-local"
                name="interviewDate"
                value={form.interviewDate}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Interview date, contact person, anything..."
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Saving..." : editJob ? "Update" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobModal