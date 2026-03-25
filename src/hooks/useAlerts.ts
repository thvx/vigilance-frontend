import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, Camera, CRIME_TYPE_LABELS } from '@/types/surveillance';
import { mockAlerts, generateRandomAlert, generateRelatedAlert } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing alerts state, including mock simulation
 * and multi-camera tracking. Replace mock logic with WebSocket
 * events in production.
 */
export function useAlerts(cameras: Camera[]) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const { toast } = useToast();

  // Simulate new alerts (replace with wsService.on('alert:new') in production)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev]);

        toast({
          title: '🚨 Nueva Alerta Detectada',
          description: `${newAlert.cameraName} - ${CRIME_TYPE_LABELS[newAlert.crimeType]}`,
          variant: 'destructive',
        });

        // Multi-camera tracking simulation
        if (Math.random() > 0.7) {
          setTimeout(() => {
            const relatedAlert = generateRelatedAlert(newAlert, cameras);
            if (relatedAlert) {
              setAlerts(prev => {
                const updated = prev.map(a =>
                  a.id === newAlert.id
                    ? { ...a, relatedAlerts: [...(a.relatedAlerts || []), relatedAlert.id] }
                    : a
                );
                return [relatedAlert, ...updated];
              });

              toast({
                title: '🔗 Seguimiento Multi-Cámara',
                description: `Sujeto detectado continuando en ${relatedAlert.cameraName}`,
              });
            }
          }, 5000 + Math.random() * 10000);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [toast, cameras]);

  const handleValidate = useCallback((alertId: string, isTrue: boolean) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: isTrue ? 'validated_true' : 'validated_false' }
        : alert
    ));

    toast({
      title: isTrue ? '✓ Alerta Validada' : '✗ Falso Positivo Registrado',
      description: `El evento ${alertId} ha sido clasificado`,
      variant: isTrue ? 'default' : 'destructive',
    });
  }, [toast]);

  const getRelatedAlerts = useCallback((alert: Alert | null) => {
    if (!alert?.trackingId) return [];
    return alerts.filter(a => a.trackingId === alert.trackingId && a.id !== alert.id);
  }, [alerts]);

  return { alerts, handleValidate, getRelatedAlerts };
}
