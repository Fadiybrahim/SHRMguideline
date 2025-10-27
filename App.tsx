import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { ChatMessage } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatWindow } from './components/ChatWindow';
import { Menu, X } from 'lucide-react';
import { pdfTextContent } from './services/knowledgeData';

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful expert on the provided document. Answer user questions based ONLY on the information in the document. After your answer, provide a 'References' section with the exact quotes from the document that support your answer. Use markdown for formatting. If the answer is not in the document, say 'I cannot find the answer in the provided document.'");
    const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
    const [maxOutputTokens, setMaxOutputTokens] = useState<number>(1024);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (!pdfTextContent.trim() || pdfTextContent.includes("PASTE YOUR FULL PDF TEXT CONTENT HERE")) {
            setError("Knowledge base is not configured. Please add the PDF text to services/knowledgeData.ts");
            setIsLoading(true); // Disable input
            return;
        }

        if (!apiKey) {
            setError("Please enter your Gemini API key in the settings panel.");
            chatRef.current = null;
            return;
        }

        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey });
            
            let fullSystemInstruction = systemPrompt;
            fullSystemInstruction += `\n\n--- DOCUMENT CONTEXT ---\n${pdfTextContent}`;

            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: fullSystemInstruction,
                    maxOutputTokens: maxOutputTokens,
                },
            });
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
             setError(`Failed to initialize Gemini. Check your API Key. ${errorMessage}`);
        }
        
    }, [systemPrompt, apiKey, maxOutputTokens]);

    const generateFollowUpQuestions = useCallback(async (userInput: string, modelResponse: string) => {
        if (!apiKey) return;

        try {
            const ai = new GoogleGenAI({ apiKey });
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
    }, [apiKey]);


    const sendMessage = useCallback(async (userInput: string) => {
        if (isLoading) return;
        
        if (!apiKey) {
            setError("Please enter your Gemini API key in the settings panel to start chatting.");
            return;
        }
        if (!pdfTextContent.trim() || pdfTextContent.includes("PASTE YOUR FULL PDF TEXT CONTENT HERE")) {
            setError("Knowledge base is not configured. Please add the PDF text to services/knowledgeData.ts");
            return;
        }

        setError(null);
        setIsLoading(true);
        setFollowUpQuestions([]);
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized. This could be due to a missing or invalid API key.");
            }

            const result = await chatRef.current.sendMessage({ message: userInput });
            const botResponse = result.text;
            
            setMessages([...newMessages, { role: 'model', content: botResponse }]);
            generateFollowUpQuestions(userInput, botResponse);

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to get response from Gemini. ${errorMessage}`);
            console.error(e);
            setMessages(messages);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, apiKey, generateFollowUpQuestions]);
    
    return (
        <div className="flex h-screen font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
            <div className={`fixed inset-y-0 left-0 z-30 w-96 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out bg-gray-50 dark:bg-gray-800`}>
                 <SettingsPanel 
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    isLoading={isLoading}
                    maxOutputTokens={maxOutputTokens}
                    setMaxOutputTokens={setMaxOutputTokens}
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
                    messages={messages}
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