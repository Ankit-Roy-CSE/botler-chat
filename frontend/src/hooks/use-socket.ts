import { io, Socket } from "socket.io-client";
import { create } from "zustand";

/**
 * Dynamically resolves the WebSocket server backend URL based on Vite's environment mode.
 * - In **development**: Connects to the backend URL specified in `import.meta.env.VITE_API_URL`.
 * - In **production**: Connects to the root relative path (`"/"`), assuming the client and server share an origin or rely on a reverse proxy.
 */
const BASE_URL =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";

/**
 * Interface representing the Zustand state and action methods for Socket.io management.
 */
interface SocketState {
    /** The active Socket.io client instance, or `null` if disconnected. */
    socket: Socket | null;
    /** Array of user ID strings currently connected and marked online by the server. */
    onlineUsers: string[];
    /** Initializes and connects the WebSocket connection if not already connected. */
    connectSocket: () => void;
    /** Disconnects the active WebSocket connection and resets the socket state. */
    disconnectSocket: () => void;
}

/**
 * Zustand hook for managing the Socket.io lifecycle and online user state across the application.
 *
 * @example
 * ```tsx
 * const { connectSocket, disconnectSocket, onlineUsers } = useSocket();
 *
 * useEffect(() => {
 *   connectSocket();
 *   return () => disconnectSocket();
 * }, []);
 * ```
 */
export const useSocket = create<SocketState>()((set, get) => ({
    // Initial State
    socket: null,
    onlineUsers: [],

    /**
     * Establishes a new WebSocket connection to `BASE_URL` if an active connection doesn't already exist.
     * Sets up event listeners for socket connection lifecycle and online user broadcasts.
     */
    connectSocket: () => {
        const { socket } = get();

        // Idempotency check: prevent duplicate connection attempts if already connected
        if (socket?.connected) return;

        // Instantiate Socket.io client with credentials (cookies/session headers) enabled
        const newSocket = io(BASE_URL, {
            withCredentials: true,
            autoConnect: true,
        });

        // Store active instance in Zustand state
        set({ socket: newSocket });

        /**
         * Listener: Triggered when the socket successfully connects to the server.
         */
        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        /**
         * Listener: Triggered when the server emits the current list of online user IDs.
         * @param userIds Array of active user IDs sent from the backend
         */
        newSocket.on("online:users", (userIds: string[]) => {
            console.log("Online users updated:", userIds);
            set({ onlineUsers: userIds });
        });
    },

    /**
     * Gracefully disconnects the Socket.io instance and cleans up state references.
     */
    disconnectSocket: () => {
        const { socket } = get();

        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },
}));