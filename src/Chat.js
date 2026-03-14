import { useState } from "react";
import API from "./config";

function Chat({ theme }) {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "#0f172a" : "#f1f5f9",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#ffffff" : "#1e293b",
    border: isDark ? "#334155" : "#cbd5e1",
    inputBg: isDark ? "#0f172a" : "#f8fafc",
    hint: isDark ? "#94a3b8" : "#64748b",
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <div style={{ color: colors.text }}>

      <h2 style={{ margin: "0 0 20px 0" }}>💬 Python Tutor</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          style={{
            flex: 1, padding: "12px",
            background: colors.inputBg, color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px", fontSize: "15px"
          }}
          placeholder="Ask a Python question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            color: "white", border: "none",
            padding: "12px 24px", borderRadius: "8px",
            cursor: "pointer", fontWeight: "bold", fontSize: "15px"
          }}
        >
          {loading ? "⏳..." : "Ask 🚀"}
        </button>
      </div>

      {answer && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "10px", padding: "20px"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: colors.text }}>Answer</h3>
          <p style={{ margin: 0, lineHeight: "1.7", color: colors.text, whiteSpace: "pre-wrap" }}>
            {answer}
          </p>
        </div>
      )}

      {!answer && !loading && (
        <p style={{ color: colors.hint }}>Ask anything about Python — variables, loops, functions, errors, and more!</p>
      )}

    </div>
  );
}

export default Chat;