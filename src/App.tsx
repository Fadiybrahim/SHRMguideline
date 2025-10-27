import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { ChatMessage, User, Conversation } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatWindow } from './components/ChatWindow';
import { Menu, X } from 'lucide-react';
import { pdfTextContent } from './services/knowledgeData';
import LoginScreen from './components/LoginScreen';
import { getConversations, saveConversations } from './services/db';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = 'AIzaSyCulqm4ty37zOew6o7M-ElBThkwA9Cyy6s';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful expert on the provided document. Answer user questions based ONLY on the information in the document. After your answer, provide a 'References' section with the exact quotes from the document that support your answer. Use markdown for formatting. If the answer is not in the document, say 'I cannot find the answer in the provided document.'");
    const [maxOutputTokens, setMaxOutputTokens] = useState<number>(1024);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const chatRef = useRef<Chat | null>(null);

    // Effect to handle user login and data loading
    useEffect(() => {
        if (currentUser) {
            const userHistory = getConversations(currentUser.username);
            if (userHistory.length > 0) {
                setConversations(userHistory);
                setActiveConversationId(userHistory[0].id);
            } else {
                handleNewChat();
            }
        } else {
            setConversations([]);
            setActiveConversationId(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Effect to persist conversations whenever they change
    useEffect(() => {
        if (currentUser && conversations.length > 0) {
            saveConversations(currentUser.username, conversations);
        }
    }, [conversations, currentUser]);


    useEffect(() => {
        if (!pdfTextContent.trim() || pdfTextContent.includes("PASTE YOUR FULL PDF TEXT CONTENT HERE")) {
            setError("Knowledge base is not configured. Please add the PDF text to services/knowledgeData.ts");
            setIsLoading(true); // Disable input
            return;
        }

        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            let fullSystemInstruction = systemPrompt;
            fullSystemInstruction += `\n\n--- DOCUMENT CONTEXT ---\n${pdfTextContent}`;

            const activeConversationHistory = conversations.find(c => c.id === activeConversationId)?.messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })) || [];

            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: activeConversationHistory,
                config: {
                    systemInstruction: fullSystemInstruction,
                    maxOutputTokens: maxOutputTokens,
                },
            });
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
             setError(`Failed to initialize Gemini. Check your API Key. ${errorMessage}`);
        }
        
    }, [systemPrompt, maxOutputTokens, activeConversationId, conversations]);

    const generateFollowUpQuestions = useCallback(async (userInput: string, modelResponse: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const model = 'gemini-2.5-flash';
            
            const prompt = `Based on the document context and the last user question and model answer, generate up to 3 relevant follow-up questions the user might ask next.

            DOCUMENT CONTEXT (first 3000 chars):
            """
            ${pdfTextContent.substring(0, 3000)}...
            """

            LAST CONVERSATION TURN:
            User: "${userInput}"
            Model: "${modelResponse}"

            Generate 3 concise follow-up questions.`;

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            
            const jsonText = response.text.trim();
            const parsed = JSON.parse(jsonText);
            if (parsed.questions && Array.isArray(parsed.questions)) {
                 setFollowUpQuestions(parsed.questions.slice(0, 3));
            }

        } catch (e) {
            console.error("Failed to generate follow-up questions:", e);
        }
    }, []);

    const generateAndSetTitle = useCallback(async (conversationId: string, convoMessages: ChatMessage[]) => {
        if (convoMessages.length === 0) return;

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const model = 'gemini-2.5-flash';
            
            const historyForTitle = convoMessages
                .map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.content}`)
                .join('\n');

            const prompt = `Based on the following conversation, create a concise title of exactly 3 words. Only return the title text, nothing else.\n\nCONVERSATION:\n${historyForTitle}`;

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            
            const newTitle = response.text.trim().replace(/["']/g, "");

            if (newTitle) {
                setConversations(prev => 
                    prev.map(c => 
                        c.id === conversationId ? { ...c, title: newTitle } : c
                    )
                );
            }
        } catch (e) {
            console.error("Failed to generate conversation title:", e);
        }
    }, []);

    const sendMessage = useCallback(async (userInput: string) => {
        if (isLoading || !activeConversationId) return;
        
        if (!pdfTextContent.trim() || pdfTextContent.includes("PASTE YOUR FULL PDF TEXT CONTENT HERE")) {
            setError("Knowledge base is not configured. Please add the PDF text to services/knowledgeData.ts");
            return;
        }

        setError(null);
        setIsLoading(true);
        setFollowUpQuestions([]);

        const currentConvo = conversations.find(c => c.id === activeConversationId);
        if (!currentConvo) {
            setIsLoading(false);
            return;
        }
        
        const userMessage: ChatMessage = { role: 'user', content: userInput };
        const newMessages: ChatMessage[] = [...currentConvo.messages, userMessage];
        
        const isFirstMessage = currentConvo.messages.length === 0;
        const newTitle = isFirstMessage ? userInput.substring(0, 40) + (userInput.length > 40 ? '...' : '') : currentConvo.title;

        const updatedConversations = conversations.map(c => 
            c.id === activeConversationId ? { ...c, messages: newMessages, title: newTitle } : c
        );
        setConversations(updatedConversations);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }

            const result = await chatRef.current.sendMessage({ message: userInput });
            const botResponse = result.text;
            
            const botMessage: ChatMessage = { role: 'model', content: botResponse };
            
            const finalConversationsWithBotMsg = updatedConversations.map(c => 
                c.id === activeConversationId ? { ...c, messages: [...c.messages, botMessage] } : c
            );
            setConversations(finalConversationsWithBotMsg);
            
            if (isFirstMessage) {
                const finalMessages = finalConversationsWithBotMsg.find(c => c.id === activeConversationId)?.messages || [];
                generateAndSetTitle(activeConversationId, finalMessages);
            }

            generateFollowUpQuestions(userInput, botResponse);

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to get response from Gemini. ${errorMessage}`);
            setConversations(conversations);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, conversations, activeConversationId, generateFollowUpQuestions, generateAndSetTitle]);
    
    const handleLogin = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleNewChat = () => {
        const newConversation: Conversation = {
            id: uuidv4(),
            title: 'New Chat',
            messages: []
        };
        setConversations([newConversation, ...conversations]);
        setActiveConversationId(newConversation.id);
        setFollowUpQuestions([]);
        setError(null);
    };

    const handleDeleteChat = (conversationId: string) => {
        const updatedConversations = conversations.filter(c => c.id !== conversationId);
        setConversations(updatedConversations);
        
        if (activeConversationId === conversationId) {
            if (updatedConversations.length > 0) {
                setActiveConversationId(updatedConversations[0].id);
            } else {
                handleNewChat();
            }
        }
    };

    const handleRenameChat = (conversationId: string, newTitle: string) => {
        setConversations(prev => 
            prev.map(c => 
                c.id === conversationId ? { ...c, title: newTitle } : c
            )
        );
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
            <div className={`fixed inset-y-0 left-0 z-30 w-96 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out bg-gray-50 dark:bg-gray-800`}>
                 <SettingsPanel 
                    user={currentUser}
                    onLogout={handleLogout}
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    isLoading={isLoading}
                    maxOutputTokens={maxOutputTokens}
                    setMaxOutputTokens={setMaxOutputTokens}
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onNewChat={handleNewChat}
                    onSelectChat={setActiveConversationId}
                    onDeleteChat={handleDeleteChat}
                    onRenameChat={handleRenameChat}
                />
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Close sidebar"
                >
                    <X size={24} />
                </button>
            </div>
            
            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: isSidebarOpen ? '24rem' : '0' }}>
                 <div className="absolute top-4 left-4 z-10">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200"
                            aria-label="Open sidebar"
                        >
                            <Menu size={24} />
                        </button>
                    )}
                </div>
                {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"></div>}

                <ChatWindow 
                    messages={activeConversation?.messages || []}
                    isLoading={isLoading}
                    error={error}
                    onSendMessage={sendMessage}
                    followUpQuestions={followUpQuestions}
                />
            </main>
        </div>
    );
};

export default App;
