import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Get initials from name for avatar
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
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>📋</span> JobTracker
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item active">
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
  )
}

export default Sidebar