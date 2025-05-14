export interface SendMessageRequest {
    message: string;
    session_id?: string | null;
    candidates?: string[];
  }


  export interface ChatSession {
    id: string;
    user_id: string;
    candidates: string[];
  }



  export interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
  }


  export interface SSEMessageEvent {
    event: 'message';
    data: {
      delta: string;
      message_id: string;
      chat_id: string;
    };
  }


  export interface SSEDoneEvent {
    event: 'done';
    data: {
      message_id: string;
      chat_id: string;
    };
  }


  export interface SSEErrorEvent {
    event: 'error';
    data: {
      error: string;
      message_id: string;
      chat_id: string;
    };
  }



  export interface TempSession {
    session_id: string;
  }