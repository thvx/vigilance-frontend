import { Alert, CRIME_TYPE_LABELS, CRIME_TYPE_SEVERITY } from '@/types/surveillance';
import { AlertTriangle, Clock, MapPin, Volume2, ChevronRight, Shield, Link2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertPanelProps {
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
}

const MAX_ALERT_PANEL_HEIGHT = 'max-h-[calc(100vh-200px)]';

export function AlertPanel({ alerts, onAlertSelect }: AlertPanelProps) {
  const pendingAlerts = alerts.filter(a => a.validation_status === 'pending' || a.validation_status === 'confirmed');

  const groupedAlerts = pendingAlerts.reduce((acc, alert) => {
    if (alert.id) {
      if (!acc[alert.id]) acc[alert.id] = [];
      acc[alert.id].push(alert);
    }
    return acc;
  }, {} as Record<string, Alert[]>);

  return (
    <div className={cn('bg-card rounded-lg border border-border overflow-hidden flex flex-col', MAX_ALERT_PANEL_HEIGHT)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h2 className="font-semibold text-foreground">Alertas Activas</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
          {pendingAlerts.length}
        </span>
      </div>

      {/* Alert List with scroll */}
      <ScrollArea className="flex-1">
        {pendingAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
            <Shield className="w-12 h-12 text-success/50 mb-3" />
            <p className="text-sm text-muted-foreground">Sin alertas activas</p>
            <p className="text-xs text-muted-foreground/70">Sistema monitoreando</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingAlerts.map((alert) => {
              const relatedCount = alert.id
                ? (groupedAlerts[alert.id]?.length || 1) - 1
                : 0;
              return (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => onAlertSelect(alert)}
                  relatedCount={relatedCount}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
  relatedCount: number;
}

function AlertCard({ alert, onClick, relatedCount }: AlertCardProps) {
  const severity = CRIME_TYPE_SEVERITY[alert.crime_type];
  const isEscalated = alert.validation_status === 'confirmed';

  return (
    <TooltipProvider>
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 sm:p-4 text-left transition-all duration-200 hover:bg-secondary/50 group',
          isEscalated && 'bg-destructive/5'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
            severity === 'critical' && 'bg-destructive animate-pulse',
            severity === 'high' && 'bg-destructive',
            severity === 'medium' && 'bg-warning',
            severity === 'low' && 'bg-primary'
          )} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn(
                'font-semibold text-sm',
                severity === 'critical' || severity === 'high' ? 'text-destructive' : 'text-foreground'
              )}>
                {CRIME_TYPE_LABELS[alert.crime_type]}
              </span>
              <span className={cn(
                'text-xs font-mono px-1.5 py-0.5 rounded',
                alert.confidence >= 0.9 ? 'bg-destructive/20 text-destructive' :
                alert.confidence >= 0.8 ? 'bg-warning/20 text-warning' :
                'bg-muted text-muted-foreground'
              )}>
                {(alert.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-xs text-foreground/80 font-medium truncate">{alert.camera_name}</p>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] truncate">{alert.location}</span>
            </div>

            {relatedCount > 0 && (
              <div className="flex items-center gap-1 mt-2 px-2 py-1 rounded bg-primary/10 text-primary w-fit">
                <Link2 className="w-3 h-3" />
                <span className="text-[10px] font-medium">
                  Seguimiento en {relatedCount + 1} cámaras
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-[10px]">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: es })}
                </span>
              </div>

              {alert.pa_triggered && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-primary cursor-help">
                      <Volume2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium">PA</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs">Perifoneo activado</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {isEscalated && (
              <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded bg-success/20 text-success w-fit">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px] font-bold">CONFIRMADO</span>
              </div>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
        </div>
      </button>
    </TooltipProvider>
  );
}
