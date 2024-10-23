import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from "@/utils/index.jsx";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect() {
    if (this.stompClient?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = getToken();
    const socket = new SockJS(`http://localhost:8080/ws`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => console.log('STOMP debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: this.handleConnect.bind(this),
      onDisconnect: this.handleDisconnect.bind(this),
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.handleDisconnect();
      }
    });

    this.stompClient.activate();
  }

  handleConnect() {
    console.log('STOMP connection established');
    localStorage.setItem('webSocketConnected', 'true');
    this.reconnectAttempts = 0;
    this.subscribeToTopics();
  }

  subscribeToTopics() {
    this.stompClient.subscribe('/topic/analysis-result/*', this.handleMessage.bind(this));
  }

  handleMessage(message) {
    console.log('Received message:', message);
    try {
      // 获取消息体
      const content = message.body || message._body;

      // 使用更精确的正则表达式来匹配 textContent
      const textContentMatch = content.match(/textContent=([^,]+?)(?=, metadata)/);

      if (textContentMatch && textContentMatch[1]) {
        // 提取消息内容并清理
        let description = textContentMatch[1].trim();

        // 检查是否包含 WARNING
        const risk = description.toUpperCase().includes('WARNING') ? 'high' : 'low';

        if (risk === 'high') {
          // 构建有效载荷
          const payload = {
            id: Date.now(),
            description: description,
            date: new Date().toISOString().split('T')[0],
            risk
          };

          console.log('Processed high-risk payload:', payload);
          this.updateSessionStorage(payload);
          this.notifyHandlers(payload);
        } else {
          console.log('Ignoring low-risk message:', description);
        }
      } else {
        // 如果第一个正则表达式失败，尝试替代方法
        let match = content.match(/\[textContent=([^[\]]+?)\]/);
        if (!match) {
          match = content.match(/textContent=(.*?)(?=,\s*metadata)/s);
        }

        if (match) {
          let description = match[1].trim();
          const risk = description.toUpperCase().includes('WARNING') ? 'high' : 'low';

          if (risk === 'high') {
            const payload = {
              id: Date.now(),
              description: description,
              date: new Date().toISOString().split('T')[0],
              risk
            };

            console.log('Processed high-risk payload (alternative method):', payload);
            this.updateSessionStorage(payload);
            this.notifyHandlers(payload);
          }
        } else {
          console.warn('Could not extract message content:', content);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Original message:', message);
    }
  }

  notifyHandlers(payload) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  updateSessionStorage(payload) {
    try {
      const storedTransactions = JSON.parse(sessionStorage.getItem('suspiciousTransactions') || '[]');
      const updatedTransactions = [payload, ...storedTransactions].slice(0, 5);
      sessionStorage.setItem('suspiciousTransactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating session storage:', error);
    }
  }

  handleDisconnect() {
    console.log('STOMP connection closed');
    localStorage.removeItem('webSocketConnected');

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.');
    }
  }

  isConnected() {
    return this.stompClient?.connected ?? false;
  }

  handleLogout() {
    this.disconnect();
  }

  disconnect() {
    this.stompClient?.deactivate();
    localStorage.removeItem('webSocketConnected');
    this.reconnectAttempts = 0;
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }
}

export default new WebSocketService();