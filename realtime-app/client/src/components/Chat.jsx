import { useEffect, useState, useRef } from "react";
import socket from "../socket";

export default function Chat({ username, users }) {
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [notifyTarget, setNotifyTarget] = useState("");
  const [notifyMsg, setNotifyMsg]       = useState("");
  const [typingUsers, setTypingUsers]   = useState([]);
  const bottomRef                       = useRef(null);
  const typingTimeoutRef                = useRef(null);

  useEffect(() => {
    socket.on("chat:history", (history) => setMessages(history));

    socket.on("chat:message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing:update", ({ username: typingUser, isTyping }) => {
      setTypingUsers((prev) =>
        isTyping
          ? [...new Set([...prev, typingUser])]
          : prev.filter((u) => u !== typingUser)
      );
    });

    return () => {
      socket.off("chat:history");
      socket.off("chat:message");
      socket.off("typing:update");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat:message", input.trim());
    socket.emit("typing:stop");
    clearTimeout(typingTimeoutRef.current);
    setInput("");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit("typing:start");

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop");
    }, 2000);
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
      <h3>💬 Chat Room</h3>

      {/* ── Message List ── */}
      <div style={{ height: "320px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem", background: "#f9fafb", marginBottom: "0.4rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: m.username === username ? "#3b82f6" : "#111" }}>
              {m.username === username ? "You" : m.username}:
            </strong>{" "}
            <span>{m.message}</span>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
              {new Date(m.timestamp || m.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Typing Indicator ── */}
      <div style={{ height: "20px", fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic", marginBottom: "0.4rem" }}>
        {typingUsers.length > 0 &&
          `${typingUsers.join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing...`
        }
      </div>

      {/* ── Message Input ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={input}
          onChange={handleInputChange}
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