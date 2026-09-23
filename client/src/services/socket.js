import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log(`[WebSocket] Connected to VAAYU Gateway: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from VAAYU Gateway');
    });
  }
  return socket;
}
