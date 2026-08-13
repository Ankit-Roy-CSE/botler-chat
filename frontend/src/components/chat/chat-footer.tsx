import { z } from "zod";
import type { MessageType } from "@/types/chat.type";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Paperclip, Send, X } from "lucide-react";
import { Form, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import ChatReplyBar from "./chat-reply-bar";
import { useChat } from "@/hooks/use-chat";

/**
 * Props type interface for the ChatFooter component.
 */
interface Props {
    /** Target active chat room ID string. */
    chatId: string | null;
    /** Current logged-in user's ObjectId string. */
    currentUserId: string | null;
    /** Target message object being replied to, or null if no active reply thread. */
    replyTo: MessageType | null;
    /** Callback handler to clear/cancel the active threaded reply state. */
    onCancelReply: () => void;
}

/**
 * ChatFooter Component.
 * Primary input action bar fixed at the bottom of the active conversation viewport.
 * Manages text input state via React Hook Form and Zod, local image selection & Base64 preview reading,
 * image attachment removal, message dispatch via `useChat`, and threaded reply preview bars (`ChatReplyBar`).
 */
const ChatFooter = ({
    chatId,
    currentUserId,
    replyTo,
    onCancelReply,
}: Props) => {
    // Zod validation schema allowing optional text message (when sending image only)
    const messageSchema = z.object({
        message: z.string().optional(),
    });

    // Chat context hook providing message dispatch operations and pending states
    const { sendMessage, isSendingMsg } = useChat();

    // Local Base64 string preview state for attached image file
    const [image, setImage] = useState<string | null>(null);

    // Direct ref pointer to hidden native file input element
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    // Initialize React Hook Form with Zod schema resolver
    const form = useForm({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            message: "",
        },
    });

    /**
     * File input change handler.
     * Validates selected file MIME type and converts image file to Base64 data URL string for preview & payload.
     *
     * @param e - React ChangeEvent triggered by input element.
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    /**
     * Resets selected image preview state and clears file input target value.
     */
    const handleRemoveImage = () => {
        setImage(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    /**
     * Form submission handler.
     * Validates non-empty input payload (text or image required), dispatches `sendMessage` payload,
     * resets form controls, clears image previews, and cancels active reply thread states.
     *
     * @param values - Form values object containing optional text message string.
     */
    const onSubmit = (values: { message?: string }) => {
        if (isSendingMsg) return;

        if (!values.message?.trim() && !image) {
            toast.error("Please enter a message or select an image");
            return;
        }

        const payload = {
            chatId,
            content: values.message,
            image: image || undefined,
            replyTo: replyTo,
        };

        // Dispatch message creation payload to API/socket layer
        sendMessage(payload);

        // Reset local input states
        onCancelReply();
        handleRemoveImage();
        form.reset();
    };

    return (
        <>
            <div
                className="sticky bottom-0
        inset-x-0 z-[999]
        bg-card border-t border-border py-4
      "
            >
                {/* Selected Image Attachment Preview Box */}
                {image && !isSendingMsg && (
                    <div className="max-w-6xl mx-auto px-8.5">
                        <div className="relative w-fit">
                            <img
                                src={image}
                                className="object-contain h-16 bg-muted min-w-16"
                            />

                            {/* Remove Attachment Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-px right-1
                  bg-black/50 text-white rounded-full
                  cursor-pointer
                "
                                onClick={handleRemoveImage}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Message Input Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="max-w-6xl px-8.5 mx-auto
            flex items-end gap-2
            "
                    >
                        {/* File Upload Attachment Trigger Button */}
                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={isSendingMsg}
                                className="rounded-full"
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>

                            {/* Hidden Native File Input Element */}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                disabled={isSendingMsg}
                                ref={imageInputRef}
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Text Message Field */}
                        <FormField
                            control={form.control}
                            name="message"
                            disabled={isSendingMsg}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Input
                                        {...field}
                                        autoComplete="off"
                                        placeholder="Type new message"
                                        className="min-h-[40px] bg-background"
                                    />
                                </FormItem>
                            )}
                        />

                        {/* Send Action Button */}
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-lg"
                            disabled={isSendingMsg}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Active Threaded Reply Preview Banner */}
            {replyTo && !isSendingMsg && (
                <ChatReplyBar
                    replyTo={replyTo}
                    currentUserId={currentUserId}
                    onCancel={onCancelReply}
                />
            )}
        </>
    );
};

export default ChatFooter;