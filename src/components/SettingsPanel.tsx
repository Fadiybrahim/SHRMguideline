import React from 'react';
import { BookUser, MessageSquareQuote, Plus, LogOut, Trash2, User as UserIcon, Pencil } from 'lucide-react';
import type { User, Conversation } from '../types';

interface SettingsPanelProps {
    user: User;
    onLogout: () => void;
    systemPrompt: string;
    setSystemPrompt: (prompt: string) => void;
    isLoading: boolean;
    maxOutputTokens: number;
    setMaxOutputTokens: (value: number) => void;
    conversations: Conversation[];
    activeConversationId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    user,
    onLogout,
    systemPrompt, 
    setSystemPrompt, 
    isLoading, 
    maxOutputTokens, 
    setMaxOutputTokens,
    conversations,
    activeConversationId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onRenameChat
}) => {

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent the chat from being selected when deleting
        if (window.confirm('Are you sure you want to delete this chat?')) {
            onDeleteChat(id);
        }
    };

    const handleRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
        e.stopPropagation();
        const newTitle = window.prompt("Enter new chat title:", currentTitle);
        if (newTitle && newTitle.trim() !== "") {
            onRenameChat(id, newTitle.trim());
        }
    };

    return (
        <aside className="w-full h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <header className="pb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SHRM Guideline</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chat with the knowledge base.</p>
            </header>

            <div className="flex-grow flex flex-col space-y-4 pt-4 overflow-y-hidden">
                {/* Chat History Section */}
                <div className="flex-shrink-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Chat History</h2>
                        <button
                            onClick={onNewChat}
                            className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="New Chat"
                            disabled={isLoading}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-1" style={{maxHeight: '200px'}}>
                        {conversations.length > 0 ? (
                            conversations.map(convo => (
                                <div
                                    key={convo.id}
                                    onClick={() => !isLoading && onSelectChat(convo.id)}
                                    className={`group flex justify-between items-center w-full px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm ${
                                        activeConversationId === convo.id 
                                            ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500' 
                                            : 'border-l-4 border-transparent hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    } ${isLoading ? 'cursor-not-allowed' : ''}`}
                                >
                                    <span className={`truncate font-medium ${
                                        activeConversationId === convo.id 
                                            ? 'text-blue-700 dark:text-blue-300' 
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>{convo.title}</span>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleRename(e, convo.id, convo.title)}
                                            className="p-1 text-gray-400 hover:text-blue-500"
                                            aria-label="Rename chat"
                                            disabled={isLoading}
                                        >
                                            <Pencil size={16}/>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(e, convo.id)}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                            aria-label="Delete chat"
                                            disabled={isLoading}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
                                No chat history.
                            </div>
                        )}
                    </div>
                </div>

                 {/* Settings */}
                <div className="flex-grow flex flex-col space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center text-gray-800 dark:text-gray-200 mb-2">
                            <BookUser className="mr-2 h-5 w-5" />
                            Bot Instructions
                        </h2>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={6}
                            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
                            placeholder="Define the bot's persona and instructions..."
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold flex items-center text-gray-800 dark:text-gray-200 mb-2">
                            <MessageSquareQuote className="mr-2 h-5 w-5" />
                            Response Length
                        </h2>
                        <div className="flex items-center space-x-4 mt-2">
                            <input
                                type="range"
                                min="128"
                                max="8192"
                                step="128"
                                value={maxOutputTokens}
                                onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                                disabled={isLoading}
                            />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-16 text-center">{maxOutputTokens}</span>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                     <div className="flex items-center min-w-0">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{user.username}</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </footer>
        </aside>
    );
};
