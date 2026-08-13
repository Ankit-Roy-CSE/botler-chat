import ChatBody from "@/components/chat/chat-body";
import ChatHeader from "@/components/chat/chat-header";
import ChatFooter from "@/components/chat/chat-footer";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import type { MessageType } from "@/types/chat.type";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import { useEffect, useState } from "react";

/**
 * SingleChat Component.
 * Primary chat view component that renders the active conversation container.
 * Handles single-chat data fetching, real-time Socket.io room subscriptions (`chat:join` / `chat:leave`),
 * threaded message reply state management, and component layout composition (`ChatHeader`, `ChatBody`, `ChatFooter`).
 */
const SingleChat = () => {
    // Custom hook extracting the active chat ID from URL params/location
    const chatId = useChatId();

    // Chat context hook for fetching active room details and message history
    const { fetchSingleChat, isSingleChatLoading, singleChat, addNewMessage } = useChat();

    // Global real-time socket instance
    const { socket } = useSocket();

    // Authenticated user state hook
    const { user } = useAuth();

    // Local state for tracking the target message being replied to
    const [replyTo, setReplyTo] = useState<MessageType | null>(null);

    const currentUserId = user?._id || null;
    const chat = singleChat?.chat;
    const messages = singleChat?.messages || [];

    // Fetch initial chat metadata and message history when chatId changes
    useEffect(() => {
        if (!chatId) return;
        fetchSingleChat(chatId);
    }, [fetchSingleChat, chatId]);

    /**
     * Socket.io Effect: Emits `chat:join` to subscribe the socket client
     * to real-time events in this chat room. On unmount or route change,
     * emits `chat:leave` to unsubscribe.
     */
    useEffect(() => {
        if (!chatId || !socket) return;

        socket.emit("chat:join", chatId);

        // Cleanup: Leave room on component unmount or chatId change
        return () => {
            socket.emit("chat:leave", chatId);
        };
    }, [chatId, socket]);

    /**
     * Socket.io Effect: Listens for incoming `message:new` events for the active room.
     * Kept here (not in ChatBody) so the listener is always active even when
     * the messages list is empty and ChatBody is not rendered.
     */
    useEffect(() => {
        if (!chatId || !socket) return;

        const handleNewMessage = (msg: MessageType) => addNewMessage(chatId, msg);

        socket.on("message:new", handleNewMessage);

        return () => {
            socket.off("message:new", handleNewMessage);
        };
    }, [chatId, socket, addNewMessage]);

    // Render fullscreen spinner while chat and message history load
    if (isSingleChatLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner className="w-11 h-11 !text-primary" />
            </div>
        );
    }

    // Fallback UI if the requested chat room is invalid or unauthorized
    if (!chat) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-lg">Chat not found</p>
            </div>
        );
    }

    return (
        <div className="relative h-svh flex flex-col">
            {/* Top Navigation & Participant Details Header */}
            <ChatHeader chat={chat} currentUserId={currentUserId} />

            {/* Scrollable Message Body Container */}
            <div className="flex-1 overflow-y-auto bg-background">
                {messages.length === 0 ? (
                    /* Empty Chat History Placeholder */
                    <EmptyState
                        title="Start a conversation"
                        description="No messages yet. Send the first message"
                    />
                ) : (
                    /* Render Message List & Threaded Reply Action Handlers */
                    <ChatBody messages={messages} onReply={setReplyTo} />
                )}
            </div>

            {/* Message Input, Media Uploads & Reply Context Footer */}
            <ChatFooter
                replyTo={replyTo}
                chatId={chatId}
                currentUserId={currentUserId}
                onCancelReply={() => setReplyTo(null)}
            />
        </div>
    );
};

export default SingleChat;