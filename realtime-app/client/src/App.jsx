import { useState, useEffect } from "react";
import socket from "./socket";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import Notifications from "./components/Notifications";

export default function App() {
  const [token, setToken]       = useState(null);
  const [username, setUsername] = useState("");
  const [users, setUsers]       = useState([]);

  const handleAuth = (receivedToken, receivedUsername) => {
    socket.auth = { token: receivedToken };
    socket.connect();
    setToken(receivedToken);
    setUsername(receivedUsername);
  };

  const handleLogout = () => {
    socket.disconnect();
    setToken(null);
    setUsername("");
    setUsers([]);
  };

  // ── Move listener AFTER token is set ──────────────────
  useEffect(() => {
    if (!token) return; // only listen after login

    socket.on("users:update", (userList) => {
      setUsers(userList);
    });

    return () => socket.off("users:update");
  }, [token]); // ← re-run when token changes

  if (!token) return <Auth onAuth={handleAuth} />;

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>⚡ Real-Time Chat — <span style={{ color: "#3b82f6" }}>{username}</span></h2>
        <button
          onClick={handleLogout}
          style={{ padding: "0.4rem 1rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <p style={{ color: "#6b7280" }}>
        Online:{" "}
        {users.map((u) => (
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