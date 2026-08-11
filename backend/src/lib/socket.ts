import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import { Env } from "../config/env.config";
import { validateChatParticipant } from "../services/chat.service";

/**
 * Extended Socket.io Socket interface containing the authenticated User ID string.
 */
interface AuthenticatedSocket extends Socket {
    userId?: string;
}

// Global Singleton instance of the Socket.io Server
let io: Server | null = null;

/**
 * In-memory state map tracking active user presence.
 * Maps `userId` (key) -> `socket.id` (value).
 */
const onlineUsers = new Map<string, string>();

/**
 * Initializes and configures the Socket.io server instance on the HTTP server.
 * Handles JWT cookie authentication, presence management, and room subscription logic.
 *
 * @param httpServer - Native HTTP Server instance attached to Express.
 */
export const initializeSocket = (httpServer: HTTPServer) => {
    // Instantiate Socket.io server with CORS configuration
    io = new Server(httpServer, {
        cors: {
            origin: Env.FRONTEND_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    /**
     * Authentication Middleware for Socket.io connections.
     * Parses the HTTP cookie header, extracts the access token, and verifies the JWT.
     */
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;

            if (!rawCookie) return next(new Error("Unauthorized"));

            // Extract access token value from raw cookie string
            const token = rawCookie?.split("=")?.[1]?.trim();
            if (!token) return next(new Error("Unauthorized"));

            // Verify token signature and extract user payload
            const decodedToken = jwt.verify(token, Env.JWT_SECRET) as {
                userId: string;
            };
            if (!decodedToken) return next(new Error("Unauthorized"));

            // Attach user ID to socket instance for downstream event handlers
            socket.userId = decodedToken.userId;
            next();
        } catch (error) {
            next(new Error("Internal server error"));
        }
    });

    /**
     * Main connection handler for authenticated sockets.
     */
    io.on("connection", (socket: AuthenticatedSocket) => {
        const userId = socket.userId!;
        const newSocketId = socket.id;

        if (!socket.userId) {
            socket.disconnect(true);
            return;
        }

        // Register active socket ID for the user in the presence map
        onlineUsers.set(userId, newSocketId);

        // Broadcast updated list of online user IDs to all connected clients
        io?.emit("online:users", Array.from(onlineUsers.keys()));

        // Subscribe user to their private personal room for direct notification events
        socket.join(`user:${userId}`);

        /**
         * Event Listener: Joining a specific chat room channel.
         * Validates participant membership before joining the room.
         */
        socket.on(
            "chat:join",
            async (chatId: string, callback?: (err?: string) => void) => {
                try {
                    // Authorize user participation in the requested chat
                    await validateChatParticipant(chatId, userId);

                    socket.join(`chat:${chatId}`);
                    console.log(`User ${userId} joined room chat:${chatId}`);

                    callback?.();
                } catch (error) {
                    callback?.("Error joining chat");
                }
            }
        );

        /**
         * Event Listener: Leaving a specific chat room channel.
         */
        socket.on("chat:leave", (chatId: string) => {
            if (chatId) {
                socket.leave(`chat:${chatId}`);
                console.log(`User ${userId} left room chat:${chatId}`);
            }
        });

        /**
         * Event Listener: Disconnection cleanup.
         * Removes user from the presence map if the disconnected socket is active.
         */
        socket.on("disconnect", () => {
            // Verify the disconnecting socket matches the stored socket ID for the user
            if (onlineUsers.get(userId) === newSocketId) {
                if (userId) onlineUsers.delete(userId);

                // Broadcast updated online presence state across all clients
                io?.emit("online:users", Array.from(onlineUsers.keys()));

                console.log("socket disconnected", {
                    userId,
                    newSocketId,
                });
            }
        });
    });
};

/**
 * Internal helper to retrieve the initialized Socket.io instance.
 *
 * @returns The active Socket.io Server instance.
 * @throws {Error} If called before `initializeSocket`.
 */
function getIO() {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
}

/**
 * Emits a real-time event notifying targeted participants about a newly created chat room.
 * Target channels use private user rooms (`user:<participantId>`).
 *
 * @param participantIds - Array of participant user IDs to notify.
 * @param chat - The newly created and populated Chat document payload.
 */
export const emitNewChatToParticpants = (
    participantIds: string[] = [],
    chat: any
) => {
    const io = getIO();
    for (const participantId of participantIds) {
        io.to(`user:${participantId}`).emit("chat:new", chat);
    }
};

/**
 * Emits a real-time message event to all sockets subscribed to a specific chat room.
 * Excludes the sender's active socket ID to prevent duplicate local renders.
 *
 * @param senderId - MongoDB ObjectId string of the message sender.
 * @param chatId - Target chat room ID.
 * @param message - The populated Message document payload.
 */
export const emitNewMessageToChatRoom = (
    senderId: string,
    chatId: string,
    message: any
) => {
    const io = getIO();
    const senderSocketId = onlineUsers.get(senderId?.toString());

    console.log(senderId, "senderId");
    console.log(senderSocketId, "sender socketid exist");
    console.log("All online users:", Object.fromEntries(onlineUsers));

    // Omit sending back to the sender socket if connected
    if (senderSocketId) {
        io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
    } else {
        io.to(`chat:${chatId}`).emit("message:new", message);
    }
};

/**
 * Emits a real-time update event containing the latest message preview for chat list items.
 * Delivered to each participant's private user room (`user:<participantId>`).
 *
 * @param participantIds - List of user IDs involved in the chat.
 * @param chatId - Target chat room ID.
 * @param lastMessage - The updated last message payload.
 */
export const emitLastMessageToParticipants = (
    participantIds: string[],
    chatId: string,
    lastMessage: any
) => {
    const io = getIO();
    const payload = { chatId, lastMessage };

    for (const participantId of participantIds) {
        io.to(`user:${participantId}`).emit("chat:update", payload);
    }
};