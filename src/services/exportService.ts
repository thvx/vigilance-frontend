import * as XLSX from 'xlsx';
import { HistoricalRecord, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function mapRecord(record: HistoricalRecord) {
  const statusLabel =
    record.validation_status === 'confirmed' ? 'Confirmado'
    : record.validation_status === 'false_positive' ? 'Falso Positivo'
    : 'Pendiente';

  return {
    'ID': record.id,
    'Cámara': record.camera_name,
    'Ubicación': record.location,
    'Tipo de Delito': CRIME_TYPE_LABELS[record.crime_type] || record.crime_type,
    'Confianza (%)': (record.confidence * 100).toFixed(1),
    'Estado': statusLabel,
    'Validado por': record.validated_by || '-',
    'Fecha/Hora': format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es }),
    'Validado en': record.validated_at
      ? format(new Date(record.validated_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })
      : '-',
  };
}

export function exportRecordsToExcel(records: HistoricalRecord[], filename = 'registros_vigilancia') {
  const data = records.map(mapRecord);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 14 }, { wch: 30 }, { wch: 25 }, { wch: 22 },
    { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Registros');
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
}

export function exportRecordsToCSV(records: HistoricalRecord[], filename = 'registros_vigilancia') {
  const mapped = records.map(mapRecord);
  if (mapped.length === 0) return;

  const headers = Object.keys(mapped[0]);
  const rows = mapped.map(row =>
    headers.map(h => {
      const val = String((row as Record<string, string>)[h] ?? '');
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const ts = format(new Date(), 'yyyyMMdd_HHmmss');
  downloadBlob(blob, `${filename}_${ts}.csv`);
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
