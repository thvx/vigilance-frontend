import { API_CONFIG } from '@/config/api';

import type {
  Camera,
  Alert,
  SystemMetrics,
  HistoricalRecord
} from '@/types/surveillance';

// ─────────────────────────────────────────────
// API ERROR
// ─────────────────────────────────────────────

export class ApiError extends Error {

  constructor(
    public status: number,
    message: string
  ) {
    super(message);

    this.name = 'ApiError';
  }
}

// ─────────────────────────────────────────────
// API CLIENT
// ─────────────────────────────────────────────

class ApiClient {

  private baseUrl: string;

  private token: string | null = null;

  constructor(baseUrl: string) {

    this.baseUrl = baseUrl;

    // ✅ cargar token automáticamente
    const savedToken =
      localStorage.getItem("token");

    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {

    this.token = token;

    localStorage.setItem(
      "token",
      token
    );
  }

  clearToken() {

    this.token = null;

    localStorage.removeItem(
      "token"
    );
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {

    const url =
      `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {

      "Content-Type":
        "application/json",

      ...(options.headers as Record<
        string,
        string
      >),
    };

    // ✅ agregar JWT
    if (this.token) {

      headers[
        "Authorization"
      ] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {

      ...options,

      headers,

      signal: AbortSignal.timeout(
        API_CONFIG.timeout
      ),
    });

    // ✅ sesión expirada
    if (response.status === 401) {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "username"
      );

      window.location.href =
        "/login";

      throw new ApiError(
        401,
        "Sesión expirada"
      );
    }

    // ✅ otros errores
    if (!response.ok) {

      const error =
        await response
          .json()
          .catch(() => ({
            message:
              response.statusText,
          }));

      throw new ApiError(
        response.status,
        error.message ||
          "Error del servidor"
      );
    }

    return response.json();
  }

  async get<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {

    const query = params
      ? "?" +
        new URLSearchParams(
          params
        ).toString()
      : "";

    return this.request<T>(
      `${path}${query}`
    );
  }

  async post<T>(
    path: string,
    body?: unknown
  ): Promise<T> {

    return this.request<T>(
      path,
      {
        method: "POST",

        body: JSON.stringify(body),
      }
    );
  }

  async patch<T>(
    path: string,
    body?: unknown
  ): Promise<T> {

    return this.request<T>(
      path,
      {
        method: "PATCH",

        body: JSON.stringify(body),
      }
    );
  }

  async put<T>(
    path: string,
    body?: unknown
  ): Promise<T> {

    return this.request<T>(
      path,
      {
        method: "PUT",

        body: JSON.stringify(body),
      }
    );
  }

  async getBlob(
    path: string,
    params?: Record<string, string>
  ): Promise<Blob> {

    const query = params
      ? "?" +
        new URLSearchParams(
          params
        ).toString()
      : "";

    const url =
      `${this.baseUrl}${path}${query}`;

    const headers: Record<
      string,
      string
    > = {};

    if (this.token) {

      headers[
        "Authorization"
      ] = `Bearer ${this.token}`;
    }

    const response = await fetch(
      url,
      {
        headers,
      }
    );

    if (!response.ok) {

      throw new ApiError(
        response.status,
        "Error al descargar archivo"
      );
    }

    return response.blob();
  }
}

// ─────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────

export const apiClient =
  new ApiClient(
    API_CONFIG.baseUrl
  );

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// CAMERA SERVICE
// ─────────────────────────────────────────────

export const cameraService = {

  getAll: () =>
    apiClient.get<Camera[]>(
      "/cameras"
    ),

  getById: (id: string) =>
    apiClient.get<Camera>(
      `/cameras/${id}`
    ),
};

// ─────────────────────────────────────────────
// ALERT SERVICE
// ─────────────────────────────────────────────

export const alertService = {

  getActive: () =>
    apiClient.get<Alert[]>(
      "/alerts/active"
    ),

  getById: (id: string) =>
    apiClient.get<Alert>(
      `/alerts/${id}`
    ),

  list: (
    query: AlertsListQuery = {}
  ) => {

    const params: Record<
      string,
      string
    > = {};

    if (query.search) {
      params.search =
        query.search;
    }

    return apiClient.get<AlertsListResponse>(
      "/alerts",
      params
    );
  },

  validate: (
    id: string,
    status:
      | "confirmed"
      | "false_positive"
  ) =>
    apiClient.patch<Alert>(
      `/alerts/${id}/validate`,
      { status }
    ),
};

// ─────────────────────────────────────────────
// RECORD SERVICE (🔥 FIX AQUÍ)
// ─────────────────────────────────────────────

export const recordService = {

  getAll: (
    query: RecordsListQuery = {}
  ) => {

    const params: Record<string, string> = {};

    // 🔎 SEARCH
    if (query.search) {
      params.search = query.search;
    }

    // 🔥 CRIME TYPE (FIX)
    if (query.crime_type) {
      params.crime_type = Array.isArray(query.crime_type)
        ? query.crime_type[0]
        : query.crime_type;
    }

    // 🔥 VALIDATION (FIX)
    if (query.validation) {
      params.validation = Array.isArray(query.validation)
        ? query.validation[0]
        : query.validation;
    }

    // 🔥 FECHAS (FIX)
    if (query.date_from) {
      params.date_from = query.date_from;
    }

    if (query.date_to) {
      params.date_to = query.date_to;
    }

    // 🔥 DEBUG
    console.log(
      "🔥 URL FINAL:",
      `${API_CONFIG.baseUrl}/records?${new URLSearchParams(params).toString()}`
    );

    return apiClient.get<RecordsListResponse>(
      "/records",
      params
    );
  },

  getById: (id: string) =>
    apiClient.get<HistoricalRecord>(
      `/records/${id}`
    ),

  getClipUrl: (id: string) =>
    `${API_CONFIG.baseUrl}/records/${id}/clip`,

  downloadClip: (id: string) =>
    apiClient.getBlob(
      `/records/${id}/clip`
    ),
};

// ─────────────────────────────────────────────
// METRICS SERVICE
// ─────────────────────────────────────────────

export const metricsService = {

  getSystem: () =>
    apiClient.get<SystemMetrics>(
      "/metrics/system"
    ),

  getCameras: () =>
    apiClient.get(
      "/metrics/cameras"
    ),
};

// ─────────────────────────────────────────────
// STREAM SERVICE
// ─────────────────────────────────────────────

export const streamService = {

  getHlsStream: (
    cameraId: string
  ) =>
    apiClient.get<StreamResponse>(
      `/streams/${cameraId}/hls`
    ),

  getHlsUrl: (
    cameraId: string
  ) =>
    `${API_CONFIG.baseUrl}/streams/${cameraId}/hls`,
};

// ─────────────────────────────────────────────
// EXPORT SERVICE
// ─────────────────────────────────────────────

export const exportService = {

  exportAlertsExcel: () =>
    apiClient.getBlob(
      "/export/alerts/excel"
    ),

  exportAlertZip: (
    alertId: string
  ) =>
    apiClient.getBlob(
      `/export/alerts/${alertId}/zip`
    ),
};