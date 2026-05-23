import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveUser } from "../utils/storage";
import { GLOBAL_CSS } from "../utils/theme";

const css = `
${GLOBAL_CSS}
.auth-page { min-height: 100vh; background: #07070F; display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-left { flex: 1; max-width: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
.auth-brand { text-align: center; margin-bottom: 40px; }
.auth-logo { font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #00E5FF; }
.auth-tagline { font-size: 10px; letter-spacing: 5px; color: #1E2A3A; font-family: 'Share Tech Mono', monospace; margin-top: 6px; }
.auth-card { width: 100%; max-width: 400px; background: #0D0D18; border: 1px solid #1E1E35; border-radius: 14px; padding: 32px; animation: fadeIn 0.4s ease; }
.auth-tabs { display: flex; margin-bottom: 28px; border-bottom: 1px solid #1E1E35; }
.auth-tab { flex: 1; padding: 10px; background: none; border: none; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #334155; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; margin-bottom: -1px; }
.auth-tab.active { color: #00E5FF; border-bottom-color: #00E5FF; }
.form-group { margin-bottom: 16px; }
.form-label { font-size: 9px; letter-spacing: 3px; font-family: 'Share Tech Mono', monospace; color: #475569; display: block; margin-bottom: 7px; }
.form-input { width: 100%; padding: 10px 14px; background: #080810; border: 1px solid #1E1E35; border-radius: 7px; color: #E2E8F0; font-family: 'Rajdhani', sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #00E5FF40; }
.form-input::placeholder { color: #1E2A3A; }
.auth-btn { width: 100%; padding: 11px; border-radius: 8px; border: 1px solid #00E5FF40; background: #00E5FF15; color: #00E5FF; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; margin-top: 8px; text-transform: uppercase; }
.auth-btn:hover { background: #00E5FF25; border-color: #00E5FF; }
.auth-error { padding: 8px 12px; border-radius: 6px; background: #1A0000; border: 1px solid #F8717130; color: #F87171; font-size: 12px; margin-bottom: 14px; font-family: 'Share Tech Mono', monospace; }
.auth-visual { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
.auth-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
.divider-line { flex: 1; height: 1px; background: #1E1E35; }
.divider-text { font-size: 9px; color: #334155; font-family: 'Share Tech Mono', monospace; letter-spacing: 2px; }
`;

export default function Login() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) { setError("Fill in all fields."); return; }
    if (tab === "signup" && !form.name) { setError("Enter your name."); return; }
    if (form.password.length < 4) { setError("Password too short."); return; }
    const user = { name: tab === "signup" ? form.name : form.email.split("@")[0], email: form.email, joinedAt: new Date().toISOString() };
    saveUser(user);
    navigate("/");
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-visual">
          <div>
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🧠</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#475569", letterSpacing: 2 }}>Real-time emotion analysis</div>
              <div style={{ fontSize: 12, color: "#1E2A3A", marginTop: 8, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2 }}>FACE · VOICE · INTELLIGENCE</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 40px)", gap: 4, opacity: 0.15 }}>
              {Array(24).fill(0).map((_, i) => (
                <div key={i} style={{ width: 36, height: 36, border: "1px solid #00E5FF", borderRadius: 4, opacity: Math.random() * 0.6 + 0.1 }} />
              ))}
            </div>
          </div>
        </div>

        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">EMOSENSE</div>
            <div className="auth-tagline">EMOTION INTELLIGENCE PLATFORM</div>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Login</button>
              <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>Sign Up</button>
            </div>
            {error && <div className="auth-error">⚠ {error}</div>}
            {tab === "signup" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Shrinath R" value={form.name} onChange={set("name")} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            <button className="auth-btn" onClick={handleSubmit}>
              {tab === "login" ? "▶ ACCESS SYSTEM" : "▶ CREATE ACCOUNT"}
            </button>
            <div className="auth-divider">
              <div className="divider-line" /><span className="divider-text">OR</span><div className="divider-line" />
            </div>
            <button className="auth-btn" style={{ background: "#0F0A00", borderColor: "#FFD93D30", color: "#FFD93D" }}
              onClick={() => { saveUser({ name: "Demo User", email: "demo@emosense.ai", joinedAt: new Date().toISOString() }); navigate("/"); }}>
              ⚡ DEMO MODE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}