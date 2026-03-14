import Editor from "@monaco-editor/react";
import { useState, useEffect, useCallback } from "react";
import API from "./config";

function CodeEditor({ theme, setTheme }) {

  const [code, setCode] = useState("print('Hello World')");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runCode = useCallback(async () => {
    setLoading(true);
    setOutput("");
    const res = await fetch(`${API}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, input: userInput })
    });
    const data = await res.json();
    if (data.output) {
      setOutput(data.output);
    } else {
      setOutput(data.error + "\n\nExplanation:\n" + data.explanation);
    }
    setLoading(false);
  }, [code, userInput]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [runCode]);

  const explainCode = async () => {
    setLoading(true);
    const res = await fetch(`${API}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setOutput(data.explanation);
    setLoading(false);
  };

  const fixCode = async () => {
    setLoading(true);
    const res = await fetch(`${API}/fix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setCode(data.fixed);
    setOutput("✅ " + data.message);
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templates = {
    "Hello World": "print('Hello, World!')",
    "For Loop": "for i in range(5):\n    print(i)",
    "Function": "def greet(name):\n    return 'Hello, ' + name\n\nprint(greet('Aryan'))",
    "Class": "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        print(self.name + ' says Woof!')\n\nd = Dog('Bruno')\nd.bark()",
    "Fibonacci": "a, b = 0, 1\nfor i in range(10):\n    print(a, end=' ')\n    a, b = b, a + b",
    "List Ops": "nums = [5, 2, 8, 1, 9]\nprint('Original:', nums)\nprint('Sorted:', sorted(nums))\nprint('Max:', max(nums))\nprint('Sum:', sum(nums))",
    "Dictionary": "student = {'name': 'Aryan', 'age': 19, 'grade': 'A'}\nfor key, value in student.items():\n    print(key, ':', value)",
    "Try/Except": "try:\n    x = int(input('Enter a number: '))\n    print('Result:', 10 / x)\nexcept ValueError:\n    print('Not a valid number!')\nexcept ZeroDivisionError:\n    print('Cannot divide by zero!')",
  };

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "#0f172a" : "#f1f5f9",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#ffffff" : "#1e293b",
    border: isDark ? "#334155" : "#cbd5e1",
    outputBg: isDark ? "#020617" : "#f8fafc",
    outputText: isDark ? "#86efac" : "#166534",
    inputBg: isDark ? "#1e293b" : "#ffffff",
    hint: isDark ? "#94a3b8" : "#64748b",
  };

  return (
    <div style={{ color: colors.text }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h2 style={{ margin: 0 }}>🐍 Python Code Editor</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              background: isDark ? "#334155" : "#e2e8f0",
              color: colors.text,
              border: "none", padding: "8px 14px",
              borderRadius: "6px", cursor: "pointer", fontSize: "16px"
            }}
            title="Toggle Theme"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={copyCode}
            style={{
              background: copied ? "#22c55e" : "#3b82f6",
              color: "white", border: "none",
              padding: "8px 14px", borderRadius: "6px",
              cursor: "pointer", fontSize: "14px"
            }}
            title="Copy Code"
          >
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <select
          onChange={(e) => { if (e.target.value) setCode(templates[e.target.value]); }}
          style={{
            background: colors.card, color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "8px 12px", borderRadius: "6px",
            cursor: "pointer", fontSize: "13px"
          }}
        >
          <option value="">📁 Load Template...</option>
          {Object.keys(templates).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ border: `1px solid ${colors.border}`, borderRadius: "8px", overflow: "hidden" }}>
        <Editor
          height="400px"
          defaultLanguage="python"
          theme={isDark ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => setCode(value)}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ fontSize: "13px", color: colors.hint }}>
          📥 Program Input — if your code uses input(), type values here (one per line)
        </label>
        <textarea
          rows={3}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g. hello&#10;42"
          style={{
            width: "100%", marginTop: "6px",
            background: colors.inputBg, color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: "6px", padding: "10px",
            fontSize: "14px", fontFamily: "monospace",
            resize: "vertical", boxSizing: "border-box"
          }}
        />
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={runCode}
          style={{ background: "#22c55e", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          title="Ctrl+Enter">
          ▶ Run (Ctrl+Enter)
        </button>
        <button onClick={explainCode}
          style={{ background: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          🤖 Explain
        </button>
        <button onClick={fixCode}
          style={{ background: "#f59e0b", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          🔧 Fix Code
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>Output</h3>
        {loading
          ? <p style={{ color: colors.hint }}>⏳ Running...</p>
          : <pre style={{
              background: colors.outputBg, color: colors.outputText,
              padding: "14px", borderRadius: "8px",
              minHeight: "60px", overflowX: "auto",
              fontSize: "14px", lineHeight: "1.6",
              border: `1px solid ${colors.border}`
            }}>
              {output || "// Output will appear here"}
            </pre>
        }
      </div>

    </div>
  );
}

export default CodeEditor;