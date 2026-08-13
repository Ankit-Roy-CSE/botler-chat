import type { MessageType } from "@/types/chat.type";
import { useEffect, useRef } from "react";
import ChatBodyMessage from "./chat-body-message";

/**
 * Props type interface for the ChatBody component.
 */
interface Props {
    /** Array of Message objects to render in chronological order. */
    messages: MessageType[];
    /** Callback handler triggered when a user selects a message to reply to. */
    onReply: (message: MessageType) => void;
}

/**
 * ChatBody Component.
 * Renders the scrollable message stream container inside an active conversation.
 * Handles automatic smooth scrolling to the bottom whenever the message state updates.
 * Real-time `message:new` socket subscriptions are managed by the parent `SingleChat` component.
 */
const ChatBody = ({ messages, onReply }: Props) => {
    // Reference marker attached to an anchor div at the bottom of the message list
    const bottomRef = useRef<HTMLDivElement | null>(null);

    /**
     * Auto-Scroll Effect: Smoothly scrolls the chat viewport down to the latest message
     * whenever the `messages` array updates.
     */
    useEffect(() => {
        if (!messages.length) return;
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col px-3 py-2">
            {/* Map and render message items */}
            {messages.map((message) => (
                <ChatBodyMessage
                    key={message._id}
                    message={message}
                    onReply={onReply}
                />
            ))}

            {/* Scroll anchor element target */}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatBody;