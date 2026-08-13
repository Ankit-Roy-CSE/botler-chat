import { getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat.type";
import { useLocation } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { formatChatTime } from "../../lib/helper";

/**
 * Props type interface for the ChatListItem component.
 */
interface PropsType {
    /** The chat object containing participant, message, and metadata details. */
    chat: ChatType;
    /** The current logged-in user's ID to differentiate sender vs. recipient details. */
    currentUserId: string | null;
    /** Optional click handler callback to select/route to this chat room. */
    onClick?: () => void;
}

/**
 * ChatListItem Component.
 * Renders an individual chat row in the sidebar list.
 * Automatically resolves display name, avatar, online status indicator, last message preview,
 * and time formatting for both 1-on-1 and group chats.
 */
const ChatListItem = ({ chat, currentUserId, onClick }: PropsType) => {
    const { pathname } = useLocation();
    const { lastMessage, createdAt } = chat;

    // Helper to extract display details (other user's name/avatar for DMs, group name/avatar for groups)
    const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
        chat,
        currentUserId
    );

    /**
     * Formats and returns the string preview for the last message in the chat list.
     * Handles empty chats, image attachments, and group chat sender prefixes.
     *
     * @returns Formatted preview string.
     */
    const getLastMessageText = () => {
        // Fallback text if no messages exist yet in the chat
        if (!lastMessage) {
            return isGroup
                ? chat.createdBy === currentUserId
                    ? "Group created"
                    : "You were added"
                : "Send a message";
        }

        // Image attachment preview
        if (lastMessage.image) return "📷 Photo";

        // Group chat prefix formatting (e.g. "John: Hello" or "You: Hello")
        if (isGroup && lastMessage.sender) {
            return `${lastMessage.sender._id === currentUserId
                ? "You"
                : lastMessage.sender.name
                }: ${lastMessage.content}`;
        }

        // Standard direct message content
        return lastMessage.content;
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                `w-full flex items-center gap-2 p-2 rounded-sm
         hover:bg-sidebar-accent transition-colors text-left`,
                // Highlight active item if the current URL matches the chat ID
                pathname.includes(chat._id) && "!bg-sidebar-accent"
            )}
        >
            {/* User or Group Avatar with Online Status Badge */}
            <AvatarWithBadge
                name={name}
                src={avatar}
                isGroup={isGroup}
                isOnline={isOnline}
            />

            {/* Chat Item Details Container */}
            <div className="flex-1 min-w-0">
                <div
                    className="
          flex items-center justify-between mb-0.5
        "
                >
                    {/* Chat or User Display Name */}
                    <h5 className="text-sm font-semibold truncate">{name}</h5>

                    {/* Formatted Timestamp of Last Message or Chat Creation */}
                    <span
                        className="text-xs
           ml-2 shrink-0 text-muted-foreground
          "
                    >
                        {formatChatTime(lastMessage?.updatedAt || createdAt)}
                    </span>
                </div>

                {/* Truncated Message Content / Status Preview */}
                <p className="text-xs truncate text-muted-foreground -mt-px">
                    {getLastMessageText()}
                </p>
            </div>
        </button>
    );
};

export default ChatListItem;