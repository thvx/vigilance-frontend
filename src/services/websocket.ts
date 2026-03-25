/**
 * WebSocket Service for Real-Time Events
 * 
 * Handles:
 * - alert:new         → New alert from detection model
 * - alert:tracking    → Multi-camera tracking update
 * - camera:status     → Camera online/offline/warning changes
 * - metrics:update    → System metrics refresh
 * 
 * Connection:
 * - URL: ws://backend-host/ws (set via VITE_WS_URL)
 * - Auth: Bearer token sent as first message after connection
 * - Auto-reconnect with exponential backoff
 */

import { API_CONFIG } from '@/config/api';

export type WSEventType = 'alert:new' | 'alert:tracking' | 'camera:status' | 'metrics:update';

export interface WSMessage {
  type: WSEventType;
  payload: unknown;
  timestamp: string;
}

type WSEventHandler = (payload: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<WSEventType, Set<WSEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const url = token ? `${API_CONFIG.wsUrl}?token=${token}` : API_CONFIG.wsUrl;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          const eventHandlers = this.handlers.get(message.type);
          eventHandlers?.forEach(handler => handler(message.payload));
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= API_CONFIG.video.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached');
      return;
    }

    const delay = API_CONFIG.video.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  on(event: WSEventType, handler: WSEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
