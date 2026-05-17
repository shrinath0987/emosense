import { useState, useRef, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:8000";

const EMOTION_COLORS = {
  happy: "#FFD700", sad: "#6B8CFF", angry: "#FF4444",
  surprised: "#FF8C00", fearful: "#9B59B6", disgusted: "#2ECC71", neutral: "#95A5A6",
};
const EMOTION_EMOJIS = {
  happy: "😊", sad: "😢", angry: "😠",
  surprised: "😲", fearful: "😨", disgusted: "🤢", neutral: "😐",
};

export default function App() {
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsRunning(true);
    } catch { alert("Camera access denied!"); }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setFaceEmotion(null);
  };

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || faceLoading) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setFaceLoading(true);
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      try {
        const res = await fetch(`${API}/detect`, { method: "POST", body: formData });
        const data = await res.json();
        setFaceEmotion(data.emotion);
        setFaceConfidence(data.confidence);
        setFaceInsight(data.insight);
        const entry = { emotion: data.emotion, confidence: data.confidence, insight: data.insight, time: new Date().toLocaleTimeString(), type: "face" };
        setHistory(prev => [...prev.slice(-19), entry]);
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
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach(t => t.stop());
        setVoiceLoading(true);
        const formData = new FormData();
        formData.append("file", blob, "voice.wav");
        try {
          const res = await fetch(`${API}/analyze-voice`, { method: "POST", body: formData });
          const data = await res.json();
          setVoiceEmotion(data.emotion);
          setVoiceConfidence(data.confidence);
          setVoiceInsight(data.insight);
          setTranscript(data.transcript);
          const entry = { emotion: data.emotion, confidence: data.confidence, insight: data.insight, time: new Date().toLocaleTimeString(), type: "voice" };
          setHistory(prev => [...prev.slice(-19), entry]);
        } catch (e) { console.error(e); }
        setVoiceLoading(false);
      };
      mr.start();
      setIsRecording(true);
    } catch { alert("Mic access denied!"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const getMusic = async (emotion) => {
    setSongsLoading(true);
    try {
      const res = await fetch(`${API}/music?emotion=${emotion}`, { method: "POST" });
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (e) { console.error(e); }
    setSongsLoading(false);
  };

  const downloadReport = async () => {
    setReportLoading(true);
    try {
      const duration = Math.round((Date.now() - sessionStart) / 60000);
      const res = await fetch(`${API}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, duration: `${duration} minutes` }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "emosense_report.pdf";
      a.click();
    } catch (e) { console.error(e); }
    setReportLoading(false);
  };

  const faceColor = faceEmotion ? EMOTION_COLORS[faceEmotion] || "#00C9A7" : "#00C9A7";
  const voiceColor = voiceEmotion ? EMOTION_COLORS[voiceEmotion] || "#A78BFA" : "#A78BFA";

  const emotionCounts = history.reduce((acc, h) => {
    acc[h.emotion] = (acc[h.emotion] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#E8E4DD", fontFamily: "Georgia, serif" }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", padding: "20px 16px 0", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#00C9A7", letterSpacing: 2 }}>EmoSense</div>
        <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 4 }}>REAL-TIME EMOTION INTELLIGENCE</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* TOP ROW - Camera + Voice */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* FACE */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: faceColor, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>📷 Face Emotion</div>
            <div style={{
              borderRadius: 12, overflow: "hidden", border: `2px solid ${faceColor}`,
              background: "#111", aspectRatio: "4/3", position: "relative", marginBottom: 10,
              transition: "border-color 0.5s",
            }}>
<video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(-1)" }} />              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!isRunning && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: "#111" }}>
                  <div style={{ fontSize: 40 }}>📷</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>Click Start Camera</div>
                </div>
              )}
              {faceLoading && (
                <div style={{ position: "absolute", top: 8, right: 8, background: "#000A", padding: "3px 8px", borderRadius: 20, fontSize: 9, color: faceColor, fontFamily: "monospace" }}>analyzing...</div>
              )}
              {faceEmotion && isRunning && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #000C)", padding: "20px 12px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{EMOTION_EMOJIS[faceEmotion]}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: faceColor, textTransform: "capitalize" }}>{faceEmotion}</div>
                    <div style={{ fontSize: 9, color: "#AAA", fontFamily: "monospace" }}>{faceConfidence}% confidence</div>
                  </div>
                </div>
              )}
            </div>
            {!isRunning
              ? <button onClick={startCamera} style={{ width: "100%", background: "#00C9A7", color: "#000", border: "none", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>▶ Start Camera</button>
              : <button onClick={stopCamera} style={{ width: "100%", background: "#FF4444", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>■ Stop Camera</button>
            }
            {faceInsight && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#111116", border: `1px solid ${faceColor}44`, borderLeft: `3px solid ${faceColor}`, borderRadius: 8, fontSize: 11, color: "#C8C4BD", lineHeight: 1.5, fontStyle: "italic" }}>{faceInsight}</div>
            )}
          </div>

          {/* VOICE */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: voiceColor, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>🎤 Voice Emotion</div>
            <div style={{
              borderRadius: 12, border: `2px solid ${voiceColor}`, background: "#111",
              aspectRatio: "4/3", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10,
              transition: "border-color 0.5s", position: "relative",
            }}>
              {voiceLoading ? (
                <><div style={{ fontSize: 40 }}>⏳</div><div style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>transcribing...</div></>
              ) : voiceEmotion ? (
                <>
                  <div style={{ fontSize: 52 }}>{EMOTION_EMOJIS[voiceEmotion]}</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: voiceColor, textTransform: "capitalize" }}>{voiceEmotion}</div>
                    <div style={{ fontSize: 10, color: "#AAA", fontFamily: "monospace" }}>{voiceConfidence}% confidence</div>
                  </div>
                  {transcript && <div style={{ padding: "6px 12px", background: "#1A1A24", borderRadius: 8, fontSize: 10, color: "#888", fontStyle: "italic", textAlign: "center", maxWidth: "80%", lineHeight: 1.5 }}>"{transcript}"</div>}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40 }}>🎤</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>{isRecording ? "Recording... speak now!" : "Click Record"}</div>
                  {isRecording && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF4444" }} />}
                </>
              )}
            </div>
            {!isRecording
              ? <button onClick={startRecording} style={{ width: "100%", background: voiceColor, color: "#000", border: "none", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>🎤 Start Recording</button>
              : <button onClick={stopRecording} style={{ width: "100%", background: "#FF4444", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>■ Stop & Analyze</button>
            }
            {voiceInsight && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#111116", border: `1px solid ${voiceColor}44`, borderLeft: `3px solid ${voiceColor}`, borderRadius: 8, fontSize: 11, color: "#C8C4BD", lineHeight: 1.5, fontStyle: "italic" }}>{voiceInsight}</div>
            )}
          </div>
        </div>

        {/* MUSIC + REPORT BUTTONS */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => getMusic(faceEmotion || voiceEmotion || "neutral")}
            disabled={!faceEmotion && !voiceEmotion}
            style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #FFD70044",
              background: "#FFD70011", color: faceEmotion || voiceEmotion ? "#FFD700" : "#444",
              cursor: faceEmotion || voiceEmotion ? "pointer" : "default",
              fontFamily: "monospace", fontSize: 12, fontWeight: 700,
            }}>
            {songsLoading ? "Finding songs..." : "🎵 Get Music for My Mood"}
          </button>
          <button
            onClick={downloadReport}
            disabled={history.length === 0}
            style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #00C9A744",
              background: "#00C9A711", color: history.length > 0 ? "#00C9A7" : "#444",
              cursor: history.length > 0 ? "pointer" : "default",
              fontFamily: "monospace", fontSize: 12, fontWeight: 700,
            }}>
            {reportLoading ? "Generating..." : "📄 Download Mood Report"}
          </button>
        </div>

        {/* MUSIC RECOMMENDATIONS */}
        {songs.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#FFD700", fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>🎵 Songs for your mood</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {songs.map((song, i) => (
  <div key={i} style={{ padding: "10px 14px", background: "#111116", border: "1px solid #FFD70033", borderRadius: 8 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>{song.title}</div>
    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{song.artist}</div>
    <div style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: song.language === "Tamil" ? "#FF6B3533" : "#00C9A733", color: song.language === "Tamil" ? "#FF6B35" : "#00C9A7", display: "inline-block", marginTop: 3, fontFamily: "monospace" }}>{song.language}</div>
    <div style={{ fontSize: 10, color: "#555", marginTop: 3, fontStyle: "italic" }}>{song.vibe}</div>
    <button
      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`, 'music', 'width=800,height=500,left=200,top=100')}
      style={{
        marginTop: 8, width: "100%", padding: "6px",
        background: "#FF000022", border: "1px solid #FF000044",
        borderRadius: 6, color: "#FF4444", cursor: "pointer",
        fontSize: 11, fontFamily: "monospace", fontWeight: 700
      }}
    >
      ▶ Play on YouTube
    </button>
  </div>
))}
            </div>
          </div>
        )}

        {/* EMOTION HISTORY */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#555", fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>📊 Emotion History</div>

            {/* Bar Chart */}
            <div style={{ background: "#111116", border: "1px solid #1E1E28", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
                {Object.entries(emotionCounts).map(([emotion, count]) => {
                  const max = Math.max(...Object.values(emotionCounts));
                  const height = Math.round((count / max) * 60);
                  return (
                    <div key={emotion} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: "#777", fontFamily: "monospace" }}>{count}</div>
                      <div style={{ width: "100%", height, background: EMOTION_COLORS[emotion] || "#555", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
                      <div style={{ fontSize: 8, color: "#555", fontFamily: "monospace", textTransform: "capitalize" }}>{emotion.slice(0, 4)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "#111116", border: `1px solid ${EMOTION_COLORS[h.emotion] || "#333"}33`, borderRadius: 6 }}>
                  <span style={{ fontSize: 16 }}>{EMOTION_EMOJIS[h.emotion]}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: EMOTION_COLORS[h.emotion], textTransform: "capitalize" }}>{h.emotion}</span>
                    <span style={{ fontSize: 10, color: "#555", marginLeft: 8, fontFamily: "monospace" }}>{h.confidence}%</span>
                    <span style={{ fontSize: 9, color: "#444", marginLeft: 8, fontFamily: "monospace" }}>{h.type}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>{h.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}