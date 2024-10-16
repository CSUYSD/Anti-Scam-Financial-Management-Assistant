import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from "@/utils/index.jsx";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect() {
    if (this.stompClient && this.stompClient.connected) {
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
      debug: (str) => {
        console.log('STOMP debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP connection established');
        localStorage.setItem('webSocketConnected', 'true');
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        console.log('STOMP connection closed');
        this.handleDisconnect();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.handleDisconnect();
      }
    });

    this.stompClient.activate();
  }

  subscribeToTopics() {
    this.stompClient.subscribe('/topic/analysis-result/*', (message) => {
      console.log('Received message:', message);
      try {
        const content = message.body;

        // 提取 textContent
        const textContentMatch = content.match(/textContent=([^,]+)/);
        if (textContentMatch) {
          let description = textContentMatch[1].trim();
          // 移除可能的引号
          description = description.replace(/^["']|["']$/g, '');

          const risk = description.toLowerCase().includes('warning') ? 'high' : 'low';

          // 只处理风险级别为 "high" 的消息
          if (risk === 'high') {
            const payload = {
              id: Date.now(),
              description: description,
              date: new Date().toISOString().split('T')[0],
              risk: risk
            };

            console.log('Processed high-risk payload:', payload);
            this.updateSessionStorage(payload);
            this.messageHandlers.forEach(handler => handler(payload));
          } else {
            console.log('Ignoring low-risk message:', description);
          }
        } else {
          console.log('No valid content found in the message');
        }
      } catch (error) {
        console.error('Error processing message:', error);
        console.error('Original message:', message.body);
      }
    });
  }

  updateSessionStorage(payload) {
    const storedTransactions = JSON.parse(sessionStorage.getItem('suspiciousTransactions') || '[]');
    const updatedTransactions = [payload, ...storedTransactions].slice(0, 5);
    sessionStorage.setItem('suspiciousTransactions', JSON.stringify(updatedTransactions));
  }

  handleDisconnect() {
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
    return this.stompClient && this.stompClient.connected;
  }

  handleLogout() {
    this.disconnect();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    localStorage.removeItem('webSocketConnected');
    this.reconnectAttempts = 0;
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export default new WebSocketService();