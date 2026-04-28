import { useEffect, useState } from "react";
import socket from "../socket";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 20)); // keep last 20
    });

    return () => socket.off("notification");
  }, []);

  const colorMap = {
    info: "#3b82f6",
    warning: "#f59e0b",
    private: "#8b5cf6",
  };

  return (
    <div style={{ padding: "1rem", borderLeft: "3px solid #e5e7eb" }}>
      <h3>🔔 Notifications</h3>
      {notifications.length === 0 && (
        <p style={{ color: "#9ca3af" }}>No notifications yet</p>
      )}
      {notifications.map((n, i) => (
        <div
          key={i}
          style={{
            background: "#f9fafb",
            borderLeft: `4px solid ${colorMap[n.type] || "#6b7280"}`,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.5rem",
            borderRadius: "4px",
            fontSize: "0.9rem",
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}