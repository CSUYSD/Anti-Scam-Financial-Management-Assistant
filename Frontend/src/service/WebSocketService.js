import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from "@/utils/index.jsx";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.messageHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
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
        const match = content.match(/textContent=([^,]+)/);
        if (match) {
          const textContent = match[1];
          const dateMatch = textContent.match(/(\d{4}-\d{2}-\d{2})/);
          const payload = {
            description: textContent,
            date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
            risk: textContent.toLowerCase().includes('warning') ? 'high' : 'low'
          };
          console.log('Processed payload:', payload);
          this.messageHandlers.forEach(handler => handler(payload));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
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