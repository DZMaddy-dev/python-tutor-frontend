import { useState } from "react";
import API from "./config";

function Auth({ onLogin, theme }) {

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const colors = {
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#ffffff" : "#1e293b",
    subtext: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#cbd5e1",
    inputBg: isDark ? "#0f172a" : "#f8fafc",
  };

  const submit = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const url = mode === "login" ? "/login" : "/register";

    const res =await fetch(`${API}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setMessage(data.message);
      if (mode === "login") {
        setTimeout(() => onLogin(data.username), 800);
      } else {
        setTimeout(() => setMode("login"), 1500);
      }
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px",
    background: colors.inputBg, color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px", fontSize: "15px",
    boxSizing: "border-box", marginBottom: "12px"
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: isDark ? "#0f172a" : "#f1f5f9"
    }}>
      <div style={{
        background: colors.card, borderRadius: "16px",
        padding: "40px", width: "100%", maxWidth: "400px",
        border: `1px solid ${colors.border}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🐍</div>
          <h2 style={{ margin: 0, color: colors.text }}>Python AI Tutor</h2>
          <p style={{ color: colors.subtext, marginTop: "6px" }}>
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: isDark ? "#0f172a" : "#f1f5f9",
          borderRadius: "8px", padding: "4px", marginBottom: "24px"
        }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
              style={{
                flex: 1, padding: "8px", border: "none", borderRadius: "6px",
                cursor: "pointer", fontWeight: "bold", fontSize: "14px",
                background: mode === m ? "#3b82f6" : "transparent",
                color: mode === m ? "white" : colors.subtext
              }}>
              {m === "login" ? "🔑 Login" : "📝 Register"}
            </button>
          ))}
        </div>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={inputStyle}
          onKeyDown={e => e.key === "Enter" && submit()}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={e => e.key === "Enter" && submit()}
        />

        {error && (
          <div style={{
            background: "#450a0a", color: "#f87171",
            padding: "10px", borderRadius: "6px",
            marginBottom: "12px", fontSize: "14px"
          }}>
            ❌ {error}
          </div>
        )}

        {message && (
          <div style={{
            background: "#14532d", color: "#86efac",
            padding: "10px", borderRadius: "6px",
            marginBottom: "12px", fontSize: "14px"
          }}>
            ✅ {message}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "16px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "🔑 Login" : "📝 Create Account"}
        </button>

      </div>
    </div>
  );
}

export default Auth;