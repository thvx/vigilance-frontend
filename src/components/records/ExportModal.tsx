import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { HistoricalRecord, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { RecordFilters } from '@/hooks/useRecords';

type ExportFormat = 'excel' | 'csv';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoricalRecord[];
  filters: RecordFilters;
  onExportExcel: () => Promise<void> | void;
  onExportCSV: () => void;
}

export function ExportModal({
  isOpen,
  onClose,
  records,
  filters,
  onExportExcel,
  onExportCSV,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [loading, setLoading] = useState(false);

  const activeFilters: string[] = [
    filters.search ? `Búsqueda: "${filters.search}"` : '',
    filters.crimeTypes.length > 0
      ? `Tipos: ${filters.crimeTypes.map(t => CRIME_TYPE_LABELS[t] || t).join(', ')}`
      : '',
    filters.statuses.length > 0
      ? `Estados: ${filters.statuses.map(s =>
          s === 'confirmed' ? 'Confirmado'
          : s === 'false_positive' ? 'Falso Positivo'
          : 'Pendiente'
        ).join(', ')}`
      : '',
    filters.date.from
      ? `Desde: ${format(filters.date.from, 'dd/MM/yyyy', { locale: es })}`
      : '',
    filters.date.to
      ? `Hasta: ${format(filters.date.to, 'dd/MM/yyyy', { locale: es })}`
      : '',
  ].filter(Boolean);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (exportFormat === 'excel') {
        await onExportExcel();
      } else {
        onExportCSV();
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Download className="w-5 h-5 text-primary" />
            Exportar Registros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Format selector */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-2">
              Formato de exportación
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('excel')}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  exportFormat === 'excel'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-tight">Excel</p>
                  <p className="text-[10px] opacity-70">.xlsx — Backend</p>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('csv')}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  exportFormat === 'csv'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-tight">CSV</p>
                  <p className="text-[10px] opacity-70">.csv — Cliente</p>
                </div>
              </button>
            </div>
          </div>

          {/* Active filters summary */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                Filtros aplicados
              </p>
            </div>
            {activeFilters.length > 0 ? (
              <div className="space-y-1">
                {activeFilters.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-foreground bg-secondary/50 px-3 py-1.5 rounded"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Sin filtros — se exportarán todos los registros cargados
              </p>
            )}
          </div>

          {/* Record count */}
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 border border-border">
            <span className="text-sm text-muted-foreground">Registros a exportar</span>
            <span className="text-xl font-bold text-foreground font-mono">
              {records.length}
            </span>
          </div>

          {/* Export button */}
          <Button
            onClick={handleExport}
            disabled={loading || records.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar {records.length} registro{records.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
