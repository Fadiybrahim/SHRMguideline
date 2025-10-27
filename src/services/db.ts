import type { User, Conversation } from '../types';

// Predefined users and their passwords
const users: { [username: string]: string } = {
    'Ludovic SALEN': 'Ludovic SALEN',
    'Vivien EIBEN': 'Vivien EIBEN',
    'Marie RAITH': 'Marie RAITH',
    'Robosa GBINOBA': 'Robosa GBINOBA',
    'Fadi Ibrahim': 'Fadi Ibrahim'
};

/**
 * Authenticates a user based on predefined credentials.
 * @param username - The username to authenticate.
 * @param password - The password for the given username.
 * @returns The User object if authentication is successful, otherwise null.
 */
export const authenticateUser = (username: string, password: string): User | null => {
    if (users[username] && users[username] === password) {
        return { username };
    }
    return null;
};

/**
 * Retrieves the chat history for a specific user from localStorage.
 * @param username - The username whose chat history is to be retrieved.
 * @returns An array of Conversation objects, or an empty array if no history is found.
 */
export const getConversations = (username: string): Conversation[] => {
    try {
        const historyJson = localStorage.getItem(`chatHistory_${username}`);
        if (historyJson) {
            return JSON.parse(historyJson);
        }
    } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
    }
    return [];
};

/**
 * Saves the chat history for a specific user to localStorage.
 * @param username - The username whose chat history is to be saved.
 * @param conversations - The array of Conversation objects to save.
 */
export const saveConversations = (username: string, conversations: Conversation[]) => {
    try {
        localStorage.setItem(`chatHistory_${username}`, JSON.stringify(conversations));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
};
