import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from "@/utils/index.jsx";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = [];
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
      onConnect: () => {
        console.log('STOMP connection established');
        localStorage.setItem('webSocketConnected', 'true');
        this.stompClient.subscribe('/topic/analysis-result/*', (message) => {
          console.log('Received message:', message);
          try {
            const content = message.body;
            const match = content.match(/textContent=([^,]+)/);
            if (match) {
              const textContent = match[1];
              // 从textContent中提取更多信息
              const amountMatch = textContent.match(/\$(\d+(\.\d{2})?)/);
              const dateMatch = textContent.match(/(\d{4}-\d{2}-\d{2})/);
              const payload = {
                description: textContent,
                date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
                amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
                risk: 'high'
              };
              console.log('Processed payload:', payload);
              this.messageHandlers.forEach(handler => handler(payload));
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP connection closed');
        localStorage.removeItem('webSocketConnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        localStorage.removeItem('webSocketConnected');
      }
    });

    this.stompClient.activate();
  }

  // In WebSocketService.js
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }

  handleLogout() {
    this.disconnect();
    localStorage.removeItem('webSocketConnected');
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    localStorage.removeItem('webSocketConnected');
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export default new WebSocketService();