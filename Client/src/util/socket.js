import { io } from "socket.io-client"

// ✅ Use your backend URL
export const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
  transports: ["websocket"],
  reconnection: true,
});
