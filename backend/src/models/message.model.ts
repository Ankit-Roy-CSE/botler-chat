import mongoose, { Document, Schema } from "mongoose";

/**
 * TypeScript Interface representing a Message document in MongoDB.
 * Captures core text content, media attachments, sender metadata, and threaded replies.
 */
export interface MessageDocument extends Document {
    chatId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content?: string;
    image?: string;
    replyTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Schema definition for the `Message` collection.
 */
const messageSchema = new Schema<MessageDocument>(
    {
        // Reference to the Chat conversation (direct or group) this message belongs to
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        // Plain text content of the message
        content: {
            type: String
        },
        // URL/path to an attached image hosted on Cloudinary
        image: {
            type: String
        },
        // Reference to the User who authored and sent this message
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Optional reference to a parent Message document for threaded replies
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    {
        // Automatically manages `createdAt` and `updatedAt` timestamps
        timestamps: true,
    }
);

/**
 * Compiled Mongoose model for performing database operations on the `Message` collection.
 */
const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);

export default MessageModel;