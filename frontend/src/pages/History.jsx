import { useState } from "react";
import { getSessions, clearSessions } from "../utils/storage";
import { EMOTION_COLORS, EMOTION_EMOJIS, GLOBAL_CSS } from "../utils/theme";

const css = `
${GLOBAL_CSS}
.hist { padding: 28px; animation: fadeIn 0.4s ease; }
.page-title { font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #E2E8F0; }
.page-sub { font-size: 10px; letter-spacing: 4px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-top: 4px; margin-bottom: 28px; }
.hist-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.filter-btn { padding: 6px 14px; border-radius: 5px; border: 1px solid #1E1E35; background: #0D0D18; color: #475569; cursor: pointer; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; transition: all 0.2s; margin-right: 6px; }
.filter-btn.active { border-color: #00E5FF40; color: #00E5FF; background: #00E5FF10; }
.clear-btn { padding: 6px 14px; border-radius: 5px; border: 1px solid #1E1E35; background: transparent; color: #334155; cursor: pointer; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; transition: all 0.2s; }
.clear-btn:hover { border-color: #F8717130; color: #F87171; background: #1A0000; }
.session-card { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
.session-head { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid #1E1E35; cursor: pointer; }
.emotion-pills { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 18px; }
.emotion-pill { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 5px; border: 1px solid; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 6px; padding: 0 18px 14px; }
.event-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; background: #080810; border: 1px solid #1E1E35; }
.expand-btn { font-size: 9px; color: #334155; font-family: 'Share Tech Mono', monospace; letter-spacing: 2px; padding: 8px 18px; cursor: pointer; border-top: 1px solid #1E1E35; display: block; width: 100%; background: none; border-left: none; border-right: none; border-bottom: none; text-align: left; transition: color 0.2s; }
.expand-btn:hover { color: #00E5FF; }
.empty-state { text-align: center; padding: 60px 20px; color: #334155; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; line-height: 2; }
`;

export default function History() {
  const [sessions, setSessions] = useState(getSessions());
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const handleClear = () => {
    if (window.confirm("Clear all session history?")) { clearSessions(); setSessions([]); }
  };

  const filtered = sessions.filter(s => filter === "all" ? true : (s.history || []).some(e => e.type === filter));

  return (
    <>
      <style>{css}</style>
      <div className="hist">
        <div className="page-title">Session History</div>
        <div className="page-sub">ALL RECORDED EMOTION SESSIONS</div>

        <div className="hist-toolbar">
          <div>
            {["all", "face", "voice"].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "face" ? "📷 Face" : "🎤 Voice"}
              </button>
            ))}
          </div>
          {sessions.length > 0 && <button className="clear-btn" onClick={handleClear}>🗑 Clear All</button>}
        </div>

        {filtered.length === 0
          ? <div className="empty-state">NO SESSIONS FOUND<br/><span style={{ fontSize: 10 }}>Run a detection session first</span></div>
          : filtered.map((session, idx) => {
            const events = session.history || [];
            const emotionSet = [...new Set(events.map(e => e.emotion))];
            return (
              <div key={session.id} className="session-card">
                <div className="session-head" onClick={() => toggle(session.id)}>
                  <span style={{ fontSize: 10, color: "#1E2A3A", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>SESSION #{sessions.length - idx}</span>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{events.length} detections</span>
                  <span style={{ fontSize: 13, color: "#64748B", fontFamily: "'Share Tech Mono',monospace", marginLeft: "auto" }}>
                    {new Date(session.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="emotion-pills">
                  {emotionSet.map(em => (
                    <div key={em} className="emotion-pill" style={{ color: EMOTION_COLORS[em]?.primary, borderColor: EMOTION_COLORS[em]?.border, background: EMOTION_COLORS[em]?.bg }}>
                      {EMOTION_EMOJIS[em]} {em}
                    </div>
                  ))}
                </div>
                {expanded[session.id] && (
                  <div className="events-grid">
                    {events.map((e, i) => (
                      <div key={i} className="event-item">
                        <span style={{ fontSize: 14 }}>{EMOTION_EMOJIS[e.emotion]}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: EMOTION_COLORS[e.emotion]?.primary }}>{e.emotion}</span>
                        <span style={{ fontSize: 9, color: "#334155", fontFamily: "'Share Tech Mono',monospace", marginLeft: "auto" }}>{e.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="expand-btn" onClick={() => toggle(session.id)}>{expanded[session.id] ? "▲ COLLAPSE" : "▼ VIEW EVENTS"}</button>
              </div>
            );
          })
        }
      </div>
    </>
  );
}