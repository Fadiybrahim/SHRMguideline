export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface User {
  username: string;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
}
