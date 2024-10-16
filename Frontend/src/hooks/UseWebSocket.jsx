import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '@/service/WebSocketService';

const useWebSocket = () => {
  const [message, setMessage] = useState(null);

  const cleanMessage = (msg) => {
    if (typeof msg === 'string') {
      // 移除多余的引号和转义字符
      return msg.replace(/\\"/g, '"').replace(/^"|"$/g, '');
    }
    if (msg && typeof msg === 'object') {
      // 如果是对象，清理 description 字段
      return {
        ...msg,
        description: msg.description ? cleanMessage(msg.description) : msg.description
      };
    }
    return msg;
  };

  const messageHandler = useCallback((payload) => {
    console.log('WebSocket message received in hook:', payload);
    const cleanedPayload = cleanMessage(payload);
    setMessage(cleanedPayload);
  }, []);

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