export const saveUser = (user) => localStorage.setItem("emo_user", JSON.stringify(user));
export const getUser = () => { try { return JSON.parse(localStorage.getItem("emo_user")); } catch { return null; } };
export const logout = () => localStorage.removeItem("emo_user");

export const saveSession = (session) => {
  const sessions = getSessions();
  sessions.unshift({ ...session, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem("emo_sessions", JSON.stringify(sessions.slice(0, 50)));
};
export const getSessions = () => { try { return JSON.parse(localStorage.getItem("emo_sessions")) || []; } catch { return []; } };
export const clearSessions = () => localStorage.removeItem("emo_sessions");

export const getSettings = () => {
  try { return JSON.parse(localStorage.getItem("emo_settings")) || { scanInterval: 12, theme: "dark", notifications: true, autoMusic: false, language: "both" }; }
  catch { return { scanInterval: 12, theme: "dark", notifications: true, autoMusic: false, language: "both" }; }
};
export const saveSettings = (s) => localStorage.setItem("emo_settings", JSON.stringify(s));