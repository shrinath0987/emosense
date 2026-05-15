import { useState, useRef, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:8000";

const EMOTION_COLORS = {
  happy: "#FFD700",
  sad: "#6B8CFF",
  angry: "#FF4444",
  surprised: "#FF8C00",
  fearful: "#9B59B6",
  disgusted: "#2ECC71",
  neutral: "#95A5A6",
};

const EMOTION_EMOJIS = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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

  const intervalRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsRunning(true);
    } catch (err) {
      alert("Camera access denied!");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    videoRef.current.srcObject = null;
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
      } catch (err) {
        console.error(err);
      }
      setFaceLoading(false);
    }, "image/jpeg", 0.8);
  }, [faceLoading]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(captureAndDetect, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, captureAndDetect]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
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
        } catch (err) {
          console.error(err);
        }
        setVoiceLoading(false);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied!");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const faceColor = faceEmotion ? EMOTION_COLORS[faceEmotion] || "#00C9A7" : "#00C9A7";
  const voiceColor = voiceEmotion ? EMOTION_COLORS[voiceEmotion] || "#A78BFA" : "#A78BFA";

  return (
    <div style={{
      minHeight: "100vh", background: "#0D0D0D",
      color: "#E8E4DD", fontFamily: "Georgia, serif",
      padding: "24px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#00C9A7" }}>EmoSense</div>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 3 }}>
          REAL-TIME EMOTION INTELLIGENCE
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 900,
        margin: "0 auto",
      }}>

        {/* FACE PANEL */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: faceColor, fontFamily: "monospace", marginBottom: 10, textTransform: "uppercase" }}>
            📷 Face Emotion
          </div>
          <div style={{
            borderRadius: 12, overflow: "hidden",
            border: `2px solid ${faceColor}`,
            background: "#111", aspectRatio: "4/3",
            position: "relative", marginBottom: 12,
            transition: "border-color 0.5s",
          }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!isRunning && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 8, background: "#111",
              }}>
                <div style={{ fontSize: 40 }}>📷</div>
                <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>Click Start</div>
              </div>
            )}
            {faceLoading && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                background: "#000A", padding: "3px 8px",
                borderRadius: 20, fontSize: 10, color: faceColor, fontFamily: "monospace",
              }}>analyzing...</div>
            )}
            {faceEmotion && isRunning && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, #000C)",
                padding: "20px 12px 12px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 28 }}>{EMOTION_EMOJIS[faceEmotion]}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: faceColor, textTransform: "capitalize" }}>
                    {faceEmotion}
                  </div>
                  <div style={{ fontSize: 10, color: "#AAA", fontFamily: "monospace" }}>
                    {faceConfidence}% confidence
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isRunning ? (
            <button onClick={startCamera} style={{
              width: "100%", background: "#00C9A7", color: "#000",
              border: "none", padding: "10px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
            }}>▶ Start Camera</button>
          ) : (
            <button onClick={stopCamera} style={{
              width: "100%", background: "#FF4444", color: "#fff",
              border: "none", padding: "10px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
            }}>■ Stop Camera</button>
          )}

          {faceInsight && (
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: "#111116", border: `1px solid ${faceColor}44`,
              borderLeft: `3px solid ${faceColor}`,
              borderRadius: 8, fontSize: 12, color: "#C8C4BD",
              lineHeight: 1.6, fontStyle: "italic",
            }}>{faceInsight}</div>
          )}
        </div>

        {/* VOICE PANEL */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: voiceColor, fontFamily: "monospace", marginBottom: 10, textTransform: "uppercase" }}>
            🎤 Voice Emotion
          </div>
          <div style={{
            borderRadius: 12, border: `2px solid ${voiceColor}`,
            background: "#111", aspectRatio: "4/3",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16, marginBottom: 12,
            transition: "border-color 0.5s",
          }}>
            {voiceLoading ? (
              <>
                <div style={{ fontSize: 48 }}>⏳</div>
                <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>transcribing + analyzing...</div>
              </>
            ) : voiceEmotion ? (
              <>
                <div style={{ fontSize: 64 }}>{EMOTION_EMOJIS[voiceEmotion]}</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: voiceColor, textTransform: "capitalize" }}>
                    {voiceEmotion}
                  </div>
                  <div style={{ fontSize: 11, color: "#AAA", fontFamily: "monospace" }}>
                    {voiceConfidence}% confidence
                  </div>
                </div>
                {transcript && (
                  <div style={{
                    padding: "8px 12px", background: "#1A1A24",
                    borderRadius: 8, fontSize: 11, color: "#888",
                    fontStyle: "italic", textAlign: "center",
                    maxWidth: "80%", lineHeight: 1.5,
                  }}>"{transcript}"</div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 48 }}>🎤</div>
                <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>
                  {isRecording ? "Recording... speak now!" : "Click Record to start"}
                </div>
                {isRecording && (
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#FF4444", animation: "pulse 1s infinite",
                  }} />
                )}
              </>
            )}
          </div>

          {!isRecording ? (
            <button onClick={startRecording} style={{
              width: "100%", background: voiceColor, color: "#000",
              border: "none", padding: "10px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
            }}>🎤 Start Recording</button>
          ) : (
            <button onClick={stopRecording} style={{
              width: "100%", background: "#FF4444", color: "#fff",
              border: "none", padding: "10px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
            }}>■ Stop & Analyze</button>
          )}

          {voiceInsight && (
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: "#111116", border: `1px solid ${voiceColor}44`,
              borderLeft: `3px solid ${voiceColor}`,
              borderRadius: 8, fontSize: 12, color: "#C8C4BD",
              lineHeight: 1.6, fontStyle: "italic",
            }}>{voiceInsight}</div>
          )}
        </div>
      </div>
    </div>
  );
}