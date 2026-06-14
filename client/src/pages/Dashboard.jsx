import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const navigate = useNavigate();

  const fetchUrls = async () => {
    try {
      const res = await api.get("/urls");
      setUrls(res.data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchUrls(); }, []);

  const shorten = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(""); setLoading(true);
    try {
      const res = await api.post("/urls", { originalUrl: input.trim() });
      setUrls([res.data, ...urls]);
      setInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copy = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteUrl = async (id) => {
    if (!confirm("Delete this link?")) return;
    await api.delete(`/urls/${id}`);
    setUrls(urls.filter((u) => u._id !== id));
  };

  const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { label: "Total Links", value: urls.length },
            { label: "Total Clicks", value: totalClicks },
            { label: "Active Links", value: urls.filter(u => !u.expiry || new Date(u.expiry) > new Date()).length },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statVal}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Shorten form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Shorten a URL</h2>
          <form onSubmit={shorten} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Paste a long URL here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Shortening..." : "⚡ Shorten"}
            </button>
          </form>
          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Links table */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Your Links</h2>
          {fetching ? (
            <p style={styles.muted}>Loading your links…</p>
          ) : urls.length === 0 ? (
            <p style={styles.muted}>No links yet. Shorten your first URL above!</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Short URL", "Original URL", "Clicks", "Created", "Actions"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {urls.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <a href={u.shortUrl} target="_blank" rel="noopener noreferrer" style={styles.shortLink}>
                            {u.shortUrl.replace(/^https?:\/\//, "")}
                          </a>
                          <button
                            style={styles.iconBtn}
                            title="Copy"
                            onClick={() => copy(u.shortUrl, u._id)}
                          >
                            {copied === u._id ? "✅" : "📋"}
                          </button>
                        </div>
                      </td>
                      <td style={{ ...styles.td, maxWidth: "220px" }}>
                        <div style={styles.originalUrl} title={u.originalUrl}>{u.originalUrl}</div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={styles.badge}>{u.clickCount}</span>
                      </td>
                      <td style={{ ...styles.td, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={styles.actionBtn} onClick={() => navigate(`/analytics/${u._id}`)}>
                            📊 Analytics
                          </button>
                          <button style={{ ...styles.actionBtn, color: "var(--danger)" }} onClick={() => deleteUrl(u._id)}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "2rem 1rem", minHeight: "calc(100vh - 60px)" },
  container: { maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" },
  statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", textAlign: "center" },
  statVal: { fontSize: "2rem", fontWeight: 700, color: "var(--accent-light)" },
  statLabel: { color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.25rem" },
  form: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  input: { flex: 1, minWidth: "200px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem 1rem", color: "var(--text)", fontSize: "0.95rem", outline: "none" },
  btn: { background: "var(--accent)", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap" },
  error: { marginTop: "0.75rem", color: "var(--danger)", fontSize: "0.875rem" },
  muted: { color: "var(--text-muted)", fontSize: "0.9rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.6rem 0.75rem", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500, borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "0.85rem 0.75rem", fontSize: "0.875rem", verticalAlign: "middle" },
  shortLink: { color: "var(--accent-light)", fontWeight: 500 },
  originalUrl: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-muted)" },
  badge: { background: "var(--surface2)", border: "1px solid var(--border)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-light)" },
  iconBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: "0.1rem 0.3rem" },
  actionBtn: { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" },
};
