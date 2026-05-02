import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import JobModal from "../components/JobModal";
import EmptyState from "../components/EmptyState";
import { TableRowSkeleton, StatCardSkeleton } from "../components/Skeleton";
import api from "../api/axios";
import { exportToPDF } from "../utils/exportPDF";
import {
  type IJobApplication,
  type ApiResponse,
  type JobFormData,
} from "../typess";
import { showSuccess, showError } from "../utils/toast";
import Charts from "../components/Charts";

interface Stats {
  total: number;
  applied: number;
  interview: number;
  offered: number;
  rejected: number;
}

const PAGE_SIZE = 10;

const Dashboard = () => {
  const [jobs, setJobs] = useState<IJobApplication[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<IJobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<IJobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editJob, setEditJob] = useState<IJobApplication | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [salaryFilter, setSalaryFilter] = useState<string>("All");

  // Infinite scroll
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((j) => j.status === statusFilter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(q) ||
          j.role.toLowerCase().includes(q),
      );
    }

    // Date range
    if (dateFrom) {
      result = result.filter(
        (j) => new Date(j.appliedDate) >= new Date(dateFrom),
      );
    }
    if (dateTo) {
      result = result.filter(
        (j) => new Date(j.appliedDate) <= new Date(dateTo),
      );
    }

    // Salary filter
    if (salaryFilter !== "All") {
      result = result.filter((j) => {
        if (!j.salary) return false;
        const num = parseInt(j.salary);
        if (salaryFilter === "0-5") return num <= 5;
        if (salaryFilter === "5-10") return num > 5 && num <= 10;
        if (salaryFilter === "10-20") return num > 10 && num <= 20;
        if (salaryFilter === "20+") return num > 20;
        return true;
      });
    }

    // Sort
    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime(),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime(),
      );
    } else if (sortBy === "salary") {
      result.sort((a, b) => {
        const aVal = parseInt(a.salary || "0");
        const bVal = parseInt(b.salary || "0");
        return bVal - aVal;
      });
    } else if (sortBy === "company") {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    setFilteredJobs(result);
    // Reset infinite scroll when filters change
    setPage(1);
    setDisplayedJobs(result.slice(0, PAGE_SIZE));
    setHasMore(result.length > PAGE_SIZE);
  }, [jobs, search, statusFilter, sortBy, dateFrom, dateTo, salaryFilter]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => {
          const nextPage = page + 1;
          const nextBatch = filteredJobs.slice(0, nextPage * PAGE_SIZE);
          setDisplayedJobs(nextBatch);
          setPage(nextPage);
          setHasMore(nextBatch.length < filteredJobs.length);
          setLoadingMore(false);
        }, 600); // small delay so spinner shows
      }
    },
    [hasMore, loadingMore, page, filteredJobs],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const fetchJobs = async (): Promise<void> => {
    try {
      const { data } = await api.get<ApiResponse<IJobApplication[]>>("/jobs");
      if (data.success && data.data) {
        setJobs(data.data);
      }
    } catch {
      showError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: JobFormData): Promise<void> => {
    setSubmitting(true);
    try {
      const cleanData = {
        ...formData,
        interviewDate: formData.interviewDate || undefined,
        notes: formData.notes || undefined,
        jobUrl: formData.jobUrl || undefined,
        salary: formData.salary || undefined,
      };

      if (editJob) {
        const { data } = await api.put<ApiResponse<IJobApplication>>(
          `/jobs/${editJob._id}`,
          cleanData,
        );
        if (data.success && data.data) {
          setJobs((prev) =>
            prev.map((j) => (j._id === editJob._id ? data.data! : j)),
          );
          showSuccess("Application updated successfully");
        }
      } else {
        const { data } = await api.post<ApiResponse<IJobApplication>>(
          "/jobs",
          cleanData,
        );
        if (data.success && data.data) {
          setJobs((prev) => [data.data!, ...prev]);
          showSuccess("Application added successfully");
        }
      }
      setModalOpen(false);
      setEditJob(null);
    } catch {
      showError("Failed to save application");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Delete this application?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      showSuccess("Application deleted");
    } catch {
      showError("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (job: IJobApplication): void => {
    setEditJob(job);
    setModalOpen(true);
  };

  const handleAddNew = (): void => {
    setEditJob(null);
    setModalOpen(true);
  };

  const toggleBookmark = (id: string): void => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showSuccess("Bookmark removed");
      } else {
        next.add(id);
        showSuccess("Application bookmarked");
      }
      return next;
    });
  };

  const exportPDF = (): void => {
    if (jobs.length === 0) {
      showError("No applications to export");
      return;
    }
    exportToPDF(jobs);
    showSuccess("PDF exported successfully");
  };

  // CSV export
  const exportCSV = (): void => {
    const headers = [
      "Company",
      "Role",
      "Status",
      "Applied Date",
      "Salary",
      "Job URL",
      "Notes",
    ];
    const rows = jobs.map((j) => [
      j.company,
      j.role,
      j.status,
      new Date(j.appliedDate).toLocaleDateString(),
      j.salary || "",
      j.jobUrl || "",
      j.notes || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("CSV exported successfully");
  };

  const stats: Stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "Applied").length,
    interview: jobs.filter((j) => j.status === "Interview").length,
    offered: jobs.filter((j) => j.status === "Offered").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isFiltered =
    search !== "" ||
    statusFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    salaryFilter !== "All";

  const sendReminder = async (id: string): Promise<void> => {
    try {
      const { data } = await api.post<ApiResponse<null>>(`/jobs/${id}/remind`);
      if (data.success) {
        showSuccess("Reminder email sent to your inbox!");
      }
    } catch {
      showError("Failed to send reminder — check interview date is set");
    }
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          ☰
        </button>
        <span className="topbar-logo">📋 JobTracker</span>
        <div className="topbar-actions">
         
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">
              {stats.total} total · {stats.interview} interviews ·{" "}
              {stats.offered} offers
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="export-btn" onClick={exportCSV}>
              📥 Export CSV
            </button>

            <button className="export-btn" onClick={exportPDF}>
              📄 Export PDF
            </button>

            <button className="add-btn" onClick={handleAddNew}>
              + Add Application
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="stat-card applied">
                <span className="stat-label">Applied</span>
                <span className="stat-value">{stats.applied}</span>
              </div>
              <div className="stat-card interview">
                <span className="stat-label">Interview</span>
                <span className="stat-value">{stats.interview}</span>
              </div>
              <div className="stat-card offered">
                <span className="stat-label">Offered</span>
                <span className="stat-value">{stats.offered}</span>
              </div>
              <div className="stat-card rejected">
                <span className="stat-label">Rejected</span>
                <span className="stat-value">{stats.rejected}</span>
              </div>
            </>
          )}
        </div>

        {!loading && jobs.length > 0 && <Charts jobs={jobs} />}

        {/* Filters */}
        <div className="filters-bar">
          <input
            className="search-input"
            placeholder="Search company or role..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            className="filter-select"
            value={salaryFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSalaryFilter(e.target.value)
            }
          >
            <option value="All">All Salary</option>
            <option value="0-5">0–5 LPA</option>
            <option value="5-10">5–10 LPA</option>
            <option value="10-20">10–20 LPA</option>
            <option value="20+">20+ LPA</option>
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value)
            }
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary">Highest Salary</option>
            <option value="company">Company A–Z</option>
          </select>
        </div>

        {/* Date range */}
        <div className="filters-bar" style={{ marginTop: "-8px" }}>
          <input
            type="date"
            className="filter-select"
            value={dateFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDateFrom(e.target.value)
            }
            title="From date"
          />
          <input
            type="date"
            className="filter-select"
            value={dateTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDateTo(e.target.value)
            }
            title="To date"
          />
          {isFiltered && (
            <button
              className="export-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setSortBy("latest");
                setDateFrom("");
                setDateTo("");
                setSalaryFilter("All");
              }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : displayedJobs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState filtered={isFiltered} onAdd={handleAddNew} />
                  </td>
                </tr>
              ) : (
                displayedJobs.map((job: IJobApplication) => (
                  <tr key={job._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div className="company-name">{job.company}</div>
                          <div className="role-name">{job.role}</div>
                        </div>
                        {bookmarkedIds.has(job._id) && (
                          <span className="reminder-badge">🔖 Saved</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{formatDate(job.appliedDate)}</td>
                    <td>{job.salary || "—"}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className={`icon-btn ${bookmarkedIds.has(job._id) ? "bookmarked" : ""}`}
                          onClick={() => toggleBookmark(job._id)}
                          title="Bookmark"
                        >
                          {bookmarkedIds.has(job._id) ? "🔖" : "🏷️"}
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => handleEdit(job)}
                          disabled={submitting}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(job._id)}
                          disabled={deletingId === job._id}
                        >
                          {deletingId === job._id ? "..." : "🗑️ Delete"}
                        </button>

                        {job.status === "Interview" && (
                          <button
                            className="icon-btn"
                            onClick={() => sendReminder(job._id)}
                            title="Send reminder"
                          >
                            🔔
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Infinite scroll loader */}
          {!loading && hasMore && (
            <div ref={loaderRef} className="scroll-loader">
              {loadingMore && (
                <>
                  <div className="spinner" />
                  Loading more...
                </>
              )}
            </div>
          )}

          {/* End of list message */}
          {!loading && !hasMore && displayedJobs.length > 0 && (
            <div
              className="scroll-loader"
              style={{ color: "var(--text-secondary)" }}
            >
              ✓ All {filteredJobs.length} applications loaded
            </div>
          )}
        </div>
      </main>

      <JobModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditJob(null);
        }}
        onSubmit={handleSubmit}
        editJob={editJob}
        loading={submitting}
      />
    </div>
  );
};

export default Dashboard;
