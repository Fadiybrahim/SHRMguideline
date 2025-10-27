import React, { useRef, useEffect } from 'react';
import type { ChatMessage as Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Bot } from 'lucide-react';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    onSendMessage: (message: string) => void;
    followUpQuestions: string[];
}

const initialSuggestedQuestions = [
    "How do you align HR strategy?",
    "How can you motivate employees effectively?",
    "Which HR activity adds indirect value?",
    "Which global body sets labor standards?",
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, error, onSendMessage, followUpQuestions }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSuggestionClick = (question: string) => {
        if (!isLoading) {
            onSendMessage(question);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && !error ? (
                     <div className="text-center mt-8">
                        <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Bot size={40} className="text-blue-600 dark:text-blue-300" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-200">Strategic Human Resource Management Guideline</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">What questions do you have about the Strategic Human Resource Management guideline?</p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {initialSuggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(q)}
                                    disabled={isLoading}
                                    className="p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <ChatMessage key={index} role={msg.role} content={msg.content} />
                    ))
                )}
                {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                     <ChatMessage role="model" content="Thinking..." isLoading={true} />
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                
                {messages.length > 0 && !isLoading && followUpQuestions.length > 0 && (
                     <div className="mb-4">
                         <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Suggested follow-ups:</p>
                         <div className="flex flex-wrap gap-2">
                             {followUpQuestions.map((q, i) => (
                                 <button
                                     key={i}
                                     onClick={() => handleSuggestionClick(q)}
                                     className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                                 >
                                     {q}
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}

                <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};
