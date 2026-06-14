import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ SnapLink</h1>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={submit} style={styles.form}>
          <input style={styles.input} name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required />
          <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={styles.foot}>Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"1rem" },
  card: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"2.5rem", width:"100%", maxWidth:"400px" },
  logo: { fontSize:"1.75rem", fontWeight:700, color:"var(--accent-light)", marginBottom:"0.5rem", textAlign:"center" },
  sub: { color:"var(--text-muted)", textAlign:"center", marginBottom:"2rem", fontSize:"0.9rem" },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  input: { background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"0.75rem 1rem", color:"var(--text)", fontSize:"0.95rem", outline:"none" },
  btn: { background:"var(--accent)", color:"#fff", padding:"0.8rem", borderRadius:"8px", fontWeight:600, fontSize:"1rem", transition:"opacity 0.2s" },
  error: { background:"rgba(239,68,68,0.1)", border:"1px solid var(--danger)", color:"var(--danger)", padding:"0.75rem 1rem", borderRadius:"8px", marginBottom:"1rem", fontSize:"0.875rem" },
  foot: { textAlign:"center", marginTop:"1.5rem", color:"var(--text-muted)", fontSize:"0.875rem" },
  link: { color:"var(--accent-light)" },
};
