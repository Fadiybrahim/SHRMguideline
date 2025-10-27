import React from 'react';
import { Bot, User } from 'lucide-react';
import { marked } from 'marked';

interface ChatMessageProps {
    role: 'user' | 'model';
    content: string;
    isLoading?: boolean;
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(\n\nReferences:.*)/s);
    let mainContent = parts[0];
    const references = parts[1] ? parts[1].trim() : null;

    if (references) {
        // This regex finds list items (starting with * or -) and captures their text content.
        const quoteRegex = /[-*]\s*["']?(.*?)["']?\s*$/gm;
        const quotes = [];
        let match;
        while ((match = quoteRegex.exec(references)) !== null) {
            const quoteText = match[1].trim();
            if (quoteText) {
                quotes.push(quoteText);
            }
        }

        // Function to escape special characters for use in a RegExp
        const escapeRegExp = (string: string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        quotes.forEach(quote => {
            const escapedQuote = escapeRegExp(quote);
            // Replace all occurrences of the quote in the main content with a highlighted version
            mainContent = mainContent.replace(
                new RegExp(escapedQuote, 'g'),
                `<mark class="bg-blue-200 dark:bg-blue-800/60 rounded px-1 py-0.5">${quote}</mark>`
            );
        });
    }

    const parsedMainContent = marked.parse(mainContent.trim());
    const parsedReferences = references ? marked.parse(references) : null;

    return (
        <div>
            <div
                className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside"
                dangerouslySetInnerHTML={{ __html: parsedMainContent as string }}
            />
            {parsedReferences && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside"
                        dangerouslySetInnerHTML={{ __html: parsedReferences as string }}
                    />
                </div>
            )}
        </div>
    );
}


export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isLoading }) => {
    const isModel = role === 'model';

    return (
        <div className={`flex items-start gap-4 ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isModel ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {isModel ? <Bot size={24} /> : <User size={24} />}
            </div>
            <div className={`max-w-xl p-4 rounded-xl shadow-md ${isModel ? 'bg-blue-50 dark:bg-blue-900/50 text-gray-800 dark:text-gray-200' : 'bg-white dark:bg-gray-700'}`}>
                {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                ) : (
                    <ChatMessageContent content={content} />
                )}
            </div>
        </div>
    );
};
