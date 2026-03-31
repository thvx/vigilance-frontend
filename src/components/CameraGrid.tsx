import { useState } from 'react';
import { Camera } from '@/types/surveillance';
import { Video, VideoOff, AlertTriangle, Circle, MapPin, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CameraGridProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  onCamerasReorder?: (cameras: Camera[]) => void;
  selectedCameraId?: string;
}

export function CameraGrid({ cameras, onCameraSelect, onCamerasReorder, selectedCameraId }: CameraGridProps) {
  const [orderedCameras, setOrderedCameras] = useState<Camera[]>(cameras);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = orderedCameras.findIndex(c => c.id === draggedId);
    const targetIndex = orderedCameras.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCameras = [...orderedCameras];
    const [draggedCamera] = newCameras.splice(draggedIndex, 1);
    newCameras.splice(targetIndex, 0, draggedCamera);

    setOrderedCameras(newCameras);
    setDraggedId(null);
    onCamerasReorder?.(newCameras);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {orderedCameras.map((camera) => (
        <div
          key={camera.id}
          draggable
          onDragStart={(e) => handleDragStart(e, camera.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, camera.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'transition-opacity duration-200',
            draggedId === camera.id && 'opacity-50'
          )}
        >
          <CameraCard
            camera={camera}
            isSelected={camera.id === selectedCameraId}
            onClick={() => onCameraSelect(camera)}
            isDragging={draggedId === camera.id}
          />
        </div>
      ))}
    </div>
  );
}

interface CameraCardProps {
  camera: Camera;
  isSelected: boolean;
  onClick: () => void;
  isDragging?: boolean;
}

function CameraCard({ camera, isSelected, onClick, isDragging }: CameraCardProps) {
  const isOnline = camera.status === 'online';
  const isWarning = camera.status === 'warning';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 group w-full cursor-move',
              'bg-secondary hover:border-primary/50',
              isSelected ? 'border-primary box-glow-primary' : 'border-border',
              isDragging && 'opacity-50'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              {isOnline && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
                </div>
              )}
            </div>

            <div className="absolute inset-0 camera-overlay" />

            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm group-hover:bg-primary/20 transition-colors">
              <GripHorizontal className="w-2.5 h-2.5 text-primary opacity-60 group-hover:opacity-100" />
              <MapPin className="w-2.5 h-2.5 text-primary" />
              <span className="text-[8px] sm:text-[9px] font-medium text-foreground/90 truncate max-w-[60px] sm:max-w-[80px]">{camera.zone}</span>
            </div>

            {camera.status === 'warning' && (
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-warning/90 text-warning-foreground">
                <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[8px] sm:text-[10px] font-bold">AVISO</span>
              </div>
            )}

            {isOnline && camera.status !== 'warning' && (
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-1">
                <Circle className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-destructive text-destructive animate-pulse" />
                <span className="text-[8px] sm:text-[10px] font-mono text-foreground/80">REC</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  {isOnline ? (
                    <Video className="w-3 h-3 text-success flex-shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                  ) : (
                    <VideoOff className="w-3 h-3 text-destructive flex-shrink-0" />
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
                      {camera.name}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">
                      {camera.location}
                    </p>
                  </div>
                </div>

                {isOnline && (
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-[10px] font-mono text-primary">{camera.fps} FPS</p>
                  </div>
                )}
              </div>
            </div>

            {!isOnline && !isWarning && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <VideoOff className="w-6 h-6 sm:w-8 sm:h-8 text-destructive mx-auto mb-1" />
                  <span className="text-[10px] sm:text-xs text-destructive font-medium">DESCONECTADO</span>
                </div>
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-sm">{camera.name}</p>
            <p className="text-xs text-muted-foreground">{camera.location}, {camera.zone}</p>
            {camera.lat !== undefined && camera.lng !== undefined && (
              <p className="text-xs text-muted-foreground">
                Coords: {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
