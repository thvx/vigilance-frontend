/**
 * Export Service
 * 
 * Handles client-side export when backend is unavailable (mock mode).
 * In production, exports come from backend endpoints.
 */

import * as XLSX from 'xlsx';
import { HistoricalRecord, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function exportRecordsToExcel(records: HistoricalRecord[], filename = 'registros_vigilancia') {
  const data = records.map(record => ({
    'ID': record.id,
    'Cámara': record.cameraName,
    'Ubicación': record.location,
    'Tipo de Delito': CRIME_TYPE_LABELS[record.crimeType],
    'Confianza (%)': (record.confidenceScore * 100).toFixed(1),
    'Estado': record.validationStatus === 'true_positive' ? 'Positivo Verdadero'
      : record.validationStatus === 'false_positive' ? 'Falso Positivo'
      : 'Pendiente',
    'Validado por': record.validatedBy || '-',
    'Fecha/Hora': format(record.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: es }),
    'Validado en': record.validatedAt ? format(record.validatedAt, 'dd/MM/yyyy HH:mm:ss', { locale: es }) : '-',
    'ID Seguimiento': record.trackingId || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 25 }, { wch: 22 },
    { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 22 },
    { wch: 22 }, { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Registros');
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
}

export function exportSingleRecordToExcel(record: HistoricalRecord) {
  exportRecordsToExcel([record], `registro_${record.id}`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
