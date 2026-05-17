import {
  useState,
  useMemo,
  useCallback,
  useEffect
} from 'react';

import { HistoricalRecord } from '@/types/surveillance';
import { exportRecordsToExcel, exportSingleRecordToExcel } from '@/services/exportService';
import { apiClient } from '@/services/api';
import { downloadBlob } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';

const USE_MOCK = false;

const CRIME_TYPE_BACKEND_MAP: Record<string, string> = {
  theft: "hurto",
  robbery: "robo",
  assault: "agresion",
  vandalism: "vandalismo",
  suspicious_activity: "actividad_sospechosa",
  intrusion: "intrusion",
  vehicle_theft: "robo_vehiculo",
  armed_threat: "amenaza_armada"
};

const STATUS_BACKEND_MAP: Record<string, string> = {
  true_positive: "confirmed",
  false_positive: "false_positive",
  pending: "pending"
};

export interface DateFilter {
  mode: 'single' | 'range';
  from: Date | null;
  to: Date | null;
}

export interface RecordFilters {
  search: string;
  crimeTypes: string[];
  statuses: string[];
  date: DateFilter;
}

export function useRecords() {

  const [filters, setFilters] = useState<RecordFilters>({
    search: '',
    crimeTypes: [],
    statuses: [],
    date: { mode: 'range', from: null, to: null },
  });

  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRecord | null>(null);

  const { toast } = useToast();

  useEffect(() => {

    if (USE_MOCK) return;

    const controller = new AbortController();

    const fetchRecords = async () => {
      try {
        setLoading(true);

        // ── Construir params ──────────────────────────────
        const params = new URLSearchParams();

        if (filters.search) {
          params.append("search", filters.search);
        }

        if (filters.crimeTypes.length > 0) {
          const mapped = filters.crimeTypes.map(
            (type) => CRIME_TYPE_BACKEND_MAP[type] || type
          );
          params.append("crime_type", mapped[0]);
        }

        if (filters.statuses.length > 0) {
          const mappedStatuses = filters.statuses.map(
            (s) => STATUS_BACKEND_MAP[s] || s
          );
          params.append("validation", mappedStatuses[0]);
        }

        if (filters.date.from) {
          params.append("date_from", filters.date.from.toISOString());
        }

        if (filters.date.to) {
          params.append("date_to", filters.date.to.toISOString());
        }

        const url = `http://127.0.0.1:8000/api/records?${params.toString()}`;
        console.log("🔥 URL FINAL:", url);

        const res = await fetch(url, {
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        console.log("🔥 RESPONSE:", data);

        if (Array.isArray(data)) {
          setRecords(data);
          setTotalCount(data.length);
        } else if (data.data) {
          setRecords(data.data);
          setTotalCount(data.total ?? data.data.length);
        } else {
          setRecords([]);
          setTotalCount(0);
        }

      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error('❌ Error cargando records:', err);
        setRecords([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchRecords, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };

  }, [filters]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records;
  }, [records]);

  const updateFilter = useCallback(
    <K extends keyof RecordFilters>(
      key: K,
      value: RecordFilters[K]
    ) => {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    },
    []
  );

  const handleExportAll = useCallback(async () => {
    try {
      const params: Record<string, string> = {};

      if (filters.search) params.search = filters.search;

      if (filters.crimeTypes.length) {
        const mapped = filters.crimeTypes.map(
          (t) => CRIME_TYPE_BACKEND_MAP[t] || t
        );
        params.crime_type = mapped[0];
      }

      if (filters.statuses.length) {
        const mappedStatuses = filters.statuses.map(
          (s) => STATUS_BACKEND_MAP[s] || s
        );
        params.validation = mappedStatuses[0];
      }

      if (filters.date.from) params.date_from = filters.date.from.toISOString();
      if (filters.date.to) params.date_to = filters.date.to.toISOString();

      const blob = await apiClient.getBlob('/export/records/excel', params);
      downloadBlob(blob, `registros_${Date.now()}.xlsx`);

    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo exportar',
        variant: 'destructive'
      });
    }
  }, [filters, toast]);

  const handleExportSingle = useCallback(
    async (record: HistoricalRecord) => {
      try {
        const blob = await apiClient.getBlob(`/export/records/${record.id}/zip`);
        downloadBlob(blob, `registro_${record.id}.zip`);
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo exportar',
          variant: 'destructive'
        });
      }
    },
    [toast]
  );

  const getClipUrl = useCallback((id: string) => {
    return `http://127.0.0.1:8000/api/records/${id}/clip`;
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
    totalCount,
    loading,
  };
}