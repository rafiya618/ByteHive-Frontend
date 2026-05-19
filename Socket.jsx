// This file is only to connect to the gateway
import { io } from "socket.io-client";
import { getRequiredUrl } from "./src/utils/env";

// Connect to the gateway (not directly to comment service)
const socket = io(getRequiredUrl("VITE_GATEWAY_URL"), { autoConnect: false }); 

export default socket;
