import { useState, useEffect, useCallback } from "react";
import API from "./config";

function Challenge({ theme }) {

  const [problems, setProblems]     = useState([]);
  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [answer, setAnswer]         = useState("");
  const [feedback, setFeedback]     = useState(null);
  const [score, setScore]           = useState(0);
  const [timeLeft, setTimeLeft]     = useState(60);
  const [started, setStarted]       = useState(false);
  const [finished, setFinished]     = useState(false);
  const [results, setResults]       = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [totalTime, setTotalTime]   = useState(0);

  const isDark = theme === "dark";
  const colors = {
    bg:          isDark ? "#0f172a" : "#f1f5f9",
    card:        isDark ? "#1e293b" : "#ffffff",
    text:        isDark ? "#ffffff" : "#1e293b",
    subtext:     isDark ? "#94a3b8" : "#64748b",
    border:      isDark ? "#334155" : "#cbd5e1",
    inputBg:     isDark ? "#0f172a" : "#f8fafc",
    codeBg:      isDark ? "#020617" : "#f0fdf4",
    codeText:    isDark ? "#86efac" : "#166534",
  };

  useEffect(() => {
    fetch(`${API}/problems`)
      .then(res => res.json())
      .then(data => {
        const all = Object.values(data).flat();
        setProblems(all);
      });
  }, []);

  const startChallenge = () => {
    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    const picked   = shuffled.slice(0, 10);
    setQuestions(picked);
    setCurrent(0);
    setScore(0);
    setAnswer("");
    setFeedback(null);
    setShowSolution(false);
    setResults([]);
    setTimeLeft(60);
    setTotalTime(0);
    setStarted(true);
    setFinished(false);
  };

  const handleTimeout = useCallback(() => {
    if (feedback) return;
    const q = questions[current];
    setResults(prev => [...prev, {
      question: q.question,
      userAnswer: answer || "(no answer)",
      solution: q.solution,
      correct: false,
      timedOut: true,
    }]);
    setFeedback("timeout");
  }, [feedback, questions, current, answer]);

  useEffect(() => {
    if (!started || finished || feedback) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished, feedback, timeLeft, handleTimeout]);

  const submitAnswer = () => {
    if (feedback) return;
    const q = questions[current];
    const normalize = s => s.replace(/\s+/g, " ").trim().toLowerCase();
    const correct = normalize(answer) === normalize(q.solution);
    setResults(prev => [...prev, {
      question: q.question,
      userAnswer: answer,
      solution: q.solution,
      correct,
      timedOut: false,
    }]);
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? "correct" : "wrong");
  };

  const skipQuestion = () => {
    if (feedback) return;
    const q = questions[current];
    setResults(prev => [...prev, {
      question: q.question,
      userAnswer: "(skipped)",
      solution: q.solution,
      correct: false,
      timedOut: false,
    }]);
    setFeedback("skipped");
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setAnswer("");
      setFeedback(null);
      setShowSolution(false);
      setTimeLeft(60);
    }
  };

  const getRating = (score) => {
    if (score === 10) return { label: "🏆 Perfect!", color: "#f59e0b" };
    if (score >= 8)   return { label: "🌟 Excellent!", color: "#22c55e" };
    if (score >= 6)   return { label: "👍 Good Job!", color: "#3b82f6" };
    if (score >= 4)   return { label: "📚 Keep Practicing!", color: "#f59e0b" };
    return               { label: "💪 Don't Give Up!", color: "#ef4444" };
  };

  const timerColor = timeLeft > 30 ? "#22c55e"
    : timeLeft > 10 ? "#f59e0b" : "#ef4444";

  if (!started) return (
    <div style={{ color: colors.text, textAlign: "center", paddingTop: "40px" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
      <h2>Challenge Mode</h2>
      <p style={{ color: colors.subtext, maxWidth: "400px", margin: "0 auto 24px", lineHeight: "1.6" }}>
        10 random Python questions from all categories.<br />
        60 seconds per question. How many can you solve?
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "12px", maxWidth: "360px",
        margin: "0 auto 32px", textAlign: "left"
      }}>
        {[
          ["🟢", "Basic",        "Variables, loops, conditions"],
          ["🟡", "Intermediate", "Functions, lists, dicts"],
          ["🎯", "Scenario",     "Real-world problems"],
          ["🔴", "Advanced",     "OOP, algorithms, recursion"],
        ].map(([icon, label, desc]) => (
          <div key={label} style={{
            background: colors.card, borderRadius: "8px",
            padding: "12px", border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontWeight: "bold" }}>{icon} {label}</div>
            <div style={{ color: colors.subtext, fontSize: "12px", marginTop: "4px" }}>{desc}</div>
          </div>
        ))}
      </div>

      <button
        onClick={startChallenge}
        disabled={problems.length === 0}
        style={{
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          color: "white", border: "none",
          padding: "14px 40px", borderRadius: "8px",
          fontSize: "18px", cursor: "pointer", fontWeight: "bold"
        }}
      >
        {problems.length === 0 ? "Loading..." : "🚀 Start Challenge"}
      </button>
    </div>
  );

  if (finished) {
    const rating = getRating(score);
    return (
      <div style={{ color: colors.text }}>

        <div style={{
          textAlign: "center", background: colors.card,
          borderRadius: "12px", padding: "32px",
          marginBottom: "24px", border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: "64px", marginBottom: "8px" }}>
            {score === 10 ? "🏆" : score >= 6 ? "🌟" : "💪"}
          </div>
          <h2 style={{ color: rating.color, fontSize: "28px", margin: "0 0 8px" }}>
            {rating.label}
          </h2>
          <div style={{ fontSize: "48px", fontWeight: "bold", margin: "12px 0" }}>
            {score} <span style={{ color: colors.subtext, fontSize: "24px" }}>/ 10</span>
          </div>
          <p style={{ color: colors.subtext }}>
            Time spent: {Math.floor(totalTime / 60)}m {totalTime % 60}s
          </p>

          <div style={{
            background: colors.border, borderRadius: "999px",
            height: "12px", margin: "16px 0", overflow: "hidden"
          }}>
            <div style={{
              width: `${score * 10}%`, background: rating.color,
              height: "100%", borderRadius: "999px",
              transition: "width 1s ease"
            }} />
          </div>

          <button
            onClick={startChallenge}
            style={{
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              color: "white", border: "none",
              padding: "12px 32px", borderRadius: "8px",
              fontSize: "16px", cursor: "pointer",
              fontWeight: "bold", marginTop: "8px"
            }}
          >
            🔄 Try Again
          </button>
        </div>

        <h3>📋 Results Breakdown</h3>
        {results.map((r, i) => (
          <div key={i} style={{
            background: r.correct
              ? (isDark ? "#14532d" : "#dcfce7")
              : (isDark ? "#450a0a" : "#fef2f2"),
            borderRadius: "8px", padding: "14px",
            marginBottom: "10px",
            borderLeft: `4px solid ${r.correct ? "#22c55e" : "#ef4444"}`
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              {r.correct ? "✅" : r.timedOut ? "⏰" : "❌"} Q{i+1}: {r.question.split("\n")[0]}
            </div>
            {!r.correct && (
              <div style={{ fontSize: "13px", color: colors.subtext }}>
                <div>Your answer: <code style={{ color: "#f87171" }}>{r.userAnswer}</code></div>
                <div style={{ marginTop: "6px" }}>
                  Solution:
                  <pre style={{
                    background: colors.codeBg, color: colors.codeText,
                    padding: "8px", borderRadius: "4px",
                    marginTop: "4px", fontSize: "12px"
                  }}>
                    {r.solution}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ color: colors.text }}>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px",
        background: colors.card, padding: "12px 16px",
        borderRadius: "8px", border: `1px solid ${colors.border}`
      }}>
        <span style={{ fontWeight: "bold" }}>
          Question {current + 1} / {questions.length}
        </span>
        <span style={{
          fontWeight: "bold", fontSize: "18px", color: timerColor,
          background: isDark ? "#0f172a" : "#f1f5f9",
          padding: "4px 14px", borderRadius: "999px"
        }}>
          ⏱ {timeLeft}s
        </span>
        <span style={{ color: colors.subtext }}>
          Score: <strong style={{ color: "#22c55e" }}>{score}</strong>
        </span>
      </div>

      <div style={{
        background: colors.border, borderRadius: "999px",
        height: "6px", marginBottom: "20px", overflow: "hidden"
      }}>
        <div style={{
          width: `${(current / questions.length) * 100}%`,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          height: "100%", borderRadius: "999px", transition: "width 0.3s"
        }} />
      </div>

      <div style={{
        background: colors.card, borderRadius: "10px",
        padding: "20px", marginBottom: "16px",
        border: `1px solid ${colors.border}`
      }}>
        <p style={{ fontWeight: "bold", lineHeight: "1.7", whiteSpace: "pre-line", margin: 0 }}>
          {q.question}
        </p>
      </div>

      <textarea
        rows={8}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={!!feedback}
        placeholder="Write your Python code here..."
        style={{
          width: "100%", background: colors.inputBg,
          color: colors.text, border: `1px solid ${
            feedback === "correct" ? "#22c55e"
            : feedback === "wrong" || feedback === "timeout" ? "#ef4444"
            : colors.border}`,
          borderRadius: "8px", padding: "14px",
          fontSize: "14px", fontFamily: "monospace",
          resize: "vertical", boxSizing: "border-box",
          lineHeight: "1.6"
        }}
      />

      {feedback && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px",
          marginTop: "12px", fontWeight: "bold",
          background: feedback === "correct"
            ? (isDark ? "#14532d" : "#dcfce7")
            : (isDark ? "#450a0a" : "#fef2f2"),
          color: feedback === "correct" ? "#22c55e" : "#ef4444"
        }}>
          {feedback === "correct"  && "✅ Correct! Well done!"}
          {feedback === "wrong"    && "❌ Not quite. Check the solution below."}
          {feedback === "timeout"  && "⏰ Time's up! See the solution below."}
          {feedback === "skipped"  && "⏭ Skipped. Check the solution below."}
        </div>
      )}

      {feedback && feedback !== "correct" && (
        <div style={{ marginTop: "12px" }}>
          <button
            onClick={() => setShowSolution(s => !s)}
            style={{
              background: "#3b82f6", color: "white",
              border: "none", padding: "8px 16px",
              borderRadius: "6px", cursor: "pointer", fontSize: "13px"
            }}
          >
            {showSolution ? "Hide Solution" : "👁 Show Solution"}
          </button>

          {showSolution && (
            <pre style={{
              background: colors.codeBg, color: colors.codeText,
              padding: "14px", borderRadius: "8px",
              marginTop: "10px", fontSize: "13px", lineHeight: "1.6"
            }}>
              {q.solution}
            </pre>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        {!feedback ? (
          <>
            <button
              onClick={submitAnswer}
              style={{
                background: "#22c55e", color: "white",
                border: "none", padding: "10px 24px",
                borderRadius: "6px", cursor: "pointer",
                fontWeight: "bold", fontSize: "15px"
              }}
            >
              ✅ Submit
            </button>
            <button
              onClick={skipQuestion}
              style={{
                background: "transparent", color: colors.subtext,
                border: `1px solid ${colors.border}`,
                padding: "10px 20px", borderRadius: "6px", cursor: "pointer"
              }}
            >
              ⏭ Skip
            </button>
          </>
        ) : (
          <button
            onClick={nextQuestion}
            style={{
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              color: "white", border: "none",
              padding: "10px 28px", borderRadius: "6px",
              cursor: "pointer", fontWeight: "bold", fontSize: "15px"
            }}
          >
            {current + 1 >= questions.length ? "🏁 See Results" : "Next →"}
          </button>
        )}
      </div>

    </div>
  );
}

export default Challenge;