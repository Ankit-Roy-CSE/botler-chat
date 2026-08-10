import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

/**
 * TypeScript Interface representing a User document in MongoDB.
 * Extends Mongoose's `Document` interface to include instance methods and auto-generated fields.
 */
export interface UserDocument extends Document {
    name: string;
    email?: string;
    password?: string;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;

    /**
     * Instance method to compare a plain text password with the stored hashed password.
     * 
     * @param value - Plain text password string to verify.
     * @returns Promise resolving to `true` if passwords match, `false` otherwise.
     */
    comparePassword(value: string): Promise<boolean>;
}

/**
 * Mongoose Schema definition for the `User` collection.
 */
const userSchema = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: null
        },
    },
    {
        // Automatically manages `createdAt` and `updatedAt` timestamps
        timestamps: true,
        // Global transformation options when serializing document instances to JSON
        toJSON: {
            transform: (doc, ret) => {
                if (ret) {
                    // Prevent sensitive password hashes from leaking in API responses
                    delete (ret as any).password;
                }
                return ret;
            },
        },
    }
);

/**
 * Pre-save Mongoose middleware hook.
 * Automatically hashes the user's password using bcrypt before saving to the database
 * whenever the password field is created or modified.
 */
userSchema.pre("save", async function (next) {
    if (this.password && this.isModified("password")) {
        this.password = await hashValue(this.password);
    }
    next();
});

/**
 * Custom instance method implementation for verifying user passwords.
 *
 * @param val - Plain text password string provided during authentication.
 * @returns Promise resolving to a boolean verification status.
 */
userSchema.methods.comparePassword = async function (val: string) {
    return compareValue(val, this.password);
};

/**
 * Compiled Mongoose model for performing database operations on the `User` collection.
 */
const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;