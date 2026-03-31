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

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
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

// ── Service Interfaces ───────────────────────────────────

export interface AlertsListQuery {
  camera_id?: string;
  crime_type?: string[];
  severity?: string[];
  validation?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AlertsListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Alert[];
}

export interface RecordsListQuery {
  camera_id?: string;
  crime_type?: string[];
  severity?: string[];
  validation?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface RecordsListResponse {
  data: HistoricalRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface StreamResponse {
  url: string;
  type: string;
  camera_id: string;
  status: string;
}

export interface MobileCameraRegisterResponse {
  camera_id: string;
  signaling_token: string;
  signaling_server: string;
  rtmp_url?: string;
}

export interface SystemMetricsResponse {
  total_cameras: number;
  online_cameras: number;
  offline_cameras: number;
  warning_cameras: number;
  alerts_today: number;
  avg_latency_ms: number;
  avg_fps: number;
  model_accuracy: number;
  uptime_pct: number;
  processing_fps: number;
}

// ── Service Functions ────────────────────────────────────

export const cameraService = {
  getAll: () => apiClient.get<Camera[]>('/cameras'),
  getById: (id: string) => apiClient.get<Camera>(`/cameras/${id}`),
};

export const alertService = {
  getActive: () => apiClient.get<Alert[]>('/alerts/active'),
  getById: (id: string) => apiClient.get<Alert>(`/alerts/${id}`),
  list: (query: AlertsListQuery = {}) => {
    const params: Record<string, string> = {};
    if (query.camera_id) params.camera_id = query.camera_id;
    if (query.crime_type?.length) query.crime_type.forEach(ct => {
      if (!params.crime_type) params.crime_type = ct;
      else params.crime_type += `,${ct}`;
    });
    if (query.severity?.length) query.severity.forEach(s => {
      if (!params.severity) params.severity = s;
      else params.severity += `,${s}`;
    });
    if (query.validation?.length) query.validation.forEach(v => {
      if (!params.validation) params.validation = v;
      else params.validation += `,${v}`;
    });
    if (query.date_from) params.date_from = query.date_from;
    if (query.date_to) params.date_to = query.date_to;
    if (query.search) params.search = query.search;
    if (query.page) params.page = String(query.page);
    if (query.page_size) params.page_size = String(query.page_size);
    return apiClient.get<AlertsListResponse>('/alerts', params);
  },
  validate: (id: string, status: 'confirmed' | 'false_positive') =>
    apiClient.patch<Alert>(`/alerts/${id}/validate`, { status }),
};

export const recordService = {
  getAll: (query: RecordsListQuery = {}) => {
    const params: Record<string, string> = {};
    if (query.camera_id) params.camera_id = query.camera_id;
    if (query.crime_type?.length) query.crime_type.forEach(ct => {
      if (!params.crime_type) params.crime_type = ct;
      else params.crime_type += `,${ct}`;
    });
    if (query.severity?.length) query.severity.forEach(s => {
      if (!params.severity) params.severity = s;
      else params.severity += `,${s}`;
    });
    if (query.validation?.length) query.validation.forEach(v => {
      if (!params.validation) params.validation = v;
      else params.validation += `,${v}`;
    });
    if (query.date_from) params.date_from = query.date_from;
    if (query.date_to) params.date_to = query.date_to;
    if (query.search) params.search = query.search;
    if (query.page) params.page = String(query.page);
    if (query.page_size) params.page_size = String(query.page_size);
    return apiClient.get<RecordsListResponse>('/records', params);
  },
  getById: (id: string) => apiClient.get<HistoricalRecord>(`/records/${id}`),
  getClipUrl: (id: string) => `${API_CONFIG.baseUrl}/records/${id}/clip`,
  downloadClip: (id: string) => apiClient.getBlob(`/records/${id}/clip`),
};

export const metricsService = {
  getSystem: () => apiClient.get<SystemMetricsResponse>('/metrics/system'),
  getCameras: () => apiClient.get('/metrics/cameras'),
};

export const streamService = {
  getHlsStream: (cameraId: string) => 
    apiClient.get<StreamResponse>(`/streams/${cameraId}/hls`),
  getHlsUrl: (cameraId: string) => `${API_CONFIG.baseUrl}/streams/${cameraId}/hls`,
  registerMobileCamera: (deviceId: string, deviceName: string, location?: { lat: number; lng: number }) =>
    apiClient.post<MobileCameraRegisterResponse>('/streams/mobile/register', {
      device_id: deviceId,
      device_name: deviceName,
      location: location || { lat: 0, lng: 0 },
    }),
};

export const exportService = {
  exportAlertsExcel: (query: AlertsListQuery = {}) => {
    const params: Record<string, string> = {};
    if (query.camera_id) params.camera_id = query.camera_id;
    if (query.date_from) params.date_from = query.date_from;
    if (query.date_to) params.date_to = query.date_to;
    if (query.search) params.search = query.search;
    return apiClient.getBlob('/export/alerts/excel', params);
  },
  exportAlertZip: (alertId: string) => 
    apiClient.getBlob(`/export/alerts/${alertId}/zip`),
};
