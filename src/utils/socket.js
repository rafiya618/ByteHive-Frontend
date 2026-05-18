import io from "socket.io-client";
import { getRequiredUrl } from "./env";

// Singleton socket for the app
const socket = io(getRequiredUrl("VITE_GATEWAY_URL"));

export default socket;