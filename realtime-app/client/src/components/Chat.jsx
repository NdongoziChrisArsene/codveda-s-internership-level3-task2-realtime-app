import { useEffect, useState, useRef } from "react";
import socket from "../socket";

export default function Chat({ username, users }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [notifyTarget, setNotifyTarget] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("chat:message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("chat:message");
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat:message", input.trim());
    setInput("");
  };

  const sendPrivateNotification = () => {
    if (!notifyTarget || !notifyMsg.trim()) return;
    socket.emit("notify:user", {
      targetUsername: notifyTarget,
      message: notifyMsg.trim(),
    });
    setNotifyMsg("");
  };

  return (
    <div style={{ flex: 1, padding: "1rem" }}>
      {/* ── Chat Messages ── */}
      <h3>💬 Chat Room</h3>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "0.75rem",
          marginBottom: "0.75rem",
          background: "#f9fafb",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: m.username === username ? "#3b82f6" : "#111" }}>
              {m.username === username ? "You" : m.username}:
            </strong>{" "}
            <span>{m.message}</span>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Message Input ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>

      {/* ── Private Notification ── */}
      <h3>📩 Send Private Notification</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <select
          value={notifyTarget}
          onChange={(e) => setNotifyTarget(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
        >
          <option value="">Select user...</option>
          {users.filter((u) => u !== username).map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <input
          value={notifyMsg}
          onChange={(e) => setNotifyMsg(e.target.value)}
          placeholder="Private message..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
        />
        <button
          onClick={sendPrivateNotification}
          style={{ padding: "0.5rem 1rem", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Notify
        </button>
      </div>
    </div>
  );
}