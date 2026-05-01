import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement
} from "chart.js"
import { Doughnut, Line, Bar } from "react-chartjs-2"
import {type IJobApplication } from "../typess"


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement
)

interface ChartsProps {
  jobs: IJobApplication[]
}

const Charts = ({ jobs }: ChartsProps) => {

  // --- CHART 1: Status Doughnut ---
  const statusData = {
    labels: ["Applied", "Interview", "Offered", "Rejected"],
    datasets: [
      {
        data: [
          jobs.filter(j => j.status === "Applied").length,
          jobs.filter(j => j.status === "Interview").length,
          jobs.filter(j => j.status === "Offered").length,
          jobs.filter(j => j.status === "Rejected").length
        ],
        backgroundColor: [
          "rgba(0, 180, 216, 0.8)",
          "rgba(255, 170, 0, 0.8)",
          "rgba(0, 214, 143, 0.8)",
          "rgba(255, 77, 109, 0.8)"
        ],
        borderColor: [
          "rgba(0, 180, 216, 1)",
          "rgba(255, 170, 0, 1)",
          "rgba(0, 214, 143, 1)",
          "rgba(255, 77, 109, 1)"
        ],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#8888a8",
          padding: 16,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = jobs.length
            const value = context.parsed
            const percent = total > 0
              ? ((value / total) * 100).toFixed(1)
              : 0
            return ` ${context.label}: ${value} (${percent}%)`
          }
        }
      }
    },
    cutout: "65%"  
  }

  // --- CHART 2: Applications over time (Line) ---

  const getApplicationsByDate = () => {
    const days: string[] = []
    const counts: number[] = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      })
      days.push(dateStr)

      const count = jobs.filter(j => {
        const jobDate = new Date(j.appliedDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        })
        return jobDate === dateStr
      }).length

      counts.push(count)
    }

    return { days, counts }
  }

  const { days, counts } = getApplicationsByDate()

  const cumulativeCounts = counts.reduce<number[]>((acc, val, i) => {
    acc.push((acc[i - 1] || 0) + val)
    return acc
  }, [])

  const lineData = {
    labels: days,
    datasets: [
      {
        label: "Daily Applications",
        data: counts,
        borderColor: "rgba(124, 106, 247, 1)",
        backgroundColor: "rgba(124, 106, 247, 0.1)",
        fill: true,
        tension: 0.4,  
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(124, 106, 247, 1)"
      },
      {
        label: "Cumulative Total",
        data: cumulativeCounts,
        borderColor: "rgba(0, 214, 143, 1)",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderDash: [5, 5],  
        pointBackgroundColor: "rgba(0, 214, 143, 1)"
      }
    ]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#8888a8",
          font: { size: 12 },
          padding: 16
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false 
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(42, 42, 62, 0.8)" },
        ticks: {
          color: "#8888a8",
          font: { size: 11 },
          maxTicksLimit: 8,  
          maxRotation: 0
        }
      },
      y: {
        grid: { color: "rgba(42, 42, 62, 0.8)" },
        ticks: {
          color: "#8888a8",
          font: { size: 11 },
          stepSize: 1  
        },
        beginAtZero: true
      }
    }
  }

  // --- CHART 3: Response rate Bar chart ---
  const totalApplied = jobs.length
  const responded = jobs.filter(
    j => j.status !== "Applied"
  ).length
  const notResponded = totalApplied - responded
  const responseRate = totalApplied > 0
    ? ((responded / totalApplied) * 100).toFixed(1)
    : "0"

  const barData = {
    labels: ["Total Applied", "Got Response", "No Response", "Interviews", "Offers"],
    datasets: [
      {
        label: "Applications",
        data: [
          totalApplied,
          responded,
          notResponded,
          jobs.filter(j => j.status === "Interview").length,
          jobs.filter(j => j.status === "Offered").length
        ],
        backgroundColor: [
          "rgba(124, 106, 247, 0.8)",
          "rgba(0, 180, 216, 0.8)",
          "rgba(255, 77, 109, 0.8)",
          "rgba(255, 170, 0, 0.8)",
          "rgba(0, 214, 143, 0.8)"
        ],
        borderColor: [
          "rgba(124, 106, 247, 1)",
          "rgba(0, 180, 216, 1)",
          "rgba(255, 77, 109, 1)",
          "rgba(255, 170, 0, 1)",
          "rgba(0, 214, 143, 1)"
        ],
        borderWidth: 2,
        borderRadius: 6  
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },  
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.parsed.y} applications`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#8888a8", font: { size: 11 } }
      },
      y: {
        grid: { color: "rgba(42, 42, 62, 0.8)" },
        ticks: {
          color: "#8888a8",
          stepSize: 1,
          font: { size: 11 }
        },
        beginAtZero: true
      }
    }
  }


  if (jobs.length === 0) return null

  return (
    <div>
      
      <div className="response-rate-bar">
        <span className="rate-label">Overall Response Rate</span>
        <div className="rate-track">
          <div
            className="rate-fill"
            style={{ width: `${responseRate}%` }}
          />
        </div>
        <span className="rate-value">{responseRate}%</span>
      </div>

      {/* Charts grid */}
      <div className="charts-grid">

        {/* Doughnut */}
        <div className="chart-card">
          <p className="chart-title">Status Breakdown</p>
          <div style={{ height: "220px", position: "relative" }}>
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
          {/* Center label */}
          <div className="doughnut-center-label">
            <span className="doughnut-total">{jobs.length}</span>
            <span className="doughnut-sublabel">Total</span>
          </div>
        </div>

        {/* Bar */}
        <div className="chart-card">
          <p className="chart-title">Funnel Overview</p>
          <div style={{ height: "220px", position: "relative" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

     
      <div className="chart-card" style={{ marginBottom: "28px" }}>
        <p className="chart-title">Applications Over Last 30 Days</p>
        <div style={{ height: "200px", position: "relative" }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  )
}

export default Charts