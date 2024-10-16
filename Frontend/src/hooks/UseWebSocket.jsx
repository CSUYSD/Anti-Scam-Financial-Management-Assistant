import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '@/service/WebSocketService';

const useWebSocket = () => {
  const [message, setMessage] = useState(null);

  const cleanMessage = useCallback((msg) => {
    if (typeof msg === 'string') {
      return msg.replace(/\\"/g, '"').replace(/^"|"$/g, '');
    }
    if (msg && typeof msg === 'object') {
      return {
        ...msg,
        description: msg.description ? cleanMessage(msg.description) : msg.description
      };
    }
    return msg;
  }, []);

  const messageHandler = useCallback((payload) => {
    console.log('WebSocket message received in hook:', payload);
    const cleanedPayload = cleanMessage(payload);
    setMessage(cleanedPayload);
  }, [cleanMessage]);

  useEffect(() => {
    WebSocketService.connect();
    WebSocketService.addMessageHandler(messageHandler);

    return () => {
      WebSocketService.removeMessageHandler(messageHandler);
    };
  }, [messageHandler]);

  return message;
};

export default useWebSocket;