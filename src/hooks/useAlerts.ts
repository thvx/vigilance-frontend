import {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

import {
  Alert,
  Camera,
  CRIME_TYPE_LABELS
} from '@/types/surveillance';

import { useToast } from '@/hooks/use-toast';

import { API_CONFIG } from '@/config/api';

export function useAlerts(
  cameras: Camera[]
) {

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [connected, setConnected] =
    useState(false);

  const { toast } = useToast();

  const wsRef =
    useRef<WebSocket | null>(null);

  const reconnectTimeout =
    useRef<NodeJS.Timeout | null>(null);

  const lastAlertRef =
    useRef<number>(0);

  useEffect(() => {

    if (
      !cameras ||
      cameras.length === 0
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        'token'
      );

    if (!token) {

      console.warn(
        '⚠️ No hay token'
      );

      return;
    }

    const connect = () => {

      if (wsRef.current) {
        return;
      }

      const ws =
        new WebSocket(
          `${API_CONFIG.wsUrl}/alerts`
        );

      wsRef.current = ws;

      // ─────────────────────────────
      // CONNECT
      // ─────────────────────────────

      ws.onopen = () => {

        console.log(
          '🟢 WebSocket conectado'
        );

        setConnected(true);
      };

      // ─────────────────────────────
      // MESSAGE
      // ─────────────────────────────

      ws.onmessage = (event) => {

        try {

          const data =
            JSON.parse(event.data);

          console.log(
            '📩 ALERTA RECIBIDA:',
            data
          );

          const now =
            Date.now();

          // evita spam
          if (
            now -
              lastAlertRef.current <
            5000
          ) {
            return;
          }

          lastAlertRef.current =
            now;

          if (!data.camera_id) {
            return;
          }

          // ✅ FIX IMPORTANTE
          // el backend ya manda:
          // CAM-001
          // CAM-002
          // etc

          const cameraIdFormatted =
            data.camera_id;

          const camera =
            cameras.find(
              c =>
                c.id ===
                cameraIdFormatted
            );

          if (!camera) {

            console.warn(
              '⚠️ Cámara no encontrada:',
              cameraIdFormatted
            );

            return;
          }

          const newAlert: Alert = {

            id:
              `ALT-${Date.now()}`,

            camera_id:
              camera.id,

            camera_name:
              camera.name,

            timestamp:
              data.timestamp,

            crime_type:
              data.prediction.toLowerCase(),

            confidence:
              data.confidence,

            validation_status:
              'pending',

            location:
              camera.location,

            pa_triggered:
              data.confidence > 0.85,

            related_cameras: [],

            severity:
              data.confidence > 0.9
                ? 'critical'
                : data.confidence >
                  0.85
                ? 'high'
                : data.confidence >
                  0.75
                ? 'medium'
                : 'low',
          };

          // evita duplicados
          setAlerts(prev => {

            const exists =
              prev.find(
                a =>
                  a.camera_id ===
                    newAlert.camera_id &&
                  a.crime_type ===
                    newAlert.crime_type &&
                  Date.now() -
                    new Date(
                      a.timestamp
                    ).getTime() <
                    10000
              );

            if (exists) {
              return prev;
            }

            return [
              newAlert,
              ...prev,
            ].slice(0, 50);
          });

          toast({

            title:
              '🚨 Alerta detectada',

            description:
              `${newAlert.camera_name} - ${
                CRIME_TYPE_LABELS[
                  newAlert.crime_type
                ] ||
                newAlert.crime_type
              }`,

            variant:
              'destructive',
          });

        } catch (err) {

          console.error(
            '❌ Error parseando WS:',
            err
          );
        }
      };

      // ─────────────────────────────
      // CLOSE
      // ─────────────────────────────

      ws.onclose = () => {

        console.warn(
          '🔴 WebSocket desconectado'
        );

        setConnected(false);

        wsRef.current = null;

        reconnectTimeout.current =
          setTimeout(() => {

            connect();

          }, 3000);
      };

      // ─────────────────────────────
      // ERROR
      // ─────────────────────────────

      ws.onerror = (err) => {

        console.error(
          '❌ WS error:',
          err
        );

        ws.close();
      };
    };

    connect();

    // cleanup
    return () => {

      if (
        reconnectTimeout.current
      ) {
        clearTimeout(
          reconnectTimeout.current
        );
      }

      if (wsRef.current) {

        wsRef.current.close();

        wsRef.current = null;
      }
    };

  }, [cameras, toast]);

  // ─────────────────────────────
  // VALIDAR ALERTA
  // ─────────────────────────────

  const handleValidate =
    useCallback(

      (
        alertId: string,
        isTrue: boolean
      ) => {

        setAlerts(prev =>
          prev.map(alert =>

            alert.id === alertId

              ? {
                  ...alert,

                  validation_status:
                    isTrue
                      ? 'confirmed'
                      : 'false_positive',
                }

              : alert
          )
        );

        toast({

          title: isTrue
            ? '✓ Alerta validada'
            : '✗ Falso positivo',

          description:
            alertId,

          variant: isTrue
            ? 'default'
            : 'destructive',
        });

      },

      [toast]
    );

  // ─────────────────────────────
  // ALERTAS RELACIONADAS
  // ─────────────────────────────

  const getRelatedAlerts =
    useCallback(

      (alert: Alert | null) => {

        if (
          !alert?.related_cameras
            ?.length
        ) {
          return [];
        }

        return alerts.filter(
          a =>

            alert.related_cameras.includes(
              a.camera_id
            ) &&

            a.id !== alert.id
        );
      },

      [alerts]
    );

  return {

    alerts,

    handleValidate,

    getRelatedAlerts,

    connected,
  };
}