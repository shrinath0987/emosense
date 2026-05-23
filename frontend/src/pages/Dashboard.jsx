import { useMemo } from "react";
import { getSessions } from "../utils/storage";
import { EMOTION_COLORS, EMOTION_EMOJIS, GLOBAL_CSS } from "../utils/theme";

const css = `
${GLOBAL_CSS}
.dash { padding: 28px; animation: fadeIn 0.4s ease; }
.page-title { font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #E2E8F0; }
.page-sub { font-size: 10px; letter-spacing: 4px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-top: 4px; margin-bottom: 28px; }
.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
.stat-card { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 10px; padding: 16px 18px; }
.stat-label { font-size: 9px; letter-spacing: 3px; color: #334155; font-family: 'Share Tech Mono', monospace; margin-bottom: 8px; }
.stat-value { font-size: 30px; font-weight: 700; color: #E2E8F0; }
.stat-sub { font-size: 10px; color: #475569; margin-top: 4px; font-family: 'Share Tech Mono', monospace; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.panel { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 12px; overflow: hidden; }
.panel-head { padding: 14px 18px; border-bottom: 1px solid #1E1E35; }
.panel-title { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #475569; font-family: 'Share Tech Mono', monospace; }
.panel-body { padding: 18px; }
.emo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.emo-bar-wrap { flex: 1; height: 6px; background: #0F0F1A; border-radius: 3px; overflow: hidden; }
.emo-bar { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.activity-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px; background: #080810; border: 1px solid #1E1E35; margin-bottom: 6px; }
.empty-state { text-align: center; padding: 40px 20px; color: #334155; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; }
`;

export default function Dashboard() {
  const sessions = getSessions();
  const allEvents = sessions.flatMap(s => s.history || []);

  const stats = useMemo(() => {
    const counts = {};
    allEvents.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = allEvents.length;
    const dominant = sorted[0]?.[0] || null;
    const avgConf = total ? Math.round(allEvents.reduce((a, e) => a + (e.confidence || 0), 0) / total) : 0;
    return { counts, sorted, total, dominant, avgConf };
  }, []);

  const maxCount = Math.max(...Object.values(stats.counts), 1);
  const recent = allEvents.slice(-8).reverse();

  return (
    <>
      <style>{css}</style>
      <div className="dash">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">EMOTION ANALYTICS OVERVIEW</div>

        <div className="stat-grid">
          {[
            { label: "TOTAL DETECTIONS", value: stats.total, sub: "all time" },
            { label: "SESSIONS", value: sessions.length, sub: "recorded" },
            { label: "AVG CONFIDENCE", value: `${stats.avgConf}%`, sub: "accuracy" },
            { label: "DOMINANT MOOD", value: stats.dominant ? EMOTION_EMOJIS[stats.dominant] : "—", sub: stats.dominant || "none yet", color: stats.dominant ? EMOTION_COLORS[stats.dominant]?.primary : "#475569" },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={s.color ? { borderColor: `${s.color}30` } : {}}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head"><div className="panel-title">EMOTION BREAKDOWN</div></div>
            <div className="panel-body">
              {stats.sorted.length === 0
                ? <div className="empty-state">NO DATA YET<br/>Run a detection first</div>
                : stats.sorted.map(([emotion, count]) => (
                  <div key={emotion} className="emo-row">
                    <span style={{ fontSize: 20, width: 28 }}>{EMOTION_EMOJIS[emotion]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", width: 80, color: EMOTION_COLORS[emotion]?.primary }}>{emotion}</span>
                    <div className="emo-bar-wrap"><div className="emo-bar" style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: EMOTION_COLORS[emotion]?.primary }} /></div>
                    <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Share Tech Mono',monospace", width: 24, textAlign: "right" }}>{count}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><div className="panel-title">RECENT ACTIVITY</div></div>
            <div className="panel-body">
              {recent.length === 0
                ? <div className="empty-state">NO ACTIVITY YET</div>
                : recent.map((e, i) => (
                  <div key={i} className="activity-item">
                    <span style={{ fontSize: 16 }}>{EMOTION_EMOJIS[e.emotion]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", color: EMOTION_COLORS[e.emotion]?.primary }}>{e.emotion}</span>
                    <span style={{ fontSize: 9, color: "#1E2A3A", fontFamily: "'Share Tech Mono',monospace", padding: "1px 5px", border: "1px solid #1E2A3A", borderRadius: 3 }}>{e.type}</span>
                    <span style={{ fontSize: 9, color: "#334155", fontFamily: "'Share Tech Mono',monospace", marginLeft: "auto" }}>{e.time}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}