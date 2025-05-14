// src/lib/api/sse.ts

import { goto } from '$app/navigation';
import type { TempSession } from '$lib/types/chat';


// Types for the request and SSE events
export interface SendMessageRequest {

    message: string;

}

export interface SSEEventData {
    delta?: string;
    message_id: string;
    chat_id: string;
    error?: string;
}

export interface SSEMessage {
    event: 'message' | 'done' | 'error';
    data: SSEEventData;
}

/**
 * Sends a message to the backend SSE endpoint and returns an async generator that yields SSE events.
 *
 * @param messageData Data for the message and session.
 * @returns Async generator yielding SSEMessage events.
 */
export async function* sendMessageSSE(messageData: SendMessageRequest): AsyncGenerator<SSEMessage> {
    // Get auth header

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/send`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Setting Accept to event-stream can help signal the response type
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(messageData)
        }
    );

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    // Process the SSE stream using the ReadableStream API
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

        // SSE messages are separated by newlines
        const lines = buffer.split('\n');
        // Process all complete lines except the last (which may be incomplete)
        for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            // Expecting lines in the format: "event: <eventName>" or "data: <json>"
            if (line.startsWith('data:')) {
                const jsonStr = line.slice(5).trim();
                try {
                    const data: SSEEventData = JSON.parse(jsonStr);
                    // Determine the event type (could be part of the JSON data or deduced externally)
                    // In our backend, we yield separate events for "message", "done", and "error"
                    // so you might want to use additional logic to deduce the type if needed.
                    // For simplicity, here we assume the backend includes the event type as a property.
                    // Otherwise, you can modify the protocol to send an "event:" line before "data:".
                    // Here we simply return the data as a "message" event unless an error is present.
                    const eventType: SSEMessage['event'] = data.error ? 'error' : 'message';
                    yield {
                        event: eventType,
                        data: data
                    };
                } catch (e) {
                    console.error('Failed to parse SSE data', e);
                }
            }
        }
        // Keep the last partial line in the buffer
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