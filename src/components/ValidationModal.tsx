import { useState } from 'react';
import { Alert, CRIME_TYPE_LABELS, CRIME_TYPE_SEVERITY, SEVERITY_LABELS, PA_MESSAGES } from '@/types/surveillance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  Volume2,
  Shield,
  Link2,
  MessageSquare,
  StickyNote,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ValidationModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (alertId: string, isTrue: boolean) => void;
  relatedAlerts?: Alert[];
}

export function ValidationModal({
  alert,
  isOpen,
  onClose,
  onValidate,
  relatedAlerts = [],
}: ValidationModalProps) {
  const [notes, setNotes] = useState('');

  if (!alert) return null;

  const severity = CRIME_TYPE_SEVERITY[alert.crime_type];
  const isEscalated = alert.validation_status === 'confirmed';
  const alertDate = new Date(alert.timestamp);
  const isValidDate = !isNaN(alertDate.getTime());

  const handleValidate = (isTrue: boolean) => {
    onValidate(alert.id, isTrue);
    setNotes('');
    onClose();
  };

  const severityColorClass = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-destructive/90 text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-primary text-primary-foreground',
  }[severity] ?? 'bg-muted text-muted-foreground';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Gestión de Alerta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Event preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Vista previa del evento</p>
                <p className="text-xs text-muted-foreground/70 font-mono">{alert.camera_id}</p>
              </div>
            </div>

            {/* Alert type badge */}
            <div className={cn(
              'absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5',
              severityColorClass
            )}>
              <AlertTriangle className="w-3 h-3" />
              {CRIME_TYPE_LABELS[alert.crime_type] || alert.crime_type}
            </div>

            {/* Confidence score */}
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-background/90 border border-border">
              <span className="text-xs font-mono text-foreground">
                Conf:{' '}
                <span className={cn(
                  alert.confidence >= 0.9 ? 'text-destructive' :
                  alert.confidence >= 0.8 ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {(alert.confidence * 100).toFixed(1)}%
                </span>
              </span>
            </div>

            {/* Event ID badge */}
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs font-mono flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              {alert.id.slice(0, 10)}
            </div>

            {/* Escalated badge */}
            {isEscalated && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-success/90 text-success-foreground text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                ESCALADO
              </div>
            )}
          </div>

          {/* Event details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Cámara:</span>
                <span className="text-foreground font-medium truncate">{alert.camera_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="text-foreground font-medium truncate">{alert.location}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Fecha/Hora:</span>
                <span className="text-foreground font-mono text-xs">
                  {isValidDate
                    ? format(alertDate, 'dd/MM/yy HH:mm:ss', { locale: es })
                    : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className={cn(
                  'w-4 h-4 flex-shrink-0',
                  alert.pa_triggered ? 'text-success' : 'text-muted-foreground'
                )} />
                <span className="text-muted-foreground">Perifoneo:</span>
                <span className={cn(
                  'font-medium',
                  alert.pa_triggered ? 'text-success' : 'text-muted-foreground'
                )}>
                  {alert.pa_triggered ? 'Activado' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* PA Message */}
          {alert.pa_triggered && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-primary font-medium mb-1">Mensaje de Perifoneo</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {PA_MESSAGES[alert.crime_type] || 'Perifoneo activado para este evento'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-camera tracking */}
          {relatedAlerts.length > 0 && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Seguimiento Multi-Cámara</p>
              </div>
              <div className="space-y-2">
                {relatedAlerts.map((related) => (
                  <div key={related.id} className="flex items-center justify-between text-xs p-2 rounded bg-background/50">
                    <div className="flex items-center gap-2">
                      <Camera className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground">{related.camera_name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      {format(new Date(related.timestamp), 'HH:mm:ss', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Sospechoso detectado en {relatedAlerts.length + 1} cámaras
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">ID del Evento</p>
                <p className="font-mono text-sm text-foreground break-all">{alert.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Severidad</p>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold',
                  severityColorClass
                )}>
                  {SEVERITY_LABELS[severity] || severity}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">ID Cámara</p>
                <p className="font-mono text-sm text-foreground">{alert.camera_id}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Estado actual</p>
                <p className={cn(
                  'text-sm font-medium',
                  alert.validation_status === 'confirmed' && 'text-success',
                  alert.validation_status === 'false_positive' && 'text-destructive',
                  alert.validation_status === 'pending' && 'text-warning',
                )}>
                  {alert.validation_status === 'confirmed' ? 'Confirmado'
                    : alert.validation_status === 'false_positive' ? 'Falso Positivo'
                    : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>

          {/* Operator notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium text-foreground">
                Observaciones del operador
              </label>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones, contexto o instrucciones adicionales..."
              rows={3}
              className="resize-none bg-background border-border text-sm"
            />
          </div>

          {/* Validation actions */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => handleValidate(false)}
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Falso Positivo
            </Button>
            <Button
              onClick={() => handleValidate(true)}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Positivo Verdadero
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            La validación se registra para el ciclo de retroalimentación del modelo de IA
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
