import { useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Spinner } from "../ui/spinner";
import ChatListItem from "./chat-list-item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import ChatListHeader from "./chat-list-header";
import { useSocket } from "@/hooks/use-socket";
import type { ChatType } from "@/types/chat.type";
import type { MessageType } from "../../types/chat.type";

/**
 * ChatList Component.
 * Displays a sidebar list of active user chats (direct & group) with real-time updates.
 * Features client-side search filtering, Socket.io event listeners for new chats/messages,
 * and navigation routing.
 */
const ChatList = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();

    // Custom chat state management hook
    const {
        fetchChats,
        chats,
        isChatsLoading,
        addNewChat,
        updateChatLastMessage,
    } = useChat();

    // Authenticated user context
    const { user } = useAuth();
    const currentUserId = user?._id || null;

    // Search query state for client-side chat filtering
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Filters chats based on group name or other participants' names
     * matching the search query string.
     */
    const filteredChats =
        chats?.filter(
            (chat) =>
                chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.participants?.some(
                    (p) =>
                        p._id !== currentUserId &&
                        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
        ) || [];

    // Initial fetch of user chats on component mount
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    /**
     * Socket.io Effect: Listens for `chat:new` events to dynamically prepend
     * newly created direct or group chats to the list state.
     */
    useEffect(() => {
        if (!socket) return;

        const handleNewChat = (newChat: ChatType) => {
            console.log("Recieved new chat", newChat);
            addNewChat(newChat);
        };

        socket.on("chat:new", handleNewChat);

        return () => {
            socket.off("chat:new", handleNewChat);
        };
    }, [addNewChat, socket]);

    /**
     * Socket.io Effect: Listens for `chat:update` events to update the last message preview
     * and push active conversations to the top of the chat list.
     */
    useEffect(() => {
        if (!socket) return;

        const handleChatUpdate = (data: {
            chatId: string;
            lastMessage: MessageType;
        }) => {
            console.log("Recieved update on chat", data.lastMessage);
            updateChatLastMessage(data.chatId, data.lastMessage);
        };

        socket.on("chat:update", handleChatUpdate);

        return () => {
            socket.off("chat:update", handleChatUpdate);
        };
    }, [socket, updateChatLastMessage]);

    /**
     * Handles routing when a user clicks on a chat list item.
     *
     * @param id - MongoDB ObjectId string of the selected chat room.
     */
    const onRoute = (id: string) => {
        navigate(`/chat/${id}`);
    };

    return (
        <div
            className="fixed inset-y-0
      pb-20 lg:pb-0
      lg:max-w-[379px]
      lg:block
      border-r
      border-border
      bg-sidebar
      max-w-[calc(100%-40px)]
      w-full
      left-10
      z-[98]
    "
        >
            <div className="flex-col">
                {/* Search & Action Header */}
                <ChatListHeader onSearch={setSearchQuery} />

                {/* Scrollable Chat List Container */}
                <div
                    className="
          flex-1 h-[calc(100vh-100px)]
          overflow-y-auto        "
                >
                    <div className="px-2 pb-10 pt-1 space-y-1">
                        {/* Loading State Spinner */}
                        {isChatsLoading ? (
                            <div className="flex items-center justify-center">
                                <Spinner className="w-7 h-7" />
                            </div>
                        ) : filteredChats?.length === 0 ? (
                            /* Empty Filter Results / Zero Chats State */
                            <div className="flex items-center justify-center">
                                {searchQuery ? "No chat found" : "No chats created"}
                            </div>
                        ) : (
                            /* Render Filtered Chat List Items */
                            filteredChats?.map((chat) => (
                                <ChatListItem
                                    key={chat._id}
                                    chat={chat}
                                    currentUserId={currentUserId}
                                    onClick={() => onRoute(chat._id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatList;