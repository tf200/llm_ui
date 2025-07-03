// src/lib/api/sse.ts

import { goto } from '$app/navigation';
import type { TempSession } from '$lib/types/chat';


// Types for the request and SSE events
export interface SendMessageRequest {

    message: string;

}

export interface SourceResult {
    title: string;
    pages: string;
    fileId: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    sources?: SourceResult[]; // Add sources to the message type
}

export interface SSEEventData {
    delta?: string;
    message_id: string;
    chat_id: string;
    error?: string;
    results?: SourceResult[]; // Add results to SSE data
}

export interface SSEMessage {
    event: 'message' | 'done' | 'error' | 'results'; // Add results event type
    data: SSEEventData;
}

/**
 * Sends a message to the backend SSE endpoint and returns an async generator that yields SSE events.
 *
 * @param messageData Data for the message and session.
 * @returns Async generator yielding SSEMessage events.
 */
export async function* sendMessageSSE(messageData: SendMessageRequest): AsyncGenerator<SSEMessage> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/message`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(messageData)
        }
    );

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No readable stream in response');
    }
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith('data:')) {
                const jsonStr = line.slice(5).trim();
                console.log("Raw SSE data:", jsonStr); // Debug log

                try {
                    const data: SSEEventData = JSON.parse(jsonStr);
                    console.log("Parsed SSE data:", data); // Debug log

                    // Determine event type based on data content
                    let eventType: SSEMessage['event'] = 'message';

                    if (data.error) {
                        eventType = 'error';
                    } else if (data.results) {
                        eventType = 'results';
                        console.log("Setting event type to results"); // Debug log
                    } else if (data.delta) {
                        eventType = 'message';
                    }

                    console.log("Event type:", eventType); // Debug log

                    yield {
                        event: eventType,
                        data: data
                    };
                } catch (e) {
                    console.error('Failed to parse SSE data', e);
                    console.error('Raw data was:', jsonStr);
                }
            }
        }
        buffer = lines[lines.length - 1];
    }
}




export async function CreateTempSession(candidates: number[]): Promise<TempSession> {

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/temp_session`,
        {
            method: 'POST', // Use POST to send data in the body
            headers: {
                'Content-Type': 'application/json' // Specify JSON content type
            },
            body: JSON.stringify({ candidates }) // Send candidates as JSON
        }
    );

    if (!response.ok) {

        throw new Error('Failed to fetch candidates');
    }

    return response.json();
}