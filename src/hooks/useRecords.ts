import { useState, useMemo, useCallback } from 'react';
import { HistoricalRecord } from '@/types/surveillance';
import { mockHistoricalRecords } from '@/data/mockData';
import { exportRecordsToExcel, exportSingleRecordToExcel } from '@/services/exportService';
import { recordService, apiClient } from '@/services/api';
import { downloadBlob } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';

export interface DateFilter {
  mode: 'single' | 'range';
  from: Date | null;
  to: Date | null;
}

export interface RecordFilters {
  search: string;
  crimeTypes: string[]; // Changed to array
  statuses: string[]; // Changed to array
  date: DateFilter;
}

const USE_MOCK = true; // Toggle to false when backend is ready

export function useRecords() {
  const [filters, setFilters] = useState<RecordFilters>({
    search: '',
    crimeTypes: [],
    statuses: [],
    date: { mode: 'range', from: null, to: null },
  });
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRecord | null>(null);
  const { toast } = useToast();

  const records = mockHistoricalRecords; // Replace with API call

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch =
        record.camera_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.id.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCrimeType = filters.crimeTypes.length === 0 || filters.crimeTypes.includes(record.crime_type);
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(record.validation_status);

      let matchesDate = true;
      if (filters.date.from) {
        matchesDate = new Date(record.timestamp) >= filters.date.from;
      }
      if (filters.date.to && matchesDate) {
        const endOfDay = new Date(filters.date.to);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = new Date(record.timestamp) <= endOfDay;
      }

      return matchesSearch && matchesCrimeType && matchesStatus && matchesDate;
    });
  }, [records, filters]);

  const updateFilter = useCallback(<K extends keyof RecordFilters>(key: K, value: RecordFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleExportAll = useCallback(async () => {
    if (USE_MOCK) {
      exportRecordsToExcel(filteredRecords);
      toast({ title: '📊 Exportación completada', description: `${filteredRecords.length} registros exportados a Excel` });
      return;
    }
    try {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.crimeTypes.length) params.crime_type = filters.crimeTypes.join(',');
      if (filters.statuses.length) params.validation = filters.statuses.join(',');
      if (filters.date.from) params.date_from = filters.date.from.toISOString();
      if (filters.date.to) params.date_to = filters.date.to.toISOString();
      
      const blob = await apiClient.getBlob('/export/records/excel', params);
      downloadBlob(blob, `registros_${Date.now()}.xlsx`);
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar', variant: 'destructive' });
    }
  }, [filteredRecords, filters, toast]);

  const handleExportSingle = useCallback(async (record: HistoricalRecord) => {
    if (USE_MOCK) {
      exportSingleRecordToExcel(record);
      toast({ title: '📊 Registro exportado', description: `${record.id} exportado a Excel` });
      return;
    }
    try {
      const blob = await apiClient.getBlob(`/export/records/${record.id}/zip`);
      downloadBlob(blob, `registro_${record.id}.zip`);
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar', variant: 'destructive' });
    }
  }, [toast]);

  const getClipUrl = useCallback((id: string) => {
    if (USE_MOCK) return null;
    return recordService.getClipUrl(id);
  }, []);

  return {
    records: filteredRecords,
    filters,
    updateFilter,
    selectedRecord,
    setSelectedRecord,
    handleExportAll,
    handleExportSingle,
    getClipUrl,
    totalCount: records.length,
  };
}
