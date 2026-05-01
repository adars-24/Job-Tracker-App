interface EmptyStateProps {
  filtered?: boolean
  onAdd: () => void
}

const EmptyState = ({ filtered = false, onAdd }: EmptyStateProps) => {
  return (
    <div className="empty-state-wrapper">
   
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="empty-illustration"
      >
        <circle cx="90" cy="90" r="90" fill="#1e1e2e" />
        <rect x="45" y="50" width="90" height="110" rx="8" fill="#2a2a3e" />
        <rect x="55" y="65" width="70" height="8" rx="4" fill="#3a3a5e" />
        <rect x="55" y="82" width="50" height="8" rx="4" fill="#3a3a5e" />
        <rect x="55" y="99" width="60" height="8" rx="4" fill="#3a3a5e" />
        <rect x="55" y="116" width="40" height="8" rx="4" fill="#3a3a5e" />
        <circle cx="130" cy="55" r="22" fill="#7c6af7" />
        <text x="130" y="62" textAnchor="middle" fill="white" fontSize="22">+</text>
      </svg>

      <h3 className="empty-title">
        {filtered ? "No results found" : "No applications yet"}
      </h3>
      <p className="empty-desc">
        {filtered
          ? "Try adjusting your filters or search query"
          : "Start tracking your job hunt — add your first application"}
      </p>
      {!filtered && (
        <button className="add-btn" onClick={onAdd} style={{ marginTop: "20px" }}>
          + Add First Application
        </button>
      )}
    </div>
  )
}

export default EmptyState