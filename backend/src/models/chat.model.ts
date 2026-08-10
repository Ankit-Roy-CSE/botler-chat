import mongoose, { Document, Schema } from "mongoose";

/**
 * TypeScript Interface representing a Chat document in MongoDB.
 * Defines the structure for both one-on-one direct messages and group chats.
 */
export interface ChatDocument extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage: mongoose.Types.ObjectId;
    isGroup: boolean;
    groupName: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Schema definition for the `Chat` collection.
 */
const chatSchema = new Schema<ChatDocument>(
    {
        // Array of references to the Users involved in this conversation
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        // Reference to the most recent Message document for chat list previews
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        // Flag indicating whether the conversation is a multi-user group chat
        isGroup: {
            type: Boolean,
            default: false,
        },
        // Optional display name for group conversations (relevant if isGroup is true)
        groupName: {
            type: String,
        },
        // Reference to the User who created the chat or group room
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        // Automatically manages `createdAt` and `updatedAt` timestamps
        timestamps: true,
    }
);

/**
 * Compiled Mongoose model for performing database operations on the `Chat` collection.
 */
const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default ChatModel;