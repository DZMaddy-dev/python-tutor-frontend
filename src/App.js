import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import Chat from "./Chat";
import PracticeProblems from "./PracticeProblems";
import Course from "./Course";
import Challenge from "./Challenge";
import Auth from "./Auth";
import API from "./config";
import "./App.css";

function App() {
  const [tab, setTab]       = useState("editor");
  const [theme, setTheme]   = useState("dark");
  const [user, setUser]     = useState(null);
  const [checking, setChecking] = useState(true);

  const isDark = theme === "dark";
  const colors = {
    bg:          isDark ? "#0f172a" : "#f1f5f9",
    card:        isDark ? "#1e293b" : "#ffffff",
    text:        isDark ? "#ffffff" : "#1e293b",
    subtext:     isDark ? "#94a3b8" : "#64748b",
    tabActive:   isDark ? "#3b82f6" : "#2563eb",
    tabInactive: isDark ? "#1e293b" : "#e2e8f0",
    border:      isDark ? "#334155" : "#cbd5e1",
  };

  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) setUser(data.username);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streakData");
    return saved ? JSON.parse(saved) : { count: 0, lastDate: null };
  });

  useEffect(() => {
    const today = new Date().toDateString();
    if (streak.lastDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak = {
      count: streak.lastDate === yesterday.toDateString() ? streak.count + 1 : 1,
      lastDate: today
    };
    setStreak(newStreak);
    localStorage.setItem("streakData", JSON.stringify(newStreak));
  }, [streak.lastDate, streak.count]);

  const logout = async () => {
    await fetch(`${API}/logout`, {
      method: "POST", credentials: "include"
    });
    setUser(null);
  };

  if (checking) return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#0f172a", color: "white", fontSize: "18px"
    }}>
      🐍 Loading...
    </div>
  );

  if (!user) return <Auth onLogin={setUser} theme={theme} />;

  return (
    <div style={{
      minHeight: "100vh", background: colors.bg,
      color: colors.text, padding: "20px",
      fontFamily: "Arial, sans-serif", transition: "all 0.3s ease"
    }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px" }}>🐍 Python AI Tutor</h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" }}>
            <span style={{
              background: streak.count >= 3 ? "linear-gradient(90deg,#f59e0b,#ef4444)" : colors.tabInactive,
              color: streak.count >= 3 ? "white" : colors.subtext,
              padding: "4px 12px", borderRadius: "999px", fontSize: "13px"
            }}>
              🔥 {streak.count} day streak{streak.count >= 7 ? " 🏆" : ""}
            </span>
            <span style={{ color: colors.subtext, fontSize: "13px" }}>
              👤 {user}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              background: colors.tabInactive, color: colors.text,
              border: "none", padding: "8px 14px",
              borderRadius: "6px", cursor: "pointer"
            }}>
            {isDark ? "☀️" : "🌙"}
          </button>
          <button onClick={logout}
            style={{
              background: "#ef4444", color: "white",
              border: "none", padding: "8px 14px",
              borderRadius: "6px", cursor: "pointer"
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { key: "editor",    label: "💻 Editor" },
          { key: "course",    label: "📖 Course" },
          { key: "practice",  label: "📚 Practice" },
          { key: "challenge", label: "🎯 Challenge" },
          { key: "chat",      label: "💬 AI Tutor" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontSize: "14px",
              fontWeight: tab === t.key ? "bold" : "normal",
              background: tab === t.key ? colors.tabActive : colors.tabInactive,
              color: tab === t.key ? "white" : colors.text
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        background: colors.card, padding: "20px",
        borderRadius: "10px", minHeight: "500px",
        border: `1px solid ${colors.border}`
      }}>
        {tab === "editor"    && <CodeEditor theme={theme} setTheme={setTheme} />}
        {tab === "course"    && <Course theme={theme} />}
        {tab === "practice"  && <PracticeProblems theme={theme} />}
        {tab === "challenge" && <Challenge theme={theme} />}
        {tab === "chat"      && <Chat theme={theme} />}
      </div>

    </div>
  );
}

export default App;
