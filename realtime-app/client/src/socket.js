import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: false, // We connect manually after user enters name
});

export default socket;