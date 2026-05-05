export const API_CONFIG = {
  // 🔥 URL REAL DE TU BACKEND FASTAPI
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  
  // 🔥 WEBSOCKET CORRECTO
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws',
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Video stream settings
  video: {
    maxReconnectAttempts: 5,
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
    
    // 🔥 IMPORTANTE: mantiene consistencia con backend
    streamUrlPattern: `${API_CONFIG.baseUrl}/streams/genetec/{cameraId}/hls`,
  },

  mobile_camera: {
    type: 'mobile_camera',
    label: 'Cámara Móvil',
    description: 'Transmisión desde dispositivo móvil vía WebRTC/RTMP',
    
    // 🔥 igual aquí
    streamUrlPattern: `${API_CONFIG.baseUrl}/streams/mobile/{cameraId}/hls`,
  },
};