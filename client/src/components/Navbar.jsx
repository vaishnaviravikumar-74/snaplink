import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      padding: "0 2rem",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <span
        onClick={() => navigate("/dashboard")}
        style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-light)", cursor: "pointer", letterSpacing: "-0.5px" }}
      >
        ⚡ SnapLink
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          {user?.name}
        </span>
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            padding: "0.4rem 1rem",
            borderRadius: "8px",
            fontSize: "0.875rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
