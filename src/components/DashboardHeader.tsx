import { Shield, Wifi, Clock, Activity } from 'lucide-react';
import { SystemMetrics } from '@/types/surveillance';
import { useState, useEffect } from 'react';

interface DashboardHeaderProps {
  metrics: SystemMetrics;
}

export function DashboardHeader({ metrics }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
      setCurrentDate(new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary box-glow-primary flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                Centro de Vigilancia 
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:block">
                Sistema de Detección de Actividades Criminales
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <Wifi className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">Esperando Conexión</span>
            </div>

            {/* Active Cameras */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-secondary border border-border">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[10px] sm:text-xs font-mono text-foreground">
                {metrics.activeCameras}/{metrics.totalCameras}
              </span>
            </div>

            {/* Latency */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <div className={`w-2 h-2 rounded-full ${metrics.avgLatency < 2 ? 'bg-success' : metrics.avgLatency < 3 ? 'bg-warning' : 'bg-destructive'}`} />
              <span className="text-xs font-mono text-foreground">
                {metrics.avgLatency.toFixed(1)}s
              </span>
            </div>

            {/* Time */}
            <div className="text-right hidden lg:block">
              <div className="text-lg font-mono font-bold text-foreground">{currentTime}</div>
              <div className="text-xs text-muted-foreground capitalize">{currentDate}</div>
            </div>
            <div className="lg:hidden text-right">
              <div className="text-sm font-mono font-bold text-foreground">{currentTime}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
