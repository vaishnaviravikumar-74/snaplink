import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../utils/api";

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/urls/${id}/analytics`)
      .then((res) => setData(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.center}>Loading analytics…</div>;
  if (!data) return null;

  const { url, totalClicks, lastVisited, trend, deviceBreakdown } = data;

  const deviceColors = { desktop: "#7c3aed", mobile: "#06b6d4", tablet: "#f59e0b", unknown: "#6b7280" };
  const totalDeviceClicks = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate("/dashboard")} style={styles.back}>← Back to Dashboard</button>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Analytics</h1>
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" style={styles.shortLink}>
              {url.shortUrl}
            </a>
            <p style={styles.originalUrl} title={url.originalUrl}>{url.originalUrl}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={styles.statsRow}>
          {[
            { label: "Total Clicks", value: totalClicks, icon: "👆" },
            { label: "Last Visited", value: lastVisited ? new Date(lastVisited).toLocaleDateString() : "Never", icon: "🕐" },
            { label: "Created", value: new Date(url.createdAt).toLocaleDateString(), icon: "📅" },
            { label: "Expires", value: url.expiry ? new Date(url.expiry).toLocaleDateString() : "Never", icon: "⏳" },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statVal}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Daily trend chart */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Clicks — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3f" />
              <XAxis dataKey="date" tick={{ fill: "#8b8a9e", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#8b8a9e", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a24", border: "1px solid #2e2e3f", borderRadius: "8px", color: "#f1f0ff" }}
                labelStyle={{ color: "#a78bfa" }}
              />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device breakdown */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Device Breakdown</h2>
          {Object.keys(deviceBreakdown).length === 0 ? (
            <p style={styles.muted}>No click data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.entries(deviceBreakdown).map(([device, count]) => {
                const pct = Math.round((count / totalDeviceClicks) * 100);
                return (
                  <div key={device}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.875rem", textTransform: "capitalize" }}>{device}</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{count} ({pct}%)</span>
                    </div>
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: deviceColors[device] || "#7c3aed" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "2rem 1rem", minHeight: "calc(100vh - 60px)" },
  container: { maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--text-muted)" },
  back: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "0.4rem 1rem", borderRadius: "8px", fontSize: "0.875rem", cursor: "pointer", alignSelf: "flex-start" },
  header: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" },
  shortLink: { color: "var(--accent-light)", fontWeight: 600, fontSize: "1rem" },
  originalUrl: { color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "600px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" },
  statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", textAlign: "center" },
  statIcon: { fontSize: "1.5rem", marginBottom: "0.5rem" },
  statVal: { fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-light)" },
  statLabel: { color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" },
  cardTitle: { fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" },
  muted: { color: "var(--text-muted)", fontSize: "0.9rem" },
  barBg: { height: "8px", background: "var(--surface2)", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
};
