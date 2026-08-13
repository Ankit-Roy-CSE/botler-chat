/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { UserType } from "@/types/auth.type";
import type {
    ChatType,
    CreateChatType,
    CreateMessageType,
    MessageType,
} from "@/types/chat.type";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { generateUUID } from "@/lib/helper";

/**
 * Interface representing the global Zustand state for chat management.
 * Includes data arrays, active selections, loading indicators, and API/Socket actions.
 */
interface ChatState {
    /** List of all conversation threads the current user is part of. */
    chats: ChatType[];
    /** List of all available users in the system to start chats with. */
    users: UserType[];
    /** The currently active chat window, containing the chat metadata and its message history. */
    singleChat: {
        chat: ChatType;
        messages: MessageType[];
    } | null;

    /** ID for tracking active AI response streams (if AI features are enabled). */
    currentAIStreamId: string | null;

    // Loading State Flags
    isChatsLoading: boolean;
    isUsersLoading: boolean;
    isCreatingChat: boolean;
    isSingleChatLoading: boolean;
    isSendingMsg: boolean;

    // API Actions
    /** Fetches all available users from the backend. */
    fetchAllUsers: () => void;
    /** Fetches all chat threads for the authenticated user. */
    fetchChats: () => void;
    /** Initiates a new chat thread with selected users. */
    createChat: (payload: CreateChatType) => Promise<ChatType | null>;
    /** Fetches the full message history and details for a specific chat ID. */
    fetchSingleChat: (chatId: string) => void;
    /** Sends a new message using an Optimistic UI update before confirming with the server. */
    sendMessage: (payload: CreateMessageType) => void;

    // Sync & Real-time (Socket) Actions
    /** Prepends a newly created or received chat to the top of the chat list. */
    addNewChat: (newChat: ChatType) => void;
    /** Updates the preview text of a chat in the sidebar and moves it to the top. */
    updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void;
    /** Appends a real-time incoming message to the active chat window. */
    addNewMessage: (chatId: string, message: MessageType) => void;
}

/**
 * Zustand hook for managing chat state, optimistic UI updates, and real-time socket synchronizations.
 */
export const useChat = create<ChatState>()((set, get) => ({
    // Initial Data State
    chats: [],
    users: [],
    singleChat: null,
    currentAIStreamId: null,

    // Initial Loading State
    isChatsLoading: false,
    isUsersLoading: false,
    isCreatingChat: false,
    isSingleChatLoading: false,
    isSendingMsg: false,

    fetchAllUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const { data } = await API.get("/user/all");
            set({ users: data.users });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    fetchChats: async () => {
        set({ isChatsLoading: true });
        try {
            const { data } = await API.get("/chat/all");
            set({ chats: data.chats });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch chats");
        } finally {
            set({ isChatsLoading: false });
        }
    },

    createChat: async (payload: CreateChatType) => {
        set({ isCreatingChat: true });
        try {
            const response = await API.post("/chat/create", {
                ...payload,
            });
            // Immediately add the newly created chat to the sidebar
            get().addNewChat(response.data.chat);
            toast.success("Chat created successfully");
            return response.data.chat;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create chat");
            return null;
        } finally {
            set({ isCreatingChat: false });
        }
    },

    fetchSingleChat: async (chatId: string) => {
        set({ isSingleChatLoading: true });
        try {
            const { data } = await API.get(`/chat/${chatId}`);
            set({ singleChat: data });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch chat history");
        } finally {
            set({ isSingleChatLoading: false });
        }
    },

    /**
     * Sends a message utilizing an Optimistic UI pattern:
     * 1. Creates a temporary message object with a local UUID.
     * 2. Immediately injects it into the UI so the user feels zero latency.
     * 3. Fires the API request to the backend.
     * 4. Swaps the temporary message with the definitive server response (actual ID, timestamps).
     */
    sendMessage: async (payload: CreateMessageType) => {
        set({ isSendingMsg: true });
        const { chatId, replyTo, content, image } = payload;

        // Retrieve current authenticated user for the temp message payload
        const { user } = useAuth.getState();
        if (!chatId || !user?._id) return;

        const tempUserId = generateUUID();

        // 1. Construct temporary optimistic message
        const tempMessage: MessageType = {
            _id: tempUserId,
            chatId,
            content: content || "",
            image: image || null,
            sender: user as any, // Cast required depending on exact MessageType structure
            replyTo: replyTo || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "sending...", // Visual cue for the user
        };

        // if (isAI) {
        //  // AI Feature Source code link =>
        // }

        // 2. Inject temporary message into the active chat UI immediately
        set((state) => {
            if (state.singleChat?.chat?._id !== chatId) return state;
            return {
                singleChat: {
                    ...state.singleChat,
                    messages: [...state.singleChat.messages, tempMessage],
                },
            };
        });

        // 3. Send actual request to the backend
        try {
            const { data } = await API.post("/chat/message/send", {
                chatId,
                content,
                image,
                replyToId: replyTo?._id,
            });

            const { userMessage } = data;

            // 4. Replace the temporary message with the confirmed server message
            set((state) => {
                if (!state.singleChat) return state;
                return {
                    singleChat: {
                        ...state.singleChat,
                        messages: state.singleChat.messages.map((msg) =>
                            msg._id === tempUserId ? userMessage : msg
                        ),
                    },
                };
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send message");
            // Optional improvement: You could remove the temp message here on failure, or mark it as "failed"
        } finally {
            set({ isSendingMsg: false });
        }
    },

    /**
     * Injects a new chat into the sidebar list. 
     * If it already exists, it bubbles it to the top (LIFO order).
     */
    addNewChat: (newChat: ChatType) => {
        set((state) => {
            const existingChatIndex = state.chats.findIndex(
                (c) => c._id === newChat._id
            );

            if (existingChatIndex !== -1) {
                // Chat exists: Remove it from current position and prepend to top
                return {
                    chats: [newChat, ...state.chats.filter((c) => c._id !== newChat._id)],
                };
            } else {
                // New chat: Prepend to top
                return {
                    chats: [newChat, ...state.chats],
                };
            }
        });
    },

    /**
     * Updates the preview string of a chat in the sidebar when a new message arrives.
     * Automatically bubbles that chat to the top of the list.
     */
    updateChatLastMessage: (chatId, lastMessage) => {
        set((state) => {
            const chat = state.chats.find((c) => c._id === chatId);
            if (!chat) return state;

            return {
                chats: [
                    // Create updated chat object and place at the very top
                    { ...chat, lastMessage },
                    // Filter out the old version of this chat
                    ...state.chats.filter((c) => c._id !== chatId),
                ],
            };
        });
    },

    /**
     * Appends an incoming message via WebSockets to the active single chat window,
     * ensuring it only updates if the user is currently looking at that specific chat.
     */
    addNewMessage: (chatId, message) => {
        const chat = get().singleChat;

        // Guard: Only append if the incoming message belongs to the currently open chat window
        if (chat?.chat._id === chatId) {
            set({
                singleChat: {
                    chat: chat.chat,
                    messages: [...chat.messages, message],
                },
            });
        }
    },
}));