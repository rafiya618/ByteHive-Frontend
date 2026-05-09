import io from "socket.io-client";

// Singleton socket for the app
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8000");

export default socket;