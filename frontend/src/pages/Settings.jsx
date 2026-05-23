import { useState } from "react";
import { getSettings, saveSettings } from "../utils/storage";
import { GLOBAL_CSS } from "../utils/theme";

const css = `
${GLOBAL_CSS}
.settings { padding: 28px; animation: fadeIn 0.4s ease; }
.page-title { font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #E2E8F0; }
.page-sub { font-size: 10px; letter-spacing: 4px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-top: 4px; margin-bottom: 28px; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 12px; overflow: hidden; }
.card-head { padding: 14px 18px; border-bottom: 1px solid #1E1E35; }
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #475569; font-family: 'Share Tech Mono', monospace; }
.card-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.setting-label { font-size: 14px; font-weight: 600; color: #94A3B8; }
.setting-desc { font-size: 10px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-top: 3px; letter-spacing: 1px; }
.toggle { width: 44px; height: 24px; border-radius: 12px; border: 1px solid #1E2A3A; background: #080810; position: relative; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
.toggle.on { background: #00E5FF20; border-color: #00E5FF40; }
.toggle-dot { width: 18px; height: 18px; border-radius: 50%; background: #1E2A3A; position: absolute; top: 2px; left: 2px; transition: all 0.3s; }
.toggle.on .toggle-dot { left: 22px; background: #00E5FF; }
.divider { height: 1px; background: #1E1E35; }
.slider { width: 100%; accent-color: #00E5FF; }
.select { padding: 8px 12px; background: #080810; border: 1px solid #1E1E35; border-radius: 7px; color: #94A3B8; font-family: 'Share Tech Mono', monospace; font-size: 11px; outline: none; cursor: pointer; }
.save-btn { padding: 10px 24px; border-radius: 7px; border: 1px solid #00E5FF40; background: #00E5FF15; color: #00E5FF; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; }
.save-btn:hover { background: #00E5FF25; }
.danger-btn { padding: 9px 20px; border-radius: 7px; border: 1px solid #F8717130; background: #1A0000; color: #F87171; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; }
.danger-btn:hover { background: #240000; border-color: #F87171; }
`;

export default function Settings() {
  const [s, setS] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));
  const handleSave = () => { saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <style>{css}</style>
      <div className="settings">
        <div className="page-title">Settings</div>
        <div className="page-sub">CONFIGURE YOUR EXPERIENCE</div>

        <div className="settings-grid">
          <div className="card">
            <div className="card-head"><div className="card-title">DETECTION</div></div>
            <div className="card-body">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div><div className="setting-label">Scan Interval</div><div className="setting-desc">HOW OFTEN TO SCAN (SECONDS)</div></div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#00E5FF", fontFamily: "'Share Tech Mono',monospace" }}>{s.scanInterval}s</div>
                </div>
                <input type="range" min="4" max="30" step="2" value={s.scanInterval} className="slider" onChange={e => set("scanInterval", +e.target.value)} />
              </div>
              <div className="divider" />
              <div className="setting-row">
                <div><div className="setting-label">Auto Music</div><div className="setting-desc">SUGGEST SONGS AFTER DETECTION</div></div>
                <div className={`toggle ${s.autoMusic ? "on" : ""}`} onClick={() => set("autoMusic", !s.autoMusic)}><div className="toggle-dot" /></div>
              </div>
              <div className="divider" />
              <div className="setting-row">
                <div><div className="setting-label">Music Language</div><div className="setting-desc">FILTER RECOMMENDATIONS</div></div>
                <select className="select" value={s.language} onChange={e => set("language", e.target.value)}>
                  <option value="both">Both</option>
                  <option value="english">English</option>
                  <option value="tamil">Tamil</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">APPLICATION</div></div>
            <div className="card-body">
              {[
                { label: "Notifications", desc: "BROWSER ALERTS", key: "notifications" },
                { label: "Save Sessions", desc: "STORE HISTORY", key: "saveSessions" },
                { label: "Sound Effects", desc: "AUDIO ON DETECTION", key: "sounds" },
              ].map(({ label, desc, key }) => (
                <div key={key}>
                  <div className="setting-row">
                    <div><div className="setting-label">{label}</div><div className="setting-desc">{desc}</div></div>
                    <div className={`toggle ${s[key] ? "on" : ""}`} onClick={() => set(key, !s[key])}><div className="toggle-dot" /></div>
                  </div>
                  <div className="divider" style={{ marginTop: 20 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <button className="save-btn" onClick={handleSave}>💾 SAVE SETTINGS</button>
          {saved && <span style={{ fontSize: 10, color: "#34D399", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>✓ SETTINGS SAVED</span>}
        </div>

        <div className="card" style={{ borderColor: "#F8717120" }}>
          <div className="card-head" style={{ borderColor: "#F8717120" }}><div className="card-title" style={{ color: "#F87171" }}>DANGER ZONE</div></div>
          <div className="card-body" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <div><div className="setting-label">Clear All Data</div><div className="setting-desc">DELETE ALL SESSIONS PERMANENTLY</div></div>
            <button className="danger-btn" onClick={() => { if (window.confirm("Delete all data?")) { localStorage.clear(); window.location.reload(); } }}>🗑 CLEAR ALL DATA</button>
          </div>
        </div>
      </div>
    </>
  );
}