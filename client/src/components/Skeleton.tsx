interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
  style?: React.CSSProperties
}

// Single skeleton block
export const Skeleton = ({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  className = ""
}: SkeletonProps) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

// Full table row skeleton
export const TableRowSkeleton = () => {
  return (
    <tr className="skeleton-row">
      <td>
        <Skeleton width="140px" height="14px" />
        <Skeleton width="100px" height="12px" style={{ marginTop: "6px" }} />
      </td>
      <td><Skeleton width="80px" height="24px" borderRadius="20px" /></td>
      <td><Skeleton width="90px" height="14px" /></td>
      <td><Skeleton width="70px" height="14px" /></td>
      <td>
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton width="60px" height="30px" borderRadius="8px" />
          <Skeleton width="70px" height="30px" borderRadius="8px" />
        </div>
      </td>
    </tr>
  )
}

// Stats card skeleton
export const StatCardSkeleton = () => {
  return (
    <div className="stat-card">
      <Skeleton width="60px" height="12px" />
      <Skeleton width="50px" height="32px" style={{ marginTop: "8px" }} />
    </div>
  )
}