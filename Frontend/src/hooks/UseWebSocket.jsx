import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '@/service/WebSocketService';

const useWebSocket = () => {
  const [message, setMessage] = useState(null);

  const messageHandler = useCallback((payload) => {
    console.log('WebSocket message received in hook:', payload);
    setMessage(payload);
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      if (!WebSocketService.isConnected()) {
        console.log('Connecting WebSocket...');
        WebSocketService.connect();
      }
    };

    // 初始连接
    connectWebSocket();

    // 添加消息处理器
    WebSocketService.addMessageHandler(messageHandler);

    // 处理页面可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        connectWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      WebSocketService.removeMessageHandler(messageHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [messageHandler]);

  return message;
};

export default useWebSocket;