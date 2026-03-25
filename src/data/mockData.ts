import { Camera, Alert, SystemMetrics, HistoricalRecord, CrimeType, PA_MESSAGES } from '@/types/surveillance';

// Cámaras ubicadas en el distrito de Independencia, Lima, Perú
export const mockCameras: Camera[] = [
  { 
    id: 'CAM-001', 
    name: 'Av. Túpac Amaru - Km 5', 
    location: 'Cruce con Av. Izaguirre', 
    zone: 'Zona Comercial',
    coordinates: { lat: -11.9889, lng: -77.0511 },
    status: 'online', 
    fps: 30, 
    resolution: '1920x1080', 
    hasAlert: true,
    nearestCameras: ['CAM-002', 'CAM-003']
  },
  { 
    id: 'CAM-002', 
    name: 'Plaza Cívica de Independencia', 
    location: 'Frente a Municipalidad', 
    zone: 'Centro Cívico',
    coordinates: { lat: -11.9912, lng: -77.0489 },
    status: 'online', 
    fps: 25, 
    resolution: '1920x1080', 
    hasAlert: false,
    nearestCameras: ['CAM-001', 'CAM-005']
  },
  { 
    id: 'CAM-003', 
    name: 'Mercado de Productores', 
    location: 'Av. Gerardo Unger', 
    zone: 'Zona Comercial',
    coordinates: { lat: -11.9845, lng: -77.0534 },
    status: 'online', 
    fps: 30, 
    resolution: '1280x720', 
    hasAlert: false,
    nearestCameras: ['CAM-001', 'CAM-004']
  },
  { 
    id: 'CAM-004', 
    name: 'MegaPlaza - Entrada Principal', 
    location: 'Av. Alfredo Mendiola', 
    zone: 'Centro Comercial',
    coordinates: { lat: -11.9756, lng: -77.0612 },
    status: 'warning', 
    fps: 15, 
    resolution: '1920x1080', 
    hasAlert: true,
    nearestCameras: ['CAM-003', 'CAM-006']
  },
  { 
    id: 'CAM-005', 
    name: 'Parque El Naranjal', 
    location: 'Urb. El Naranjal', 
    zone: 'Zona Residencial',
    coordinates: { lat: -11.9867, lng: -77.0445 },
    status: 'online', 
    fps: 30, 
    resolution: '1920x1080', 
    hasAlert: false,
    nearestCameras: ['CAM-002', 'CAM-007']
  },
  { 
    id: 'CAM-006', 
    name: 'Estación Naranjal - Metro', 
    location: 'Metropolitano', 
    zone: 'Transporte Público',
    coordinates: { lat: -11.9734, lng: -77.0578 },
    status: 'online', 
    fps: 25, 
    resolution: '1920x1080', 
    hasAlert: false,
    nearestCameras: ['CAM-004', 'CAM-008']
  },
  { 
    id: 'CAM-007', 
    name: 'IE República de Colombia', 
    location: 'Av. Carlos Izaguirre', 
    zone: 'Zona Educativa',
    coordinates: { lat: -11.9901, lng: -77.0423 },
    status: 'offline', 
    fps: 0, 
    resolution: '1280x720', 
    hasAlert: false,
    nearestCameras: ['CAM-005', 'CAM-002']
  },
  { 
    id: 'CAM-008', 
    name: 'Paradero Payet', 
    location: 'Av. Túpac Amaru Km 6.5', 
    zone: 'Transporte Público',
    coordinates: { lat: -11.9678, lng: -77.0589 },
    status: 'online', 
    fps: 30, 
    resolution: '1920x1080', 
    hasAlert: true,
    nearestCameras: ['CAM-006', 'CAM-004']
  },
];

// Alertas con seguimiento multi-cámara
export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    cameraId: 'CAM-001',
    cameraName: 'Av. Túpac Amaru - Km 5',
    timestamp: new Date(Date.now() - 30000),
    crimeType: 'suspicious_activity',
    confidenceScore: 0.87,
    status: 'pending',
    location: 'Cruce con Av. Izaguirre',
    paEnabled: false,
    paMessage: PA_MESSAGES['suspicious_activity'],
    trackingId: 'TRK-001',
  },
  {
    id: 'ALT-002',
    cameraId: 'CAM-004',
    cameraName: 'MegaPlaza - Entrada Principal',
    timestamp: new Date(Date.now() - 120000),
    crimeType: 'robbery',
    confidenceScore: 0.94,
    status: 'pending',
    location: 'Av. Alfredo Mendiola',
    paEnabled: true,
    paMessage: PA_MESSAGES['robbery'],
    trackingId: 'TRK-002',
    relatedAlerts: ['ALT-004'], // Continúa en otra cámara
  },
  {
    id: 'ALT-003',
    cameraId: 'CAM-008',
    cameraName: 'Paradero Payet',
    timestamp: new Date(Date.now() - 300000),
    crimeType: 'theft',
    confidenceScore: 0.91,
    status: 'escalated',
    location: 'Av. Túpac Amaru Km 6.5',
    paEnabled: true,
    paMessage: PA_MESSAGES['theft'],
    trackingId: 'TRK-003',
  },
  {
    id: 'ALT-004',
    cameraId: 'CAM-006',
    cameraName: 'Estación Naranjal - Metro',
    timestamp: new Date(Date.now() - 90000),
    crimeType: 'robbery',
    confidenceScore: 0.92,
    status: 'pending',
    location: 'Metropolitano',
    paEnabled: true,
    paMessage: PA_MESSAGES['robbery'],
    trackingId: 'TRK-002', // Mismo tracking que ALT-002
    relatedAlerts: ['ALT-002'],
  },
];

export const mockSystemMetrics: SystemMetrics = {
  totalCameras: 8,
  activeCameras: 7,
  alertsToday: 12,
  avgLatency: 1.8,
  modelAccuracy: 94.2,
  systemUptime: 99.94,
  processingFps: 28,
};

export const mockHistoricalRecords: HistoricalRecord[] = [
  {
    id: 'REC-001',
    cameraId: 'CAM-002',
    cameraName: 'Plaza Cívica de Independencia',
    timestamp: new Date(Date.now() - 3600000 * 2),
    crimeType: 'vehicle_theft',
    confidenceScore: 0.89,
    validationStatus: 'true_positive',
    validatedBy: 'Operador J. García',
    validatedAt: new Date(Date.now() - 3600000 * 1.5),
    location: 'Frente a Municipalidad',
    trackingId: 'TRK-100',
  },
  {
    id: 'REC-002',
    cameraId: 'CAM-006',
    cameraName: 'Estación Naranjal - Metro',
    timestamp: new Date(Date.now() - 3600000 * 5),
    crimeType: 'intrusion',
    confidenceScore: 0.76,
    validationStatus: 'false_positive',
    validatedBy: 'Operador M. López',
    validatedAt: new Date(Date.now() - 3600000 * 4.5),
    location: 'Metropolitano',
  },
  {
    id: 'REC-003',
    cameraId: 'CAM-001',
    cameraName: 'Av. Túpac Amaru - Km 5',
    timestamp: new Date(Date.now() - 3600000 * 8),
    crimeType: 'assault',
    confidenceScore: 0.95,
    validationStatus: 'true_positive',
    validatedBy: 'Operador J. García',
    validatedAt: new Date(Date.now() - 3600000 * 7.8),
    location: 'Cruce con Av. Izaguirre',
    trackingId: 'TRK-101',
  },
  {
    id: 'REC-004',
    cameraId: 'CAM-003',
    cameraName: 'Mercado de Productores',
    timestamp: new Date(Date.now() - 3600000 * 12),
    crimeType: 'suspicious_activity',
    confidenceScore: 0.72,
    validationStatus: 'false_positive',
    validatedBy: 'Operador A. Rodríguez',
    validatedAt: new Date(Date.now() - 3600000 * 11.5),
    location: 'Av. Gerardo Unger',
  },
  {
    id: 'REC-005',
    cameraId: 'CAM-008',
    cameraName: 'Paradero Payet',
    timestamp: new Date(Date.now() - 3600000 * 24),
    crimeType: 'robbery',
    confidenceScore: 0.97,
    validationStatus: 'true_positive',
    validatedBy: 'Operador M. López',
    validatedAt: new Date(Date.now() - 3600000 * 23.5),
    location: 'Av. Túpac Amaru Km 6.5',
    trackingId: 'TRK-102',
  },
];

export function generateRandomAlert(): Alert {
  const crimeTypes: CrimeType[] = ['robbery', 'assault', 'vandalism', 'theft', 'suspicious_activity', 'intrusion', 'vehicle_theft', 'armed_threat'];
  const camera = mockCameras.filter(c => c.status === 'online')[Math.floor(Math.random() * mockCameras.filter(c => c.status === 'online').length)];
  const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
  const confidenceScore = 0.7 + Math.random() * 0.28;
  const shouldActivatePA = confidenceScore >= 0.85; // Umbral de confianza para activar perifoneo
  
  return {
    id: `ALT-${Date.now()}`,
    cameraId: camera.id,
    cameraName: camera.name,
    timestamp: new Date(),
    crimeType,
    confidenceScore,
    status: 'pending',
    location: camera.location,
    paEnabled: shouldActivatePA,
    paMessage: shouldActivatePA ? PA_MESSAGES[crimeType] : undefined,
    trackingId: `TRK-${Date.now()}`,
  };
}

// Función para simular continuación de evento en otra cámara
export function generateRelatedAlert(originalAlert: Alert, cameras: Camera[]): Alert | null {
  const sourceCamera = cameras.find(c => c.id === originalAlert.cameraId);
  if (!sourceCamera || sourceCamera.nearestCameras.length === 0) return null;

  const nextCameraId = sourceCamera.nearestCameras[Math.floor(Math.random() * sourceCamera.nearestCameras.length)];
  const nextCamera = cameras.find(c => c.id === nextCameraId);
  if (!nextCamera || nextCamera.status !== 'online') return null;

  const shouldActivatePA = originalAlert.confidenceScore >= 0.85;

  return {
    id: `ALT-${Date.now()}`,
    cameraId: nextCamera.id,
    cameraName: nextCamera.name,
    timestamp: new Date(),
    crimeType: originalAlert.crimeType,
    confidenceScore: Math.max(0.7, originalAlert.confidenceScore - 0.05 + Math.random() * 0.1),
    status: 'pending',
    location: nextCamera.location,
    paEnabled: shouldActivatePA,
    paMessage: shouldActivatePA ? PA_MESSAGES[originalAlert.crimeType] : undefined,
    trackingId: originalAlert.trackingId,
    relatedAlerts: [originalAlert.id],
  };
}