import { SystemMetrics } from '@/types/surveillance';
import { Activity, Camera, AlertCircle, Clock, Target, Server, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsPanelProps {
  metrics: SystemMetrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-3 sm:px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground text-sm sm:text-base">Métricas del Sistema</h2>
        </div>
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <MetricCard icon={Camera} label="Cámaras Activas" value={`${metrics.online_cameras || 0}/${metrics.total_cameras || 0}`}
          status={(metrics.online_cameras || 0) === (metrics.total_cameras || 0) ? 'success' : 'warning'} />
        <MetricCard icon={AlertCircle} label="Alertas Hoy" value={(metrics.alerts_today || 0).toString()}
          status={(metrics.alerts_today || 0) > 20 ? 'warning' : 'neutral'} />
        <MetricCard icon={Clock} label="Latencia Prom." value={`${((metrics.avg_latency_ms || 0) / 1000).toFixed(1)}s`}
          status={(metrics.avg_latency_ms || 0) < 2000 ? 'success' : (metrics.avg_latency_ms || 0) < 3000 ? 'warning' : 'error'} threshold="< 3s" />
        <MetricCard icon={Target} label="Precisión Modelo" value={`${(metrics.model_accuracy || 0).toFixed(1)}%`}
          status={(metrics.model_accuracy || 0) >= 90 ? 'success' : 'warning'} threshold="> 90%" />
        <MetricCard icon={Server} label="Uptime" value={`${(metrics.uptime_pct || 0).toFixed(2)}%`}
          status={(metrics.uptime_pct || 0) >= 99.9 ? 'success' : 'warning'} threshold="> 99.9%" />
        <MetricCard icon={Gauge} label="FPS" value={`${metrics.processing_fps || 0}`}
          status={(metrics.processing_fps || 0) >= 15 ? 'success' : 'error'} threshold="> 15" />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'neutral';
  threshold?: string;
}

function MetricCard({ icon: Icon, label, value, status, threshold }: MetricCardProps) {
  return (
    <div className="p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        <Icon className={cn(
          'w-3.5 h-3.5 sm:w-4 sm:h-4',
          status === 'success' && 'text-success',
          status === 'warning' && 'text-warning',
          status === 'error' && 'text-destructive',
          status === 'neutral' && 'text-muted-foreground'
        )} />
        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={cn(
          'text-base sm:text-xl font-bold font-mono',
          status === 'success' && 'text-success',
          status === 'warning' && 'text-warning',
          status === 'error' && 'text-destructive',
          status === 'neutral' && 'text-foreground'
        )}>
          {value}
        </span>
        {threshold && (
          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono hidden sm:inline">{threshold}</span>
        )}
      </div>
    </div>
  );
}
