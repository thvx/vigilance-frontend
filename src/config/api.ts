/**
 * API Configuration
 * 
 * This file centralizes all backend connection settings.
 * The frontend and backend are separate applications/repositories.
 * 
 * ## Backend Connection
 * 
 * Set the environment variable VITE_API_BASE_URL to point to your backend:
 * - Development: http://localhost:8000/api/v1
 * - Production: https://your-backend-domain.com/api/v1
 * 
 * ## Video Sources
 * 
 * The system supports two video source types:
 * 
 * ### 1. Genetec Security Center 5.10 (via API)
 * - Backend connects to Genetec SDK/API server
 * - Streams are proxied through backend as HLS/WebRTC
 * - Requires: GENETEC_SERVER_URL, GENETEC_API_KEY, GENETEC_USERNAME, GENETEC_PASSWORD
 * 
 * ### 2. Mobile Camera (via WebRTC/RTMP)
 * - Mobile app captures video and sends via WebRTC signaling or RTMP
 * - Backend acts as signaling server / media relay
 * - Frontend receives WebRTC stream or HLS from backend transcoder
 * - Requires: WebSocket connection for signaling
 * 
 * ## Required Backend Endpoints
 * 
 * See src/services/api.ts for full endpoint documentation.
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  
  /** Request timeout in ms */
  timeout: 30000,
  
  /** Video stream settings */
  video: {
    /** Max reconnection attempts for live streams */
    maxReconnectAttempts: 5,
    /** Reconnection delay in ms */
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
