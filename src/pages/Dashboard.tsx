import { useState, useMemo, useEffect, useRef } from 'react';

import { DashboardHeader } from '@/components/DashboardHeader';
import { CameraGrid } from '@/components/CameraGrid';
import { AlertPanel } from '@/components/AlertPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ValidationModal } from '@/components/ValidationModal';
import { RecordsSearch } from '@/components/RecordsSearch';

import { Camera, Alert, SystemMetrics } from '@/types/surveillance';

import { useAlerts } from '@/hooks/useAlerts';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import {
  MonitorPlay,
  History,
  LayoutDashboard
} from 'lucide-react';

import {
  cameraService,
  metricsService,
  apiClient
} from '@/services/api';

const Dashboard = () => {

  const gridRef = useRef<HTMLDivElement | null>(null);

  const [cameras, setCameras] =
    useState<Camera[]>([]);

  const [metrics, setMetrics] =
    useState<SystemMetrics | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedCamera, setSelectedCamera] =
    useState<Camera | null>(null);

  const [selectedAlert, setSelectedAlert] =
    useState<Alert | null>(null);

  const [isValidationOpen, setIsValidationOpen] =
    useState(false);

  const {
    alerts,
    handleValidate,
    getRelatedAlerts,
    connected
  } = useAlerts(cameras);

  // ─────────────────────────────
  // AUTH CHECK
  // ─────────────────────────────

  useEffect(() => {

    const token =
      localStorage.getItem('token');

    if (!token) {

      window.location.href =
        '/login';

      return;
    }

    apiClient.setToken(token);

  }, []);

  // ─────────────────────────────
  // LOAD DASHBOARD DATA
  // ─────────────────────────────

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        const camerasData =
          await cameraService.getAll();

        setCameras(camerasData);

        setMetrics({
          total_cameras: camerasData.length,

          online_cameras:
            camerasData.filter(
              c => c.status === 'online'
            ).length,

          offline_cameras:
            camerasData.filter(
              c => c.status === 'offline'
            ).length,

          warning_cameras:
            camerasData.filter(
              c => c.status === 'warning'
            ).length,

          alerts_today: 0,

          avg_latency_ms:
            camerasData.reduce(
              (acc, c) =>
                acc + (c.latency_ms || 0),
              0
            ) / camerasData.length,

          avg_fps:
            camerasData.reduce(
              (acc, c) =>
                acc + (c.fps || 0),
              0
            ) / camerasData.length,

          model_accuracy: 94.5,

          uptime_pct: 99.9,

          processing_fps: 28,
        });

      } catch (err: any) {

        console.error(
          '❌ Error cargando dashboard:',
          err
        );

        if (err.status === 401) {

          localStorage.removeItem('token');

          window.location.href =
            '/login';
        }

      } finally {

        setLoading(false);
      }
    };

    loadData();

  }, []);

  // 🔥 AUTO SCROLL AL CARGAR GRID
  useEffect(() => {

    if (!loading && gridRef.current) {

      gridRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

    }

  }, [loading]);

  // ─────────────────────────────
  // RELATED ALERTS
  // ─────────────────────────────

  const relatedAlerts = useMemo(
    () =>
      getRelatedAlerts(
        selectedAlert
      ),
    [
      selectedAlert,
      getRelatedAlerts
    ]
  );

  // ─────────────────────────────
  // ALERT SELECT
  // ─────────────────────────────

  const handleAlertSelect = (
    alert: Alert
  ) => {

    setSelectedAlert(alert);

    setIsValidationOpen(true);
  };

  // ─────────────────────────────
  // CAMERA REORDER
  // ─────────────────────────────

  const handleCamerasReorder = (
    reorderedCameras: Camera[]
  ) => {

    setCameras(reorderedCameras);
  };

  return (

    <div className="h-screen flex flex-col bg-background">

      <DashboardHeader
        metrics={
          metrics || {
            total_cameras: 0,
            online_cameras: 0,
            offline_cameras: 0,
            warning_cameras: 0,
            alerts_today: 0,
            avg_latency_ms: 0,
            avg_fps: 0,
            model_accuracy: 0,
            uptime_pct: 0,
            processing_fps: 0,
          }
        }
      />

      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">

        <Tabs
          defaultValue="monitoring"
          className="h-full flex flex-col space-y-4 sm:space-y-6"
        >

          <div className="flex items-center justify-between">

            <TabsList className="bg-secondary border border-border w-full sm:w-auto">

              <TabsTrigger value="monitoring">
                <MonitorPlay className="w-4 h-4 mr-2" />
                Monitoreo
              </TabsTrigger>

              <TabsTrigger value="records">
                <History className="w-4 h-4 mr-2" />
                Registros
              </TabsTrigger>

            </TabsList>

            <div className="text-xs font-semibold">
              {connected
                ? '🟢 En vivo'
                : '🔴 Desconectado'}
            </div>

          </div>

          <TabsContent
            value="monitoring"
            className="flex-1 overflow-hidden"
          >

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 h-full">

              <div
                ref={gridRef}
                className="xl:col-span-3 space-y-4 overflow-y-auto pr-2 scroll-smooth"
              >

                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Grid de Cámaras
                </h2>

                {loading ? (

                  <div className="text-center py-10 text-muted-foreground animate-pulse">
                    Cargando dashboard...
                  </div>

                ) : (

                  <CameraGrid
                    cameras={cameras}
                    onCameraSelect={setSelectedCamera}
                    onCamerasReorder={handleCamerasReorder}
                    selectedCameraId={selectedCamera?.id}
                  />

                )}

                {metrics && (
                  <MetricsPanel
                    metrics={metrics}
                  />
                )}

              </div>

              <div className="xl:col-span-1 h-full flex flex-col">

                <AlertPanel
                  alerts={alerts}
                  onAlertSelect={handleAlertSelect}
                />

              </div>

            </div>

          </TabsContent>

          <TabsContent value="records">

            <RecordsSearch />

          </TabsContent>

        </Tabs>

      </main>

      <ValidationModal
        alert={selectedAlert}
        isOpen={isValidationOpen}
        onClose={() =>
          setIsValidationOpen(false)
        }
        onValidate={handleValidate}
        relatedAlerts={relatedAlerts}
      />

    </div>
  );
};

export default Dashboard;