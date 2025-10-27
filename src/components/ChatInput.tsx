import React, { useState, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Strategic Human Resource Management..."
                rows={1}
                className="flex-1 p-2 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
                disabled={disabled}
                style={{ maxHeight: '150px' }}
            />
            <button
                onClick={handleSubmit}
                disabled={disabled || !input.trim()}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Send message"
            >
                <SendHorizonal size={20} />
            </button>
        </div>
    );
};
