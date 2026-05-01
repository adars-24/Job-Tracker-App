import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {type IJobApplication } from "../typess"

export const exportToPDF = (jobs: IJobApplication[]): void => {
  const doc = new jsPDF({
    orientation: "landscape",  
    unit: "mm",
    format: "a4"
  })

  
  doc.setFillColor(15, 15, 19)  
  doc.rect(0, 0, 297, 40, "F")  

  // Logo text
  doc.setTextColor(124, 106, 247)  
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Job Tracker", 14, 18)

  
  doc.setTextColor(136, 136, 168)  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Application Report", 14, 26)

  const exportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  doc.text(`Exported: ${exportDate}`, 250, 18, { align: "right" })

  const total = jobs.length
  const applied = jobs.filter(j => j.status === "Applied").length
  const interview = jobs.filter(j => j.status === "Interview").length
  const offered = jobs.filter(j => j.status === "Offered").length
  const rejected = jobs.filter(j => j.status === "Rejected").length
  const responseRate = total > 0
    ? (((total - applied) / total) * 100).toFixed(1)
    : "0"


  const statsY = 48
  const statBoxes = [
    { label: "Total", value: total.toString(), color: [124, 106, 247] },
    { label: "Applied", value: applied.toString(), color: [0, 180, 216] },
    { label: "Interview", value: interview.toString(), color: [255, 170, 0] },
    { label: "Offered", value: offered.toString(), color: [0, 214, 143] },
    { label: "Rejected", value: rejected.toString(), color: [255, 77, 109] },
    { label: "Response Rate", value: `${responseRate}%`, color: [124, 106, 247] }
  ]

  statBoxes.forEach((stat, i) => {
    const x = 14 + i * 47

    doc.setFillColor(30, 30, 46)  
    doc.roundedRect(x, statsY, 43, 22, 3, 3, "F")

    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(stat.value, x + 21, statsY + 10, { align: "center" })

    doc.setTextColor(136, 136, 168)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(stat.label, x + 21, statsY + 17, { align: "center" })
  })

  const tableData = jobs.map(j => [
    j.company,
    j.role,
    j.status,
    new Date(j.appliedDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    j.interviewDate
      ? new Date(j.interviewDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "—",
    j.salary || "—",
    j.notes ? j.notes.slice(0, 40) + (j.notes.length > 40 ? "..." : "") : "—"
  ])

  const getStatusColor = (status: string): [number, number, number] => {
    const map: Record<string, [number, number, number]> = {
      Applied: [0, 180, 216],
      Interview: [255, 170, 0],
      Offered: [0, 214, 143],
      Rejected: [255, 77, 109]
    }
    return map[status] || [136, 136, 168]
  }

  autoTable(doc, {
    startY: statsY + 30,
    head: [["Company", "Role", "Status", "Applied", "Interview", "Salary", "Notes"]],
    body: tableData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [226, 226, 240],
      lineColor: [42, 42, 62],     
      lineWidth: 0.3
    },
    headStyles: {
      fillColor: [26, 26, 36],     
      textColor: [136, 136, 168],  
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }
    },
    alternateRowStyles: {
      fillColor: [22, 22, 32]      
    },
    bodyStyles: {
      fillColor: [15, 15, 19]      
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },  
      1: { cellWidth: 45 },                      
      2: { cellWidth: 25 },                      
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },                      
      5: { cellWidth: 20 },
      6: { cellWidth: "auto" }                   
    },

    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const status = tableData[data.row.index]?.[2]
        if (status) {
          const [r, g, b] = getStatusColor(status)
          doc.setTextColor(r, g, b)
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.text(
            status,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 1,
            { align: "center" }
          )
        }
      }
    },

    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(136, 136, 168)
      doc.text(
        `Page ${data.pageNumber} of ${pageCount} · Job Tracker`,
        148,
        205,
        { align: "center" }
      )
    }
  })

  doc.save(`job-applications-${new Date().toISOString().split("T")[0]}.pdf`)
}