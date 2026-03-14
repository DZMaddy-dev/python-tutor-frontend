import { useEffect, useState } from "react";
import API from "./config";

function Course({ theme }) {

  const [lessons, setLessons] = useState({});
  const [activeCategory, setActiveCategory] = useState("beginner");
  const [activeLesson, setActiveLesson] = useState(null);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem("completedLessons");
    return saved ? JSON.parse(saved) : {};
  });
  const [runOutput, setRunOutput] = useState("");
  const [running, setRunning] = useState(false);

  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "#0f172a" : "#f1f5f9",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#ffffff" : "#1e293b",
    subtext: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#cbd5e1",
    codeBg: isDark ? "#020617" : "#f8fafc",
    codeText: isDark ? "#86efac" : "#166534",
    theoryBg: isDark ? "#1e3a5f" : "#eff6ff",
    theoryText: isDark ? "#bfdbfe" : "#1e40af",
  };

  const categories = [
    { key: "beginner",     label: "🟢 Beginner",     color: "#22c55e" },
    { key: "intermediate", label: "🟡 Intermediate",  color: "#f59e0b" },
    { key: "advanced",     label: "🔴 Advanced",      color: "#ef4444" },
  ];

  useEffect(() => {
    fetch(`${API}/course`)
      .then(res => res.json())
      .then(data => {
        setLessons(data);
        const firstCat = Object.keys(data)[0];
        if (data[firstCat]?.length > 0) {
          setActiveLesson(data[firstCat][0]);
        }
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("completedLessons", JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (id) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runExample = async (code) => {
    setRunning(true);
    setRunOutput("");
    const res = await fetch(`${API}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, input: "" })
    });
    const data = await res.json();
    setRunOutput(data.output || data.error + "\n" + (data.explanation || ""));
    setRunning(false);
  };

  const completedCount = (cat) =>
    (lessons[cat] || []).filter(l => completed[l.id]).length;
  const totalCount = (cat) => (lessons[cat] || []).length;

  const totalCompleted = Object.values(lessons)
    .flat().filter(l => completed[l.id]).length;
  const totalLessons = Object.values(lessons).flat().length;

  const activeColor = categories.find(c => c.key === activeCategory)?.color || "#3b82f6";

  return (
    <div style={{ color: colors.text }}>

      <h2>📖 Python Course</h2>

      <div style={{
        background: colors.card, borderRadius: "10px",
        padding: "16px", marginBottom: "20px",
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontWeight: "bold" }}>Course Progress</span>
          <span style={{ color: colors.subtext }}>{totalCompleted} / {totalLessons} lessons</span>
        </div>
        <div style={{ background: colors.border, borderRadius: "999px", height: "10px" }}>
          <div style={{
            width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%`,
            background: "linear-gradient(90deg, #22c55e, #3b82f6)",
            height: "100%", borderRadius: "999px", transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {categories.map(cat => (
          <button key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setActiveLesson(null);
              setRunOutput("");
              const first = (lessons[cat.key] || [])[0];
              if (first) setActiveLesson(first);
            }}
            style={{
              padding: "10px 16px", borderRadius: "6px", border: "none",
              cursor: "pointer", fontSize: "13px",
              background: activeCategory === cat.key ? cat.color : colors.card,
              color: activeCategory === cat.key ? "white" : colors.text,
              fontWeight: activeCategory === cat.key ? "bold" : "normal"
            }}>
            {cat.label} ({completedCount(cat.key)}/{totalCount(cat.key)})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px" }}>

        <div style={{
          width: "220px", flexShrink: 0,
          background: colors.card, borderRadius: "8px",
          padding: "12px", border: `1px solid ${colors.border}`,
          maxHeight: "600px", overflowY: "auto"
        }}>
          {(lessons[activeCategory] || []).map(lesson => (
            <div
              key={lesson.id}
              onClick={() => { setActiveLesson(lesson); setRunOutput(""); }}
              style={{
                padding: "10px 12px", borderRadius: "6px",
                marginBottom: "6px", cursor: "pointer",
                background: activeLesson?.id === lesson.id
                  ? activeColor
                  : (completed[lesson.id] ? (isDark ? "#14532d" : "#dcfce7") : "transparent"),
                color: activeLesson?.id === lesson.id ? "white" : colors.text,
                borderLeft: completed[lesson.id] && activeLesson?.id !== lesson.id
                  ? "3px solid #22c55e" : "3px solid transparent",
                fontSize: "13px", display: "flex",
                alignItems: "center", gap: "8px"
              }}
            >
              <span>{completed[lesson.id] ? "✅" : "○"}</span>
              <span>{lesson.title}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {activeLesson ? (
            <div style={{
              background: colors.card, borderRadius: "8px",
              padding: "20px", border: `1px solid ${colors.border}`
            }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "20px" }}>
                  {activeLesson.title}
                </h3>
                <button
                  onClick={() => toggleComplete(activeLesson.id)}
                  style={{
                    background: completed[activeLesson.id] ? "#22c55e" : "transparent",
                    color: completed[activeLesson.id] ? "white" : colors.subtext,
                    border: `2px solid ${completed[activeLesson.id] ? "#22c55e" : colors.border}`,
                    padding: "6px 16px", borderRadius: "6px",
                    cursor: "pointer", fontSize: "13px"
                  }}
                >
                  {completed[activeLesson.id] ? "✅ Completed" : "○ Mark Complete"}
                </button>
              </div>

              <div style={{
                background: colors.theoryBg, borderRadius: "8px",
                padding: "16px", marginBottom: "16px",
                color: colors.theoryText, lineHeight: "1.8",
                whiteSpace: "pre-line", fontSize: "14px"
              }}>
                📘 {activeLesson.theory}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong>💻 Example Code</strong>
                  <button
                    onClick={() => runExample(activeLesson.example)}
                    style={{
                      background: "#22c55e", color: "white",
                      border: "none", padding: "6px 16px",
                      borderRadius: "6px", cursor: "pointer", fontSize: "13px"
                    }}
                  >
                    ▶ Run Example
                  </button>
                </div>
                <pre style={{
                  background: colors.codeBg, color: colors.codeText,
                  padding: "16px", borderRadius: "8px",
                  fontSize: "13px", lineHeight: "1.7",
                  overflowX: "auto", border: `1px solid ${colors.border}`
                }}>
                  {activeLesson.example}
                </pre>
              </div>

              {(runOutput || running) && (
                <div>
                  <strong>Output:</strong>
                  <pre style={{
                    background: colors.codeBg, color: "#60a5fa",
                    padding: "12px", borderRadius: "8px",
                    marginTop: "8px", fontSize: "13px",
                    border: `1px solid ${colors.border}`
                  }}>
                    {running ? "⏳ Running..." : runOutput}
                  </pre>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                {(() => {
                  const list = lessons[activeCategory] || [];
                  const idx = list.findIndex(l => l.id === activeLesson.id);
                  return idx > 0 ? (
                    <button
                      onClick={() => { setActiveLesson(list[idx - 1]); setRunOutput(""); }}
                      style={{
                        background: colors.card, color: colors.text,
                        border: `1px solid ${colors.border}`,
                        padding: "8px 16px", borderRadius: "6px", cursor: "pointer"
                      }}
                    >
                      ← Previous
                    </button>
                  ) : <div />;
                })()}

                {(() => {
                  const list = lessons[activeCategory] || [];
                  const idx = list.findIndex(l => l.id === activeLesson.id);
                  return idx < list.length - 1 ? (
                    <button
                      onClick={() => {
                        toggleComplete(activeLesson.id);
                        setActiveLesson(list[idx + 1]);
                        setRunOutput("");
                      }}
                      style={{
                        background: activeColor, color: "white",
                        border: "none", padding: "8px 20px",
                        borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                      }}
                    >
                      Complete & Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleComplete(activeLesson.id)}
                      style={{
                        background: "#22c55e", color: "white",
                        border: "none", padding: "8px 20px",
                        borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                      }}
                    >
                      ✅ Complete Lesson
                    </button>
                  );
                })()}
              </div>

            </div>
          ) : (
            <div style={{ color: colors.subtext, textAlign: "center", paddingTop: "60px" }}>
              Select a lesson from the left to begin
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Course;