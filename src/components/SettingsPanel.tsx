import React from 'react';
import { BookUser, KeyRound, MessageSquareQuote } from 'lucide-react';

interface SettingsPanelProps {
    systemPrompt: string;
    setSystemPrompt: (prompt: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    isLoading: boolean;
    maxOutputTokens: number;
    setMaxOutputTokens: (value: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ systemPrompt, setSystemPrompt, apiKey, setApiKey, isLoading, maxOutputTokens, setMaxOutputTokens }) => {
    return (
        <aside className="w-full h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Strategic Human Resource Management Guideline</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chat with the provided knowledge base.</p>
            </header>

            <div className="flex-grow flex flex-col space-y-6 overflow-y-auto">
                {/* API Key Section */}
                <div>
                    <h2 className="text-lg font-semibold flex items-center text-gray-800 dark:text-gray-200 mb-2">
                        <KeyRound className="mr-2 h-5 w-5" />
                        API Key
                    </h2>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
                        placeholder="Enter your Gemini API key"
                        disabled={isLoading}
                    />
                </div>
                
                {/* System Prompt Section */}
                <div>
                    <h2 className="text-lg font-semibold flex items-center text-gray-800 dark:text-gray-200 mb-2">
                        <BookUser className="mr-2 h-5 w-5" />
                        Bot Instructions
                    </h2>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={8}
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
                        placeholder="Define the bot's persona and instructions..."
                        disabled={isLoading}
                    />
                </div>

                {/* Response Length Section */}
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
            <footer className="text-xs text-center text-gray-400 dark:text-gray-500">
                <p>Powered by Google Gemini</p>
            </footer>
        </aside>
    );
};
