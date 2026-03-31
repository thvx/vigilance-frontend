import { Alert, CRIME_TYPE_LABELS, CRIME_TYPE_SEVERITY } from '@/types/surveillance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  MessageSquare
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

export function ValidationModal({ alert, isOpen, onClose, onValidate, relatedAlerts = [] }: ValidationModalProps) {
  if (!alert) return null;

  const severity = CRIME_TYPE_SEVERITY[alert.crime_type];

  const handleValidate = (isTrue: boolean) => {
    onValidate(alert.id, isTrue);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Validación de Alerta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Vista previa del evento</p>
                <p className="text-xs text-muted-foreground/70 font-mono">{alert.camera_id}</p>
              </div>
            </div>
            
            {/* Alert Badge */}
            <div className={cn(
              'absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5',
              severity === 'critical' && 'bg-destructive text-destructive-foreground',
              severity === 'high' && 'bg-destructive/90 text-destructive-foreground',
              severity === 'medium' && 'bg-warning text-warning-foreground',
              severity === 'low' && 'bg-primary text-primary-foreground'
            )}>
              <AlertTriangle className="w-3 h-3" />
              {CRIME_TYPE_LABELS[alert.crime_type]}
            </div>

            {/* Confidence Score */}
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-background/90 border border-border">
              <span className="text-xs font-mono text-foreground">
                Confianza: <span className={cn(
                  alert.confidence >= 0.9 ? 'text-destructive' :
                  alert.confidence >= 0.8 ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {(alert.confidence * 100).toFixed(1)}%
                </span>
              </span>
            </div>

            {/* Event ID Badge */}
            {alert.id && (
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs font-mono flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {alert.id.slice(0, 8)}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Cámara:</span>
                <span className="text-foreground font-medium">{alert.camera_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="text-foreground font-medium">{alert.location}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Hora:</span>
                <span className="text-foreground font-mono">
                  {format(alert.timestamp, 'HH:mm:ss', { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className={cn('w-4 h-4', alert.pa_triggered ? 'text-success' : 'text-muted-foreground')} />
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
                  <p className="text-sm text-foreground">Perifoneo activado para este evento</p>
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
                      {format(related.timestamp, 'HH:mm:ss', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                El sospechoso fue detectado en {relatedAlerts.length + 1} cámaras
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID del Evento</p>
                <p className="font-mono text-sm text-foreground">{alert.id}</p>
              </div>
              {alert.id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ID del Evento</p>
                  <p className="font-mono text-sm text-foreground">{alert.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Validation Buttons */}
          <div className="flex gap-3 pt-2">
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

          <p className="text-xs text-center text-muted-foreground">
            La validación se registrará para el bucle de retroalimentación del modelo
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
