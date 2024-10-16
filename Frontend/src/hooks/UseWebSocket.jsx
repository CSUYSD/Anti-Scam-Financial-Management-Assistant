import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '@/service/WebSocketService';

const useWebSocket = () => {
  const [message, setMessage] = useState(null);

  const messageHandler = useCallback((payload) => {
    console.log('WebSocket message received in hook:', payload);
    setMessage(payload);
  }, []);

  useEffect(() => {
    if (!WebSocketService.isConnected()) {
      console.log('Connecting WebSocket...');
      WebSocketService.connect();
    }
    WebSocketService.addMessageHandler(messageHandler);

    return () => {
      WebSocketService.removeMessageHandler(messageHandler);
    };
  }, [messageHandler]);

  return message;
};



export default useWebSocket;