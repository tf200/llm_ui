
import type { SourceResult } from '$lib/services/chat';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    sources?: SourceResult[];
}
