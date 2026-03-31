import { HistoricalRecord, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { CheckCircle, XCircle, Clock, Search, Download, Play } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RecordTableProps {
  records: HistoricalRecord[];
  onRecordClick: (record: HistoricalRecord) => void;
  onExportSingle: (record: HistoricalRecord) => void;
}

export function RecordTable({ records, onRecordClick, onExportSingle }: RecordTableProps) {
  if (records.length === 0) {
    return (
      <div className="p-8 text-center">
        <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No se encontraron registros</p>
        <p className="text-xs text-muted-foreground/70">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID / Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cámara</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Delito</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Confianza</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Validado por</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => onRecordClick(record)}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-mono text-foreground">{record.id}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(record.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{record.camera_name}</p>
                  <p className="text-xs text-muted-foreground">{record.location}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{CRIME_TYPE_LABELS[record.crime_type]}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-sm font-mono',
                    record.confidence >= 0.9 ? 'text-destructive' :
                    record.confidence >= 0.8 ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {(record.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.validation_status} />
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{record.validated_by || '-'}</p>
                  {record.validated_at && (
                    <p className="text-[10px] text-muted-foreground">
                      {format(record.validated_at, 'HH:mm', { locale: es })}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onRecordClick(record)}
                      title="Ver clip"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onExportSingle(record)}
                      title="Exportar registro"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {records.map((record) => (
          <button
            key={record.id}
            className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
            onClick={() => onRecordClick(record)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-mono text-foreground">{record.id}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(record.timestamp, 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
              <StatusBadge status={record.validation_status} />
            </div>
            <p className="text-sm text-foreground font-medium">{record.camera_name}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{CRIME_TYPE_LABELS[record.crime_type]}</span>
              <span className={cn(
                'text-xs font-mono',
                record.confidence >= 0.9 ? 'text-destructive' :
                record.confidence >= 0.8 ? 'text-warning' : 'text-muted-foreground'
              )}>
                {(record.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onRecordClick(record)}>
                <Play className="w-3 h-3 mr-1" /> Ver clip
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onExportSingle(record)}>
                <Download className="w-3 h-3 mr-1" /> Exportar
              </Button>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: HistoricalRecord['validation_status'] }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
      status === 'confirmed' && 'bg-success/20 text-success',
      status === 'false_positive' && 'bg-destructive/20 text-destructive',
      status === 'pending' && 'bg-warning/20 text-warning'
    )}>
      {status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
      {status === 'false_positive' && <XCircle className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status === 'confirmed' ? 'Confirmado' : status === 'false_positive' ? 'Falso' : 'Pendiente'}
    </div>
  );
}
