export const API_CONFIG = {
  // Base URL for all REST API endpoints
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost/api',
  
  // WebSocket URL for live events (alerts, camera status, etc)
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost/ws',
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Video stream settings
  video: {
    // Max reconnection attempts for live streams
    maxReconnectAttempts: 5,
    // Reconnection delay in milliseconds
    reconnectDelay: 3000,
  },
} as const;

export type VideoSourceType = 'genetec' | 'mobile_camera';

export interface VideoSourceConfig {
  type: VideoSourceType;
  label: string;
  description: string;
  streamUrlPattern: string;
}

export const VIDEO_SOURCES: Record<VideoSourceType, VideoSourceConfig> = {
  genetec: {
    type: 'genetec',
    label: 'Genetec Security Center',
    description: 'Conexión a cámaras IP vía Genetec Security Center 5.10 API',
    streamUrlPattern: `${API_CONFIG.baseUrl}/streams/genetec/{cameraId}/hls`,
  },
  mobile_camera: {
    type: 'mobile_camera',
    label: 'Cámara Móvil',
    description: 'Transmisión desde dispositivo móvil vía WebRTC/RTMP',
    streamUrlPattern: `${API_CONFIG.baseUrl}/streams/mobile/{cameraId}/hls`,
  },
};
