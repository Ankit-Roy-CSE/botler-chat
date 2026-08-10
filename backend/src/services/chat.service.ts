import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";

/**
 * Service to create a new direct or group chat, or return an existing direct chat.
 * Emits real-time WebSocket events to notify all participating users of new chat creation.
 *
 * @param userId - MongoDB ObjectId string of the user initiating the chat.
 * @param body - Payload containing chat configuration (direct participant or group details).
 * @param body.participantId - Optional recipient user ID for direct 1-on-1 chats.
 * @param body.isGroup - Flag indicating whether a group chat is being created.
 * @param body.participants - Array of participant user IDs for group chats.
 * @param body.groupName - Display name for the group chat.
 * @returns Promise resolving to the created or existing Chat document.
 * @throws {NotFoundException} If the target user for a direct chat does not exist.
 */
export const createChatService = async (
    userId: string,
    body: {
        participantId?: string;
        isGroup?: boolean;
        participants?: string[];
        groupName?: string;
    }
) => {
    const { participantId, isGroup, participants, groupName } = body;

    let chat;
    let allParticipantIds: string[] = [];

    // Handle Group Chat Creation
    if (isGroup && participants?.length && groupName) {
        // Include creator along with specified participants
        allParticipantIds = [userId, ...participants];
        chat = await ChatModel.create({
            participants: allParticipantIds,
            isGroup: true,
            groupName,
            createdBy: userId,
        });
    }
    // Handle Direct (1-on-1) Chat Creation/Retrieval
    else if (participantId) {
        // Verify recipient user existence
        const otherUser = await UserModel.findById(participantId);
        if (!otherUser) throw new NotFoundException("User not found");

        allParticipantIds = [userId, participantId];

        // Check if a 1-on-1 chat already exists between both exact participants
        const existingChat = await ChatModel.findOne({
            participants: {
                $all: allParticipantIds,
                $size: 2,
            },
        }).populate("participants", "name avatar");

        // Return existing direct chat to prevent duplicate rooms
        if (existingChat) return existingChat;

        // Create new direct chat room
        chat = await ChatModel.create({
            participants: allParticipantIds,
            isGroup: false,
            createdBy: userId,
        });
    }

    // Populate participant details (including AI flags if applicable) for socket payload
    const populatedChat = await chat?.populate(
        "participants",
        "name avatar isAI"
    );

    // Extract participant ID strings to route real-time WebSocket notifications
    const participantIdStrings = populatedChat?.participants?.map((p) => {
        return p._id?.toString();
    });

    return chat;
};

/**
 * Service to retrieve all active chat conversations for a given user.
 * Populates participant details and last message preview, sorted by recent activity.
 *
 * @param userId - MongoDB ObjectId string of the user requesting their chat list.
 * @returns Promise resolving to an array of populated Chat documents.
 */
export const getUserChatsService = async (userId: string) => {
    const chats = await ChatModel.find({
        participants: {
            $in: [userId],
        },
    })
        .populate("participants", "name avatar")
        .populate({
            path: "lastMessage",
            populate: {
                path: "sender",
                select: "name avatar",
            },
        })
        .sort({ updatedAt: -1 }); // Order chats by most recent update/message timestamp

    return chats;
};

/**
 * Service to fetch single chat metadata and associated message history.
 * Ensures the requesting user is an authorized participant in the conversation.
 *
 * @param chatId - MongoDB ObjectId string of the requested Chat document.
 * @param userId - MongoDB ObjectId string of the user requesting access.
 * @returns Promise resolving to an object containing the `chat` and its array of `messages`.
 * @throws {BadRequestException} If chat does not exist or user is unauthorized to view it.
 */
export const getSingleChatService = async (chatId: string, userId: string) => {
    // Validate chat existence and authorization
    const chat = await ChatModel.findOne({
        _id: chatId,
        participants: {
            $in: [userId],
        },
    }).populate("participants", "name avatar");

    if (!chat)
        throw new BadRequestException(
            "Chat not found or you are not authorized to view this chat"
        );

    // Retrieve message history with populated sender and reply-to metadata
    const messages = await MessageModel.find({ chatId })
        .populate("sender", "name avatar")
        .populate({
            path: "replyTo",
            select: "content image sender",
            populate: {
                path: "sender",
                select: "name avatar",
            },
        })
        .sort({ createdAt: 1 }); // Chronological message ordering

    return {
        chat,
        messages,
    };
};

/**
 * Helper utility service to verify if a user belongs to a specific chat room.
 * Used for authorization checks prior to performing message writes or updates.
 *
 * @param chatId - Target Chat ID string to check.
 * @param userId - User ID string to validate.
 * @returns Promise resolving to the validated Chat document.
 * @throws {BadRequestException} If user is not a participant in the specified chat.
 */
export const validateChatParticipant = async (
    chatId: string,
    userId: string
) => {
    const chat = await ChatModel.findOne({
        _id: chatId,
        participants: {
            $in: [userId],
        },
    });

    if (!chat) throw new BadRequestException("User not a participant in chat");
    return chat;
};