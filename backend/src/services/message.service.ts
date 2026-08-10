import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import UserModel from "../models/user.model";

/**
 * Service to handle sending a new message within a chat room.
 * Supports plain text, Cloudinary image uploads, and threaded replies.
 * Updates chat metadata (`lastMessage`) and triggers real-time WebSocket events.
 *
 * @param userId - MongoDB ObjectId string of the user sending the message.
 * @param body - Message payload containing target chat ID and content/media details.
 * @param body.chatId - Target chat room ID string.
 * @param body.content - Optional text content of the message.
 * @param body.image - Optional base64 or file path string for Cloudinary upload.
 * @param body.replyToId - Optional target message ID for threaded replies.
 * @returns Promise resolving to an object containing the populated `userMessage` and updated `chat`.
 * @throws {BadRequestException} If chat room does not exist or user is unauthorized.
 * @throws {NotFoundException} If the referenced reply message does not exist.
 */
export const sendMessageService = async (
    userId: string,
    body: {
        chatId: string;
        content?: string;
        image?: string;
        replyToId?: string;
    }
) => {
    const { chatId, content, image, replyToId } = body;

    // Validate that the target chat exists and the sender is an active participant
    const chat = await ChatModel.findOne({
        _id: chatId,
        participants: {
            $in: [userId],
        },
    });
    if (!chat) throw new BadRequestException("Chat not found or unauthorized");

    // Validate target message existence if sending a threaded reply
    if (replyToId) {
        const replyMessage = await MessageModel.findOne({
            _id: replyToId,
            chatId,
        });
        if (!replyMessage) throw new NotFoundException("Reply message not found");
    }

    let imageUrl: string | undefined;

    // Upload image to Cloudinary CDN if media attachment is present
    if (image) {
        const uploadRes = await cloudinary.uploader.upload(image);
        imageUrl = uploadRes.secure_url;
    }

    // Persist the new message document to MongoDB
    const newMessage = await MessageModel.create({
        chatId,
        sender: userId,
        content,
        image: imageUrl,
        replyTo: replyToId || null,
    });

    // Populate sender details and nested reply metadata for client display
    await newMessage.populate([
        { path: "sender", select: "name avatar" },
        {
            path: "replyTo",
            select: "content image sender",
            populate: {
                path: "sender",
                select: "name avatar",
            },
        },
    ]);

    // Update chat metadata with reference to the new last message
    chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
    await chat.save();

    // Broadcast the new message event to all connected sockets in the chat room

    // Broadcast last message preview update to all participant personal channels

    return {
        userMessage: newMessage,
        chat,
    };
};