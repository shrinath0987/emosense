import { useState } from "react";
import { getUser, saveUser, getSessions } from "../utils/storage";
import { EMOTION_COLORS, EMOTION_EMOJIS, GLOBAL_CSS } from "../utils/theme";

const css = `
${GLOBAL_CSS}
.profile { padding: 28px; animation: fadeIn 0.4s ease; }
.page-title { font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #E2E8F0; }
.page-sub { font-size: 10px; letter-spacing: 4px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-top: 4px; margin-bottom: 28px; }
.profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
.card { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 12px; overflow: hidden; }
.card-head { padding: 14px 18px; border-bottom: 1px solid #1E1E35; }
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #475569; font-family: 'Share Tech Mono', monospace; }
.card-body { padding: 20px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: #00E5FF15; border: 2px solid #00E5FF40; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #00E5FF; font-family: 'Share Tech Mono', monospace; }
.field-label { font-size: 9px; letter-spacing: 3px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-bottom: 6px; display: block; }
.field-input { width: 100%; padding: 9px 12px; background: #080810; border: 1px solid #1E1E35; border-radius: 7px; color: #E2E8F0; font-family: 'Rajdhani', sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s; margin-bottom: 14px; }
.field-input:focus { border-color: #00E5FF40; }
.field-input:disabled { color: #334155; cursor: not-allowed; }
.save-btn { width: 100%; padding: 9px; border-radius: 7px; border: 1px solid #00E5FF40; background: #00E5FF15; color: #00E5FF; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; }
.save-btn:hover { background: #00E5FF22; }
.stat-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #080810; border: 1px solid #1E1E35; border-radius: 7px; margin-bottom: 8px; }
`;

export default function Profile() {
  const user = getUser() || {};
  const sessions = getSessions();
  const [name, setName] = useState(user.name || "");
  const [saved, setSaved] = useState(false);

  const allEvents = sessions.flatMap(s => s.history || []);
  const counts = allEvents.reduce((a, e) => { a[e.emotion] = (a[e.emotion] || 0) + 1; return a; }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const avgConf = allEvents.length ? Math.round(allEvents.reduce((a, e) => a + (e.confidence || 0), 0) / allEvents.length) : 0;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "US";
  const joined = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const handleSave = () => { saveUser({ ...user, name }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <style>{css}</style>
      <div className="profile">
        <div className="page-title">Profile</div>
        <div className="page-sub">ACCOUNT & EMOTION IDENTITY</div>
        <div className="profile-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-head"><div className="card-title">IDENTITY</div></div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div className="avatar">{initials}</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>{name || "User"}</div>
                    <div style={{ fontSize: 11, color: "#475569", fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}>{user.email}</div>
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: 3, padding: "3px 12px", borderRadius: 20, background: "#00E5FF10", border: "1px solid #00E5FF30", color: "#00E5FF", fontFamily: "'Share Tech Mono',monospace" }}>ANALYST</div>
                </div>
                <label className="field-label">DISPLAY NAME</label>
                <input className="field-input" value={name} onChange={e => setName(e.target.value)} />
                <label className="field-label">EMAIL</label>
                <input className="field-input" value={user.email || ""} disabled />
                <label className="field-label">MEMBER SINCE</label>
                <input className="field-input" value={joined} disabled />
                <button className="save-btn" onClick={handleSave}>💾 SAVE CHANGES</button>
                {saved && <div style={{ textAlign: "center", fontSize: 10, color: "#34D399", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, marginTop: 8 }}>✓ SAVED</div>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {dominant && (
              <div className="card">
                <div className="card-head"><div className="card-title">EMOTIONAL SIGNATURE</div></div>
                <div className="card-body" style={{ textAlign: "center", padding: "28px 20px" }}>
                  <div style={{ fontSize: 52 }}>{EMOTION_EMOJIS[dominant]}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, textTransform: "capitalize", color: EMOTION_COLORS[dominant]?.primary, marginTop: 10 }}>{dominant}</div>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#334155", fontFamily: "'Share Tech Mono',monospace", marginTop: 6 }}>YOUR DOMINANT EMOTION</div>
                </div>
              </div>
            )}
            <div className="card">
              <div className="card-head"><div className="card-title">STATISTICS</div></div>
              <div className="card-body">
                {[
                  ["Total Detections", allEvents.length],
                  ["Sessions Recorded", sessions.length],
                  ["Avg Confidence", `${avgConf}%`],
                  ["Unique Emotions", Object.keys(counts).length],
                  ["Face Detections", allEvents.filter(e => e.type === "face").length],
                  ["Voice Analyses", allEvents.filter(e => e.type === "voice").length],
                ].map(([k, v], i) => (
                  <div key={i} className="stat-row">
                    <span style={{ fontSize: 12, color: "#475569", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{k}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}