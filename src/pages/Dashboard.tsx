import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CameraGrid } from '@/components/CameraGrid';
import { AlertPanel } from '@/components/AlertPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ValidationModal } from '@/components/ValidationModal';
import { RecordsSearch } from '@/components/RecordsSearch';
import { Camera, Alert } from '@/types/surveillance';
import { mockCameras, mockSystemMetrics } from '@/data/mockData';
import { useAlerts } from '@/hooks/useAlerts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitorPlay, History, LayoutDashboard, MapPin } from 'lucide-react';

const Dashboard = () => {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [metrics] = useState(mockSystemMetrics);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  const { alerts, handleValidate, getRelatedAlerts } = useAlerts(cameras);

  const relatedAlerts = useMemo(
    () => getRelatedAlerts(selectedAlert),
    [selectedAlert, getRelatedAlerts]
  );

  const handleAlertSelect = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsValidationOpen(true);
  };

  const handleCamerasReorder = (reorderedCameras: Camera[]) => {
    setCameras(reorderedCameras);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader metrics={metrics} />

      <main className="p-3 sm:p-4 lg:p-6">
        <Tabs defaultValue="monitoring" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-secondary border border-border w-full sm:w-auto">
            <TabsTrigger value="monitoring" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MonitorPlay className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Monitoreo en Vivo</span>
              <span className="sm:hidden">En Vivo</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Registros Históricos</span>
              <span className="sm:hidden">Registros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Camera Grid - Takes 3 columns */}
              <div className="xl:col-span-3 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    Grid de Cámaras
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Independencia, Lima, Perú
                    </span>
                    <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                      Genetec Security Center 5.10
                    </span>
                  </div>
                </div>
                <CameraGrid
                  cameras={cameras}
                  onCameraSelect={setSelectedCamera}
                  onCamerasReorder={handleCamerasReorder}
                  selectedCameraId={selectedCamera?.id}
                />
                <MetricsPanel metrics={metrics} />
              </div>

              {/* Alert Panel - max height with scroll */}
              <div className="xl:col-span-1">
                <AlertPanel
                  alerts={alerts}
                  onAlertSelect={handleAlertSelect}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="records" className="animate-fade-in">
            <RecordsSearch />
          </TabsContent>
        </Tabs>
      </main>

      <ValidationModal
        alert={selectedAlert}
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        onValidate={handleValidate}
        relatedAlerts={relatedAlerts}
      />
    </div>
  );
};

export default Dashboard;
