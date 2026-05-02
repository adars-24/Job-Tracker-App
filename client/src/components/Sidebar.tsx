import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = (): void => {
    logout()
    navigate("/login")
    onClose()
  }

  const handleNavClick = (): void => {
    // Close sidebar after any nav item click
    // Important for mobile — sidebar shouldn't stay open
    onClose()
  }

  return (
    <>
      {/* Overlay — dark backdrop behind sidebar on mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Close button — visible on mobile only */}
        <button className="sidebar-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="sidebar-logo">
          <span>📋</span> JobTracker
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={handleNavClick}
          >
            📊 Dashboard
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {user ? getInitials(user.name) : "?"}
            </div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar