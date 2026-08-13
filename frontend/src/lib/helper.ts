import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "@/hooks/use-socket";
import type { ChatType } from "@/types/chat.type";

/**
 * Checks if a specific user is currently online by reading directly from the Zustand socket store.
 * Note: This uses `.getState()` to read outside the React render cycle, making it safe for standard utility functions.
 *
 * @param userId - The unique identifier of the user to check.
 * @returns `true` if the user is in the online users list, `false` otherwise.
 */
export const isUserOnline = (userId?: string): boolean => {
    if (!userId) return false;

    const { onlineUsers } = useSocket.getState();
    return onlineUsers.includes(userId);
};

/**
 * Normalizes chat metadata for the UI (like sidebars and headers) so components don't have to
 * write conditional logic for Group vs. Direct Message (1-on-1) chats.
 *
 * @param chat - The full chat object containing participant data and group flags.
 * @param currentUserId - The ID of the currently authenticated user (to filter them out of 1-on-1 chats).
 * @returns A standardized object containing a `name`, `subheading`, `avatar`, and boolean flags.
 */
export const getOtherUserAndGroup = (
    chat: ChatType,
    currentUserId: string | null
) => {
    const isGroup = chat?.isGroup;

    // Handle Group Chats
    if (isGroup) {
        return {
            name: chat.groupName || "Unnamed Group",
            subheading: `${chat.participants.length} members`,
            avatar: "", // Groups might not have avatars by default, or you can map a group icon here
            isGroup,
        };
    }

    // Handle Direct Messages (1-on-1)
    // Find the participant that is NOT the currently logged-in user
    const other = chat?.participants.find((p) => p._id !== currentUserId);
    const isOnline = isUserOnline(other?._id ?? "");

    return {
        name: other?.name || "Unknown",
        subheading: isOnline ? "Online" : "Offline",
        avatar: other?.avatar || "",
        isGroup: false,
        isOnline,
        isAI: other?.isAI || false, // Flag for specific AI bot interactions
    };
};

/**
 * Formats a raw date string or Date object into a human-readable, relative time string.
 * Used for displaying timestamps in chat bubbles and sidebar previews.
 *
 * @param date - The timestamp to format (ISO string or Date object).
 * @returns A formatted string based on how old the message is.
 * 
 * @example
 * // Today -> "2:30 PM"
 * // Yesterday -> "Yesterday"
 * // Within the last 7 days -> "Wednesday"
 * // Older than a week -> "8/11" (Month/Day)
 */
export const formatChatTime = (date: string | Date): string => {
    if (!date) return "";

    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "Invalid date";

    if (isToday(newDate)) return format(newDate, "h:mm a"); // e.g., 2:30 PM
    if (isYesterday(newDate)) return "Yesterday";           // e.g., Yesterday
    if (isThisWeek(newDate)) return format(newDate, "EEEE"); // e.g., Monday

    return format(newDate, "M/d"); // e.g., 10/24 (October 24th)
};

/**
 * Generates a standard v4 UUID (Universally Unique Identifier).
 * Used primarily for creating temporary IDs for Optimistic UI updates before the server responds.
 *
 * @returns A unique string UUID.
 */
export function generateUUID(): string {
    return uuidv4();
}