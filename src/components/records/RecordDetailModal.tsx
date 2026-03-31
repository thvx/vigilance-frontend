import { HistoricalRecord, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Clock, MapPin, Download, Play, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RecordDetailModalProps {
  record: HistoricalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (record: HistoricalRecord) => void;
  clipUrl: string | null;
}

export function RecordDetailModal({ record, isOpen, onClose, onExport, clipUrl }: RecordDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Play className="w-5 h-5 text-primary" />
            Detalle del Registro - {record.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Clip */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
            {clipUrl ? (
              <video
                controls
                className="w-full h-full object-cover"
                src={clipUrl}
                poster=""
              >
                Tu navegador no soporta video HTML5.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Clip del incidente</p>
                  <p className="text-xs text-muted-foreground/70">
                    El clip se cargará desde el backend cuando esté disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem icon={Camera} label="Cámara" value={record.camera_name} />
            <DetailItem icon={MapPin} label="Ubicación" value={record.location} />
            <DetailItem
              icon={Clock}
              label="Fecha/Hora"
              value={format(record.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: es })}
            />
            <DetailItem icon={FileText} label="Tipo" value={CRIME_TYPE_LABELS[record.crime_type]} />
          </div>

          {/* Metadata */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Confianza</p>
                <p className={cn(
                  'text-sm font-mono font-bold',
                  record.confidence >= 0.9 ? 'text-destructive' :
                  record.confidence >= 0.8 ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {(record.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
                <p className={cn(
                  'text-sm font-medium',
                  record.validation_status === 'confirmed' && 'text-success',
                  record.validation_status === 'false_positive' && 'text-destructive',
                  record.validation_status === 'pending' && 'text-warning'
                )}>
                  {record.validation_status === 'confirmed' ? 'Confirmado'
                    : record.validation_status === 'false_positive' ? 'Falso Positivo'
                    : 'Pendiente'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Validado por</p>
                <p className="text-sm text-foreground">{record.validated_by || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Registro ID</p>
                <p className="text-sm font-mono text-foreground">{record.id || '-'}</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={() => onExport(record)}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Registro (Excel + Clip MP4)
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            En producción, el clip MP4 y datos se descargan como archivo ZIP desde el backend
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}
