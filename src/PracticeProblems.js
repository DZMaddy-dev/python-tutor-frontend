import { useEffect, useState } from "react";
import { saveProblemProgress, getProblemProgress } from "./useFirestore";
import API from "./config";

function PracticeProblems({ theme, userId }) {

  const [problems, setProblems] = useState({});
  const [activeCategory, setActiveCategory] = useState("basic");
  const [revealed, setRevealed] = useState({});
  const [search, setSearch] = useState("");
  const [solved, setSolved] = useState({});

  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#ffffff" : "#1e293b",
    subtext: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#cbd5e1",
    card: isDark ? "#0f172a" : "#f1f5f9",
    hintBg: isDark ? "#451a03" : "#fef3c7",
    hintText: isDark ? "#fde68a" : "#92400e",
    solutionBg: isDark ? "#020617" : "#f0fdf4",
    solutionText: isDark ? "#86efac" : "#166534",
  };

  // Load problems from backend
  useEffect(() => {
    fetch(`${API}/problems`)
      .then(res => res.json())
      .then(data => setProblems(data));
  }, []);

  // Load solved progress from Firestore
  useEffect(() => {
    if (!userId) return;
    getProblemProgress(userId).then(data => setSolved(data));
  }, [userId]);

  const toggle = (id, type) => {
    const key = `${id}-${type}`;
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSolved = async (id) => {
    const newVal = !solved[id];
    setSolved(prev => ({ ...prev, [id]: newVal }));
    if (userId) await saveProblemProgress(userId, id, newVal);
  };

  const categories = [
    { key: "basic",        label: "🟢 Basic",       color: "#22c55e" },
    { key: "intermediate", label: "🟡 Intermediate", color: "#f59e0b" },
    { key: "scenario",     label: "🎯 Scenario",     color: "#a855f7" },
    { key: "advanced",     label: "🔴 Advanced",     color: "#ef4444" },
  ];

  const activeColor = categories.find(c => c.key === activeCategory)?.color || "#3b82f6";

  const currentProblems = (problems[activeCategory] || []).filter(p =>
    search === "" || p.question.toLowerCase().includes(search.toLowerCase())
  );

  const solvedCount = (cat) => {
    return (problems[cat] || []).filter(p => solved[p.id]).length;
  };

  const totalCount = (cat) => (problems[cat] || []).length;

  const totalSolved = Object.values(solved).filter(Boolean).length;
  const totalProblems = Object.values(problems).flat().length;
  const overallPercent = totalProblems > 0
    ? Math.round((totalSolved / totalProblems) * 100)
    : 0;

  return (
    <div style={{ color: colors.text }}>

      <h2>📚 Practice Problems</h2>

      {/* Overall Progress */}
      <div style={{
        background: colors.card, borderRadius: "10px",
        padding: "16px", marginBottom: "20px",
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontWeight: "bold" }}>Overall Progress</span>
          <span style={{ color: colors.subtext }}>{totalSolved} / {totalProblems} solved</span>
        </div>

        <div style={{
          background: colors.border, borderRadius: "999px",
          height: "12px", overflow: "hidden", marginBottom: "16px"
        }}>
          <div style={{
            width: `${overallPercent}%`,
            background: "linear-gradient(90deg, #22c55e, #3b82f6)",
            height: "100%", borderRadius: "999px",
            transition: "width 0.4s ease"
          }} />
        </div>

        {/* Per-category mini bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {categories.map(cat => {
            const s = solvedCount(cat.key);
            const t = totalCount(cat.key);
            const pct = t > 0 ? Math.round((s / t) * 100) : 0;
            return (
              <div key={cat.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>{cat.label}</span>
                  <span style={{ color: colors.subtext }}>{s}/{t}</span>
                </div>
                <div style={{ background: colors.border, borderRadius: "999px", height: "6px" }}>
                  <div style={{
                    width: `${pct}%`, background: cat.color,
                    height: "100%", borderRadius: "999px",
                    transition: "width 0.4s ease"
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {totalSolved > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Reset all progress?")) {
                setSolved({});
                if (userId) saveProblemProgress(userId, "__reset__", false);
              }
            }}
            style={{
              marginTop: "12px", background: "transparent",
              color: "#ef4444", border: "1px solid #ef4444",
              padding: "4px 12px", borderRadius: "6px",
              cursor: "pointer", fontSize: "12px"
            }}
          >
            🗑 Reset Progress
          </button>
        )}
      </div>

      {/* Search */}
      <input
        placeholder="🔍 Search problems..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px",
          marginBottom: "16px",
          background: colors.bg, color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: "6px", fontSize: "14px",
          boxSizing: "border-box"
        }}
      />

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setSearch(""); }}
            style={{
              padding: "10px 16px", borderRadius: "6px",
              border: "none", cursor: "pointer",
              background: activeCategory === cat.key ? cat.color : colors.bg,
              color: activeCategory === cat.key ? "white" : colors.text,
              fontWeight: activeCategory === cat.key ? "bold" : "normal",
              fontSize: "13px"
            }}
          >
            {cat.label} ({solvedCount(cat.key)}/{totalCount(cat.key)})
          </button>
        ))}
      </div>

      <p style={{ color: colors.subtext, fontSize: "13px", marginBottom: "12px" }}>
        Showing {currentProblems.length} problem{currentProblems.length !== 1 ? "s" : ""}
        {search && ` for "${search}"`}
      </p>

      {/* Problem Cards */}
      {currentProblems.map((p) => (
        <div key={p.id} style={{
          background: solved[p.id] ? (isDark ? "#14532d" : "#dcfce7") : colors.bg,
          borderRadius: "8px", padding: "16px",
          marginBottom: "14px",
          borderLeft: `4px solid ${solved[p.id] ? "#22c55e" : activeColor}`,
          border: `1px solid ${solved[p.id] ? "#22c55e" : colors.border}`,
          transition: "all 0.2s ease"
        }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
            <p style={{ margin: "0 0 12px 0", fontWeight: "bold", lineHeight: "1.6", whiteSpace: "pre-line", flex: 1 }}>
              #{p.id} — {p.question}
            </p>
            <button
              onClick={() => toggleSolved(p.id)}
              title={solved[p.id] ? "Mark as unsolved" : "Mark as solved"}
              style={{
                background: solved[p.id] ? "#22c55e" : "transparent",
                color: solved[p.id] ? "white" : colors.subtext,
                border: `2px solid ${solved[p.id] ? "#22c55e" : colors.border}`,
                borderRadius: "50%", width: "32px", height: "32px",
                cursor: "pointer", fontSize: "16px",
                flexShrink: 0, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}
            >
              {solved[p.id] ? "✓" : "○"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => toggle(p.id, "hint")}
              style={{
                background: revealed[`${p.id}-hint`] ? "#92400e" : "#f59e0b",
                color: "white", border: "none",
                padding: "6px 14px", borderRadius: "5px",
                cursor: "pointer", fontSize: "13px"
              }}
            >
              {revealed[`${p.id}-hint`] ? "Hide Hint" : "💡 Show Hint"}
            </button>

            <button
              onClick={() => toggle(p.id, "solution")}
              style={{
                background: revealed[`${p.id}-solution`] ? "#14532d" : "#22c55e",
                color: "white", border: "none",
                padding: "6px 14px", borderRadius: "5px",
                cursor: "pointer", fontSize: "13px"
              }}
            >
              {revealed[`${p.id}-solution`] ? "Hide Solution" : "✅ Show Solution"}
            </button>
          </div>

          {revealed[`${p.id}-hint`] && (
            <div style={{
              marginTop: "12px", background: colors.hintBg,
              padding: "12px", borderRadius: "6px",
              color: colors.hintText, fontSize: "14px"
            }}>
              💡 <strong>Hint:</strong> {p.hint}
            </div>
          )}

          {revealed[`${p.id}-solution`] && (
            <div style={{ marginTop: "12px" }}>
              <strong style={{ color: colors.solutionText }}>✅ Solution:</strong>
              <pre style={{
                background: colors.solutionBg, color: colors.solutionText,
                padding: "14px", borderRadius: "6px",
                marginTop: "8px", overflowX: "auto",
                fontSize: "13px", lineHeight: "1.6"
              }}>
                {p.solution}
              </pre>
            </div>
          )}

        </div>
      ))}

      {currentProblems.length === 0 && (
        <p style={{ color: colors.subtext, textAlign: "center", marginTop: "40px" }}>
          No problems found. Try a different search.
        </p>
      )}

    </div>
  );
}

export default PracticeProblems;