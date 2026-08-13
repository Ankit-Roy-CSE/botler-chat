import { Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";
import { NewChatPopover } from "./newchat-popover";

/**
 * Props type interface for the ChatListHeader component.
 */
interface ChatListHeaderProps {
    /** Callback handler triggered on search input value changes. */
    onSearch: (val: string) => void;
}

/**
 * ChatListHeader Component.
 * Displays the header section above the chat list sidebar.
 * Includes the main title, action button to initiate new direct/group chats via `NewChatPopover`,
 * and a search input field to filter existing conversations.
 */
const ChatListHeader = ({ onSearch }: ChatListHeaderProps) => {
    return (
        <div className="px-3 py-3 border-b border-border">
            {/* Header Title & New Chat Action Button */}
            <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Chat</h1>
                <div>
                    {/* Popover trigger component for creating a new 1-on-1 or group chat */}
                    <NewChatPopover />
                </div>
            </div>

            {/* Client-side Search Input Field */}
            <div>
                <InputGroup className="bg-background text-sm">
                    <InputGroupInput
                        placeholder="Search..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </div>
    );
};

export default ChatListHeader;