import { useState } from "react";

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const body     = isLogin
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password };

    try {
      const res  = await fetch(`http://localhost:3001${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onAuth(data.token, data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "0.75rem", borderRadius: "8px",
    border: "1px solid #d1d5db", fontSize: "1rem", width: "250px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem" }}>
      <h2>{isLogin ? "🔐 Login" : "📝 Register"}</h2>

      {!isLogin && (
        <input
          style={inputStyle} placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      )}
      <input
        style={inputStyle} placeholder="Email" type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        style={inputStyle} placeholder="Password" type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

      <button
        onClick={handleSubmit} disabled={loading}
        style={{ padding: "0.75rem 2rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", width: "258px" }}
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
      </button>

      <p
        style={{ color: "#6b7280", cursor: "pointer" }}
        onClick={() => { setIsLogin(!isLogin); setError(""); }}
      >
        {isLogin ? "No account? Register" : "Have an account? Login"}
      </p>
    </div>
  );
}