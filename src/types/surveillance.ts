export interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  coordinates: { lat: number; lng: number };
  status: 'online' | 'offline' | 'warning';
  fps: number;
  resolution: string;
  hasAlert: boolean;
  nearestCameras: string[]; // IDs de cámaras cercanas para seguimiento
}

export interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  crimeType: CrimeType;
  confidenceScore: number;
  status: 'pending' | 'validated_true' | 'validated_false' | 'escalated';
  thumbnailUrl?: string;
  location: string;
  paEnabled: boolean;
  paMessage?: string;
  trackingId?: string; // Para seguimiento multi-cámara
  relatedAlerts?: string[]; // IDs de alertas relacionadas en otras cámaras
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
  totalCameras: number;
  activeCameras: number;
  alertsToday: number;
  avgLatency: number;
  modelAccuracy: number;
  systemUptime: number;
  processingFps: number;
}

export interface HistoricalRecord {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  crimeType: CrimeType;
  confidenceScore: number;
  validationStatus: 'true_positive' | 'false_positive' | 'pending';
  validatedBy?: string;
  validatedAt?: Date;
  evidenceUrl?: string;
  location: string;
  trackingId?: string;
}

export const CRIME_TYPE_LABELS: Record<CrimeType, string> = {
  robbery: 'Robo',
  assault: 'Agresión',
  vandalism: 'Vandalismo',
  theft: 'Hurto',
  suspicious_activity: 'Actividad Sospechosa',
  intrusion: 'Intrusión',
  vehicle_theft: 'Robo de Vehículo',
  armed_threat: 'Amenaza Armada',
};

export const CRIME_TYPE_SEVERITY: Record<CrimeType, 'low' | 'medium' | 'high' | 'critical'> = {
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
export const PA_MESSAGES: Record<CrimeType, string> = {
  robbery: '¡Atención! Se ha detectado un posible robo en esta zona. Las autoridades han sido notificadas. Abandone el área inmediatamente.',
  assault: '¡Alerta de seguridad! Se ha detectado una agresión. Personal de seguridad en camino. Por favor, mantenga distancia.',
  vandalism: 'Atención: Actividad de vandalismo detectada. Esta área está siendo monitoreada. Las autoridades han sido alertadas.',
  theft: '¡Atención! Se ha detectado un posible hurto. Esta zona está bajo vigilancia. Seguridad en camino.',
  suspicious_activity: 'Aviso: Actividad sospechosa detectada en esta área. Por favor, identifíquese ante el personal de seguridad.',
  intrusion: '¡Alerta! Intrusión detectada en zona restringida. Abandone el área inmediatamente. Autoridades notificadas.',
  vehicle_theft: '¡Atención! Se ha detectado un posible robo de vehículo. No se mueva del lugar. Serenazgo en camino.',
  armed_threat: '¡EMERGENCIA! Amenaza armada detectada. Evacúe el área inmediatamente. Policía Nacional en camino. Busque refugio seguro.',
};
