import { useState, useEffect } from "react";
import socket from "./socket";
import Chat from "./components/Chat";
import Notifications from "./components/Notifications";

export default function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("users:update", (userList) => {
      setUsers(userList);
    });

    return () => socket.off("users:update");
  }, []);

  const handleJoin = () => {
    if (!username.trim()) return;
    socket.connect();
    socket.emit("user:join", username.trim());
    setJoined(true);
  };

  if (!joined) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem" }}>
        <h2>🔌 Join the Chat</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder="Enter your username"
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", width: "250px" }}
        />
        <button
          onClick={handleJoin}
          style={{ padding: "0.75rem 2rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>⚡ Real-Time App — Welcome, <span style={{ color: "#3b82f6" }}>{username}</span></h2>
      <p style={{ color: "#6b7280" }}>
        Online users: {users.map((u) => (
          <span key={u} style={{ marginRight: "0.5rem", background: "#dcfce7", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>
            {u}
          </span>
        ))}
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Chat username={username} users={users} />
        <Notifications />
      </div>
    </div>
  );
}