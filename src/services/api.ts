/**
 * API Service Layer
 * 
 * Centralized service for all backend communication.
 * Frontend and backend are in separate repositories.
 * 
 * ─────────────────────────────────────────────────────────────
 * BACKEND ENDPOINT REFERENCE
 * ─────────────────────────────────────────────────────────────
 * 
 * ## Cameras
 * GET    /api/v1/cameras                    → Camera[]
 * GET    /api/v1/cameras/:id                → Camera
 * GET    /api/v1/cameras/:id/status         → { status, fps, resolution }
 * 
 * ## Video Streams
 * GET    /api/v1/streams/genetec/:cameraId/hls   → HLS manifest URL (m3u8)
 * GET    /api/v1/streams/mobile/:cameraId/hls    → HLS manifest URL (m3u8)
 * POST   /api/v1/streams/mobile/register         → { cameraId, signalingToken }
 *   Body: { deviceId: string, deviceName: string, location: { lat, lng } }
 * 
 * ## Alerts
 * GET    /api/v1/alerts                     → Alert[] (active alerts)
 *   Query: ?status=pending&limit=50
 * GET    /api/v1/alerts/:id                 → Alert
 * PUT    /api/v1/alerts/:id/validate        → Alert (updated)
 *   Body: { isTrue: boolean, validatedBy: string }
 * 
 * ## Historical Records
 * GET    /api/v1/records                    → { data: HistoricalRecord[], total: number, page: number }
 *   Query: ?search=term&crimeType=robbery&status=true_positive
 *          &dateFrom=ISO&dateTo=ISO&page=1&limit=20
 * GET    /api/v1/records/:id                → HistoricalRecord
 * GET    /api/v1/records/:id/clip           → video/mp4 stream
 * GET    /api/v1/records/export             → application/xlsx (filtered records)
 *   Query: same as GET /records
 * GET    /api/v1/records/:id/export         → application/zip (clip.mp4 + data.xlsx)
 * 
 * ## System Metrics
 * GET    /api/v1/metrics                    → SystemMetrics
 * 
 * ## WebSocket Events (ws://host/ws)
 * - alert:new        → New alert detected
 * - alert:tracking   → Multi-camera tracking update
 * - camera:status    → Camera status change
 * - metrics:update   → System metrics update
 * 
 * ─────────────────────────────────────────────────────────────
 * AUTHENTICATION
 * ─────────────────────────────────────────────────────────────
 * All endpoints require Bearer token in Authorization header.
 * Token is obtained via POST /api/v1/auth/login
 * 
 * ─────────────────────────────────────────────────────────────
 * GENETEC INTEGRATION (Backend-side)
 * ─────────────────────────────────────────────────────────────
 * Backend connects to Genetec Security Center via:
 * - Genetec Web SDK / REST API
 * - Server: GENETEC_SERVER_URL (e.g. https://genetec-server:4590)
 * - Auth: GENETEC_USERNAME + GENETEC_PASSWORD or GENETEC_API_KEY
 * - Backend transcodes RTSP → HLS for browser consumption
 * 
 * ─────────────────────────────────────────────────────────────
 * MOBILE CAMERA INTEGRATION (Backend-side)
 * ─────────────────────────────────────────────────────────────
 * Mobile devices connect via:
 * - WebRTC: Signaling server at ws://host/ws/signaling
 * - RTMP: rtmp://host/live/{streamKey}
 * - Backend transcodes to HLS for dashboard consumption
 */

import { API_CONFIG } from '@/config/api';
import type { Camera, Alert, SystemMetrics, HistoricalRecord } from '@/types/surveillance';

// ── HTTP Client ──────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(response.status, error.message || 'Error de servidor');
    }

    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${path}${query}`);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  async getBlob(path: string, params?: Record<string, string>): Promise<Blob> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const url = `${this.baseUrl}${path}${query}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new ApiError(response.status, 'Error al descargar archivo');
    return response.blob();
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Singleton ────────────────────────────────────────────────

export const apiClient = new ApiClient(API_CONFIG.baseUrl);

// ── Service Functions ────────────────────────────────────────

export const cameraService = {
  getAll: () => apiClient.get<Camera[]>('/cameras'),
  getById: (id: string) => apiClient.get<Camera>(`/cameras/${id}`),
};

export const alertService = {
  getActive: (limit = 50) => apiClient.get<Alert[]>('/alerts', { status: 'pending', limit: String(limit) }),
  getById: (id: string) => apiClient.get<Alert>(`/alerts/${id}`),
  validate: (id: string, isTrue: boolean, validatedBy: string) =>
    apiClient.put<Alert>(`/alerts/${id}/validate`, { isTrue, validatedBy }),
};

export interface RecordsQuery {
  search?: string;
  crimeType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const recordService = {
  getAll: (query: RecordsQuery = {}) => {
    const params: Record<string, string> = {};
    if (query.search) params.search = query.search;
    if (query.crimeType && query.crimeType !== 'all') params.crimeType = query.crimeType;
    if (query.status && query.status !== 'all') params.status = query.status;
    if (query.dateFrom) params.dateFrom = query.dateFrom;
    if (query.dateTo) params.dateTo = query.dateTo;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    return apiClient.get<PaginatedResponse<HistoricalRecord>>('/records', params);
  },
  getById: (id: string) => apiClient.get<HistoricalRecord>(`/records/${id}`),
  getClipUrl: (id: string) => `${API_CONFIG.baseUrl}/records/${id}/clip`,
  exportAll: (query: RecordsQuery = {}) => {
    const params: Record<string, string> = {};
    if (query.search) params.search = query.search;
    if (query.crimeType && query.crimeType !== 'all') params.crimeType = query.crimeType;
    if (query.status && query.status !== 'all') params.status = query.status;
    if (query.dateFrom) params.dateFrom = query.dateFrom;
    if (query.dateTo) params.dateTo = query.dateTo;
    return apiClient.getBlob('/records/export', params);
  },
  exportSingle: (id: string) => apiClient.getBlob(`/records/${id}/export`),
};

export const metricsService = {
  getCurrent: () => apiClient.get<SystemMetrics>('/metrics'),
};

export const streamService = {
  getGenetecStreamUrl: (cameraId: string) => `${API_CONFIG.baseUrl}/streams/genetec/${cameraId}/hls`,
  getMobileStreamUrl: (cameraId: string) => `${API_CONFIG.baseUrl}/streams/mobile/${cameraId}/hls`,
  registerMobileCamera: (deviceId: string, deviceName: string, location: { lat: number; lng: number }) =>
    apiClient.post<{ cameraId: string; signalingToken: string }>('/streams/mobile/register', {
      deviceId, deviceName, location,
    }),
};
