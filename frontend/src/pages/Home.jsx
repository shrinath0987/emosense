import { useState, useRef, useEffect, useCallback } from "react";
import { saveSession } from "../utils/storage";
import { EMOTION_COLORS, EMOTION_EMOJIS, GLOBAL_CSS } from "../utils/theme";

const API = "https://shrinath1233-emosense.hf.space";
const DEFAULT_COLOR = { primary: "#00E5FF", bg: "#001820", border: "#00E5FF30" };

const css = `
${GLOBAL_CSS}
.home { padding: 24px; animation: fadeIn 0.4s ease; }
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #E2E8F0; }
.status-pill { font-size: 9px; letter-spacing: 3px; font-family: 'Share Tech Mono', monospace; padding: 4px 12px; border-radius: 20px; border: 1px solid #1E2A3A; color: #475569; }
.status-pill.active { border-color: #00E5FF40; color: #00E5FF; }
.top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.panel { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 12px; overflow: hidden; transition: border-color 0.6s; }
.panel-header { padding: 12px 16px; border-bottom: 1px solid #1E1E35; display: flex; align-items: center; justify-content: space-between; }
.panel-label { font-size: 9px; letter-spacing: 4px; font-family: 'Share Tech Mono', monospace; text-transform: uppercase; color: #475569; }
.panel-label.active { color: var(--panel-color, #00E5FF); }
.indicator { width: 6px; height: 6px; border-radius: 50%; background: #1E2A3A; }
.indicator.active { background: var(--panel-color, #00E5FF); box-shadow: 0 0 6px var(--panel-color, #00E5FF); animation: pulse 1.5s infinite; }
.camera-wrap { position: relative; aspect-ratio: 4/3; background: #080810; overflow: hidden; }
.camera-wrap video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scaleX(-1); }
.camera-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.scan-ring { width: 80px; height: 80px; border-radius: 50%; border: 1px solid #1E2A3A; position: relative; display: flex; align-items: center; justify-content: center; }
.scan-ring::before { content:''; position:absolute; inset:-1px; border-radius:50%; border:1px solid transparent; border-top-color:#00E5FF; animation:spin 2s linear infinite; }
.camera-hint { font-size: 10px; letter-spacing: 3px; color: #334155; font-family: 'Share Tech Mono', monospace; }
.analyzing-badge { position: absolute; top: 10px; right: 10px; padding: 3px 10px; border-radius: 4px; background: #000A; font-size: 9px; letter-spacing: 3px; font-family: 'Share Tech Mono', monospace; color: #00E5FF; animation: blink 1s infinite; }
.face-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 14px 12px; background: linear-gradient(transparent, #07070Fe0); display: flex; align-items: center; gap: 10px; }
.voice-body { aspect-ratio: 4/3; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #080810; }
.waveform { display: flex; align-items: center; gap: 3px; height: 40px; }
.wave-bar { width: 3px; background: #1E2A3A; border-radius: 3px; transition: height 0.15s; }
.wave-bar.active { background: var(--panel-color, #C084FC); }
.recording-dot { width: 10px; height: 10px; border-radius: 50%; background: #F87171; box-shadow: 0 0 8px #F87171; animation: pulse 0.8s infinite; }
.panel-footer { padding: 12px 14px; border-top: 1px solid #1E1E35; display: flex; flex-direction: column; gap: 8px; }
.btn { width: 100%; padding: 9px; border-radius: 6px; border: 1px solid; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
.btn-start { background: #001820; border-color: #00E5FF40; color: #00E5FF; }
.btn-start:hover { background: #002535; border-color: #00E5FF; }
.btn-stop { background: #200000; border-color: #F8717140; color: #F87171; }
.btn-voice { background: #1A0028; border-color: #C084FC40; color: #C084FC; }
.insight-box { padding: 8px 12px; border-radius: 6px; border-left: 2px solid var(--panel-color,#00E5FF); background: #0A0A14; font-size: 12px; color: #94A3B8; line-height: 1.5; font-style: italic; }
.action-strip { display: flex; gap: 10px; margin-bottom: 16px; }
.action-btn { flex: 1; padding: 10px 16px; border-radius: 8px; border: 1px solid; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
.action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.action-music { background: #1A1400; border-color: #FFD93D30; color: #FFD93D; }
.action-report { background: #001A10; border-color: #34D39930; color: #34D399; }
.music-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.song-card { padding: 12px 14px; background: #0D0D18; border: 1px solid #1E1E35; border-radius: 8px; }
.song-title { font-size: 13px; font-weight: 700; color: #FFD93D; }
.song-artist { font-size: 11px; color: #475569; margin-top: 2px; }
.yt-btn { width: 100%; margin-top: 8px; padding: 5px; border-radius: 5px; border: 1px solid #F8717130; background: #1A0000; color: #F87171; font-size: 10px; font-family: 'Share Tech Mono', monospace; cursor: pointer; }
.history-panel { background: #0D0D18; border: 1px solid #1E1E35; border-radius: 12px; overflow: hidden; }
.history-header { padding: 12px 16px; border-bottom: 1px solid #1E1E35; display: flex; align-items: center; justify-content: space-between; }
.chart-row { display: flex; align-items: flex-end; gap: 8px; height: 56px; padding: 14px 16px 0; }
.chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.chart-bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 3px; }
.timeline { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 5px; }
.timeline-row { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 6px; }
`;

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  const [faceEmotion, setFaceEmotion] = useState(null);
  const [faceInsight, setFaceInsight] = useState("");
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [voiceInsight, setVoiceInsight] = useState("");
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [waveBars, setWaveBars] = useState(Array(12).fill(6));

  const faceCol = faceEmotion ? EMOTION_COLORS[faceEmotion] : DEFAULT_COLOR;
  const voiceCol = voiceEmotion ? EMOTION_COLORS[voiceEmotion] : { primary: "#C084FC", bg: "#0D0010", border: "#C084FC30" };

  useEffect(() => {
    let t;
    if (isRecording) t = setInterval(() => setWaveBars(Array(12).fill(0).map(() => 6 + Math.random() * 26)), 120);
    else setWaveBars(Array(12).fill(6));
    return () => clearInterval(t);
  }, [isRecording]);

  useEffect(() => {
    return () => { if (history.length > 0) saveSession({ history, duration: Math.round((Date.now() - sessionStart) / 60000) }); };
  }, [history]);

  const startCamera = async () => {
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); videoRef.current.srcObject = stream; setIsRunning(true); }
    catch { alert("Camera access denied!"); }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(intervalRef.current);
    setIsRunning(false); setFaceEmotion(null); setFaceInsight("");
  };

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || faceLoading) return;
    const canvas = canvasRef.current; const video = videoRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setFaceLoading(true);
      const fd = new FormData(); fd.append("file", blob, "frame.jpg");
      try {
        const res = await fetch(`${API}/detect`, { method: "POST", body: fd });
        const data = await res.json();
        setFaceEmotion(data.emotion); setFaceConfidence(data.confidence); setFaceInsight(data.insight);
        setHistory(prev => [...prev.slice(-19), { emotion: data.emotion, confidence: data.confidence, insight: data.insight, time: new Date().toLocaleTimeString(), type: "face" }]);
      } catch (e) { console.error(e); }
      setFaceLoading(false);
    }, "image/jpeg", 0.8);
  }, [faceLoading]);

  useEffect(() => {
    if (isRunning) intervalRef.current = setInterval(captureAndDetect, 12000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, captureAndDetect]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); mediaRecorderRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" }); stream.getTracks().forEach(t => t.stop());
        setVoiceLoading(true);
        const fd = new FormData(); fd.append("file", blob, "voice.wav");
        try {
          const res = await fetch(`${API}/analyze-voice`, { method: "POST", body: fd });
          const data = await res.json();
          setVoiceEmotion(data.emotion); setVoiceConfidence(data.confidence); setVoiceInsight(data.insight); setTranscript(data.transcript);
          setHistory(prev => [...prev.slice(-19), { emotion: data.emotion, confidence: data.confidence, insight: data.insight, time: new Date().toLocaleTimeString(), type: "voice" }]);
        } catch (e) { console.error(e); }
        setVoiceLoading(false);
      };
      mr.start(); setIsRecording(true);
    } catch { alert("Mic access denied!"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const getMusic = async (emotion) => {
    setSongsLoading(true);
    try { const res = await fetch(`${API}/music?emotion=${emotion}`, { method: "POST" }); const data = await res.json(); setSongs(data.songs || []); }
    catch (e) { console.error(e); }
    setSongsLoading(false);
  };

  const downloadReport = async () => {
    setReportLoading(true);
    try {
      const duration = Math.round((Date.now() - sessionStart) / 60000);
      const res = await fetch(`${API}/report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history, duration: `${duration} minutes` }) });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "emosense_report.pdf"; a.click();
    } catch (e) { console.error(e); }
    setReportLoading(false);
  };

  const emotionCounts = history.reduce((acc, h) => { acc[h.emotion] = (acc[h.emotion] || 0) + 1; return acc; }, {});
  const maxCount = Math.max(...Object.values(emotionCounts), 1);

  return (
    <>
      <style>{css}</style>
      <div className="home">
        <div className="header-row">
          <div>
            <div className="page-title">Detection</div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#334155", fontFamily: "'Share Tech Mono',monospace", marginTop: 4 }}>REAL-TIME EMOTION ANALYSIS</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className={`status-pill ${isRunning ? "active" : ""}`}>{isRunning ? "● CAMERA LIVE" : "○ CAMERA OFF"}</div>
            <div className={`status-pill ${isRecording ? "active" : ""}`} style={isRecording ? { borderColor: "#C084FC40", color: "#C084FC" } : {}}>{isRecording ? "● RECORDING" : "○ MIC IDLE"}</div>
          </div>
        </div>

        <div className="top-grid">
          <div className="panel" style={{ borderColor: faceEmotion ? faceCol.border : "#1E1E35", "--panel-color": faceCol.primary }}>
            <div className="panel-header">
              <span className={`panel-label ${isRunning ? "active" : ""}`}>📷 Face Detection</span>
              <div className={`indicator ${isRunning ? "active" : ""}`} />
            </div>
            <div className="camera-wrap">
              <video ref={videoRef} autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!isRunning && <div className="camera-placeholder"><div className="scan-ring"><span style={{ fontSize: 28, opacity: 0.3 }}>📷</span></div><div className="camera-hint">AWAITING CAMERA INPUT</div></div>}
              {faceLoading && <div className="analyzing-badge">ANALYZING</div>}
              {faceEmotion && isRunning && (
                <div className="face-overlay">
                  <span style={{ fontSize: 28 }}>{EMOTION_EMOJIS[faceEmotion]}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: faceCol.primary, textTransform: "capitalize" }}>{faceEmotion}</div>
                    <div style={{ fontSize: 9, letterSpacing: 2, fontFamily: "'Share Tech Mono',monospace", color: "#94A3B8", marginTop: 2 }}>{faceConfidence}% CONFIDENCE</div>
                  </div>
                </div>
              )}
            </div>
            <div className="panel-footer">
              {!isRunning ? <button className="btn btn-start" onClick={startCamera}>▶ START CAMERA</button> : <button className="btn btn-stop" onClick={stopCamera}>■ STOP CAMERA</button>}
              {faceInsight && <div className="insight-box">{faceInsight}</div>}
            </div>
          </div>

          <div className="panel" style={{ borderColor: voiceEmotion ? voiceCol.border : "#1E1E35", "--panel-color": voiceCol.primary }}>
            <div className="panel-header">
              <span className={`panel-label ${isRecording ? "active" : ""}`} style={isRecording ? { color: "#C084FC" } : {}}>🎤 Voice Analysis</span>
              <div className={`indicator ${isRecording ? "active" : ""}`} style={{ "--panel-color": "#C084FC" }} />
            </div>
            <div className="voice-body">
              {voiceLoading ? (
                <><div className="waveform">{Array(12).fill(0).map((_, i) => <div key={i} className="wave-bar active" style={{ height: `${6 + Math.random() * 20}px` }} />)}</div><div className="camera-hint">TRANSCRIBING...</div></>
              ) : voiceEmotion ? (
                <><div style={{ fontSize: 56 }}>{EMOTION_EMOJIS[voiceEmotion]}</div><div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: voiceCol.primary, textTransform: "capitalize" }}>{voiceEmotion}</div><div style={{ fontSize: 9, color: "#64748B", fontFamily: "'Share Tech Mono',monospace", marginTop: 4 }}>{voiceConfidence}% CONFIDENCE</div></div>{transcript && <div style={{ maxWidth: "80%", padding: "6px 12px", background: "#0F0F1A", border: "1px solid #1E2A3A", borderRadius: 6, fontSize: 11, color: "#64748B", fontStyle: "italic", textAlign: "center", fontFamily: "'Share Tech Mono',monospace" }}>"{transcript}"</div>}</>
              ) : (
                <><div className="waveform">{waveBars.map((h, i) => <div key={i} className={`wave-bar ${isRecording ? "active" : ""}`} style={{ height: `${h}px` }} />)}</div><div className="camera-hint" style={{ fontSize: 10, letterSpacing: 3 }}>{isRecording ? "SPEAK NOW..." : "AWAITING VOICE INPUT"}</div>{isRecording && <div className="recording-dot" />}</>
              )}
            </div>
            <div className="panel-footer">
              {!isRecording ? <button className="btn btn-voice" onClick={startRecording}>🎤 START RECORDING</button> : <button className="btn btn-stop" onClick={stopRecording}>■ STOP & ANALYZE</button>}
              {voiceInsight && <div className="insight-box" style={{ "--panel-color": voiceCol.primary }}>{voiceInsight}</div>}
            </div>
          </div>
        </div>

        <div className="action-strip">
          <button className="action-btn action-music" disabled={!faceEmotion && !voiceEmotion} onClick={() => getMusic(faceEmotion || voiceEmotion || "neutral")}>{songsLoading ? "⏳ FINDING..." : "🎵 MUSIC FOR MY MOOD"}</button>
          <button className="action-btn action-report" disabled={history.length === 0} onClick={downloadReport}>{reportLoading ? "⏳ GENERATING..." : "📄 DOWNLOAD REPORT"}</button>
        </div>

        {songs.length > 0 && (
          <div className="music-grid">
            {songs.map((song, i) => (
              <div key={i} className="song-card">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 4, fontStyle: "italic" }}>{song.vibe}</div>
                <button className="yt-btn" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + " " + song.artist)}`, "music", "width=800,height=500")}>▶ PLAY ON YOUTUBE</button>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="history-panel">
            <div className="history-header">
              <span style={{ fontSize: 9, letterSpacing: 4, fontFamily: "'Share Tech Mono',monospace", color: "#334155" }}>📊 SESSION HISTORY</span>
              <span style={{ fontSize: 9, color: "#334155", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>{history.length} EVENTS</span>
            </div>
            <div className="chart-row">
              {Object.entries(emotionCounts).map(([emotion, count]) => (
                <div key={emotion} className="chart-col">
                  <span style={{ fontSize: 9, color: "#475569", fontFamily: "'Share Tech Mono',monospace" }}>{count}</span>
                  <div className="chart-bar" style={{ height: Math.max(Math.round((count / maxCount) * 48), 3), background: EMOTION_COLORS[emotion]?.primary || "#555" }} />
                  <span style={{ fontSize: 8, color: "#334155", fontFamily: "'Share Tech Mono',monospace" }}>{emotion.slice(0, 4)}</span>
                </div>
              ))}
            </div>
            <div className="timeline">
              {history.slice(-6).reverse().map((h, i) => (
                <div key={i} className="timeline-row">
                  <span style={{ fontSize: 18 }}>{EMOTION_EMOJIS[h.emotion]}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: EMOTION_COLORS[h.emotion]?.primary }}>{h.emotion}</span>
                  <span style={{ fontSize: 9, color: "#334155", fontFamily: "'Share Tech Mono',monospace", marginLeft: 6 }}>{h.confidence}%</span>
                  <span style={{ fontSize: 9, color: "#1E2A3A", fontFamily: "'Share Tech Mono',monospace", marginLeft: "auto" }}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}