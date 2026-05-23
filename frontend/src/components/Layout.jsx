import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/storage";

const css = `
.sidebar {
  width: 220px; min-height: 100vh;
  background: #0A0A14; border-right: 1px solid #1E1E35;
  display: flex; flex-direction: column;
  position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
}
.sidebar-logo { padding: 20px 20px 16px; border-bottom: 1px solid #1E1E35; }
.sidebar-logo-text { font-size: 18px; font-weight: 700; letter-spacing: 4px; color: #00E5FF; }
.sidebar-logo-sub { font-size: 8px; letter-spacing: 5px; color: #1E2A3A; font-family: 'Share Tech Mono', monospace; margin-top: 2px; }
.sidebar-dot { width: 6px; height: 6px; border-radius: 50%; background: #00E5FF; box-shadow: 0 0 6px #00E5FF; display: inline-block; margin-right: 8px; animation: pulse 2s infinite; }
.nav-section { padding: 16px 12px 8px; }
.nav-label { font-size: 8px; letter-spacing: 4px; color: #1E2A3A; font-family: 'Share Tech Mono', monospace; padding: 0 8px; margin-bottom: 6px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 7px;
  color: #475569; font-size: 14px; font-weight: 500;
  text-decoration: none; letter-spacing: 1px;
  transition: all 0.2s; margin-bottom: 2px;
}
.nav-item:hover { background: #0F0F1A; color: #94A3B8; }
.nav-item.active { background: #00E5FF12; color: #00E5FF; border: 1px solid #00E5FF20; }
.nav-icon { font-size: 16px; width: 20px; text-align: center; }
.sidebar-bottom { margin-top: auto; padding: 12px; border-top: 1px solid #1E1E35; }
.user-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: 8px;
  background: #0D0D18; border: 1px solid #1E1E35; margin-bottom: 8px;
}
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #00E5FF20; border: 1px solid #00E5FF40;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #00E5FF;
  font-family: 'Share Tech Mono', monospace;
}
.user-name { font-size: 13px; font-weight: 600; color: #94A3B8; }
.user-role { font-size: 9px; color: #334155; font-family: 'Share Tech Mono', monospace; letter-spacing: 2px; }
.logout-btn {
  width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #1E1E35;
  background: transparent; color: #334155; cursor: pointer;
  font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; transition: all 0.2s;
}
.logout-btn:hover { border-color: #F8717130; color: #F87171; background: #1A0000; }
.page-wrap { margin-left: 220px; min-height: 100vh; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
`;

const NAV = [
  { to: "/", icon: "🧠", label: "Detection" },
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/history", icon: "🕘", label: "History" },
  { to: "/profile", icon: "👤", label: "Profile" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "US";
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      <style>{css}</style>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div><span className="sidebar-dot" /><span className="sidebar-logo-text">EMOSENSE</span></div>
          <div className="sidebar-logo-sub">EMOTION INTELLIGENCE</div>
        </div>
        <div className="nav-section">
          <div className="nav-label">NAVIGATION</div>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-role">ANALYST</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>⏻ &nbsp;Logout</button>
        </div>
      </div>
      <div className="page-wrap">{children}</div>
    </>
  );
}