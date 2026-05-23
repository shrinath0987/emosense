export const EMOTION_COLORS = {
  happy:     { primary: "#FFD93D", bg: "#2A2200", border: "#FFD93D40" },
  sad:       { primary: "#60A5FA", bg: "#001830", border: "#60A5FA40" },
  angry:     { primary: "#F87171", bg: "#230000", border: "#F8717140" },
  surprised: { primary: "#FB923C", bg: "#1F0E00", border: "#FB923C40" },
  fearful:   { primary: "#C084FC", bg: "#1A0028", border: "#C084FC40" },
  disgusted: { primary: "#34D399", bg: "#001A0F", border: "#34D39940" },
  neutral:   { primary: "#94A3B8", bg: "#0F1117", border: "#94A3B840" },
};

export const EMOTION_EMOJIS = {
  happy: "😊", sad: "😢", angry: "😠",
  surprised: "😲", fearful: "😨", disgusted: "🤢", neutral: "😐",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07070F; color: #E2E8F0; font-family: 'Rajdhani', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0D0D18; }
  ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 4px; }
  .mono { font-family: 'Share Tech Mono', monospace; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
`;