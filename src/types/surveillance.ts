export interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  model: string;
  ip: string;
  hls_url: string;
  rtsp_url: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'warning' | 'unknown';
  fps: number;
  latency_ms: number;
}

export interface Alert {
  id: string;
  camera_id: string;
  camera_name: string;
  location: string;
  crime_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: string;
  thumbnail_url?: string;
  clip_url?: string;
  pa_triggered: boolean;
  related_cameras: string[];
  validation_status: 'pending' | 'confirmed' | 'false_positive';
  validated_by?: string;
  validated_at?: string;
}

export type CrimeType = 
  | 'robbery'
  | 'assault'
  | 'vandalism'
  | 'theft'
  | 'suspicious_activity'
  | 'intrusion'
  | 'vehicle_theft'
  | 'armed_threat';

export interface SystemMetrics {
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

export interface HistoricalRecord {
  id: string;
  camera_id: string;
  camera_name: string;
  location: string;
  crime_type: string;
  severity: string;
  confidence: number;
  timestamp: string;
  thumbnail_url?: string;
  clip_url?: string;
  pa_triggered: boolean;
  validation_status: 'pending' | 'confirmed' | 'false_positive';
  validated_by?: string;
  validated_at?: string;
}

export const CRIME_TYPE_LABELS: Record<string, string> = {
  robbery: 'Robo',
  assault: 'Agresión',
  vandalism: 'Vandalismo',
  theft: 'Hurto',
  suspicious_activity: 'Actividad Sospechosa',
  intrusion: 'Intrusión',
  vehicle_theft: 'Robo de Vehículo',
  armed_threat: 'Amenaza Armada',
};

export const SEVERITY_LABELS: Record<string, string> = {
  critical: '🔴 Crítica',
  high: '🔴 Alta',
  medium: '🟠 Media',
  low: '🟡 Baja',
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-900 text-white',
  high: 'bg-red-600 text-white',
  medium: 'bg-orange-500 text-white',
  low: 'bg-yellow-500 text-white',
};

export const CRIME_TYPE_SEVERITY: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  suspicious_activity: 'low',
  vandalism: 'medium',
  theft: 'medium',
  intrusion: 'medium',
  robbery: 'high',
  assault: 'high',
  vehicle_theft: 'high',
  armed_threat: 'critical',
};

// Mensajes de perifoneo según tipo de delito
export const PA_MESSAGES: Record<string, string> = {
  robbery: '¡Atención! Se ha detectado un posible robo en esta zona. Las autoridades han sido notificadas. Abandone el área inmediatamente.',
  assault: '¡Alerta de seguridad! Se ha detectado una agresión. Personal de seguridad en camino. Por favor, mantenga distancia.',
  vandalism: 'Atención: Actividad de vandalismo detectada. Esta área está siendo monitoreada. Las autoridades han sido alertadas.',
  theft: '¡Atención! Se ha detectado un posible hurto. Esta zona está bajo vigilancia. Seguridad en camino.',
  suspicious_activity: 'Aviso: Actividad sospechosa detectada en esta área. Por favor, identifíquese ante el personal de seguridad.',
  intrusion: '¡Alerta! Intrusión detectada en zona restringida. Abandone el área inmediatamente. Autoridades notificadas.',
  vehicle_theft: '¡Atención! Se ha detectado un posible robo de vehículo. No se mueva del lugar. Serenazgo en camino.',
  armed_threat: '¡EMERGENCIA! Amenaza armada detectada. Evacúe el área inmediatamente. Policía Nacional en camino. Busque refugio seguro.',
};
