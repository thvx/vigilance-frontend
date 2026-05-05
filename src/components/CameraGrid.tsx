import { useState, useEffect, useCallback, memo } from 'react';
import { Camera } from '@/types/surveillance';

import {
  Video,
  VideoOff,
  AlertTriangle,
  Circle,
  MapPin,
  GripHorizontal
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface CameraGridProps {

  cameras: Camera[];

  onCameraSelect: (
    camera: Camera
  ) => void;

  onCamerasReorder?: (
    cameras: Camera[]
  ) => void;

  selectedCameraId?: string;
}

export function CameraGrid({

  cameras,

  onCameraSelect,

  onCamerasReorder,

  selectedCameraId

}: CameraGridProps) {

  const [orderedCameras, setOrderedCameras] =
    useState<Camera[]>([]);

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  // ✅ SOLO UN useEffect (fix real)
  useEffect(() => {
    setOrderedCameras(cameras);
  }, [cameras]);

  // ✅ memo handlers
  const handleDragStart = useCallback((
    e: React.DragEvent,
    id: string
  ) => {

    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';

  }, []);

  const handleDragOver = useCallback((
    e: React.DragEvent
  ) => {

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent,
    targetId: string
  ) => {

    e.preventDefault();

    if (
      !draggedId ||
      draggedId === targetId
    ) return;

    const draggedIndex =
      orderedCameras.findIndex(
        c => c.id === draggedId
      );

    const targetIndex =
      orderedCameras.findIndex(
        c => c.id === targetId
      );

    if (
      draggedIndex === -1 ||
      targetIndex === -1
    ) return;

    const newCameras =
      [...orderedCameras];

    const [draggedCamera] =
      newCameras.splice(
        draggedIndex,
        1
      );

    newCameras.splice(
      targetIndex,
      0,
      draggedCamera
    );

    setOrderedCameras(newCameras);
    setDraggedId(null);

    onCamerasReorder?.(newCameras);

  }, [draggedId, orderedCameras, onCamerasReorder]);

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">

      {orderedCameras.map(camera => (

        <CameraItem
          key={camera.id}
          camera={camera}
          selectedCameraId={selectedCameraId}
          draggedId={draggedId}
          onCameraSelect={onCameraSelect}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          setDraggedId={setDraggedId}
        />

      ))}

    </div>
  );
}

/* ✅ SOLO extraemos el botón a un componente memo */
const CameraItem = memo(({
  camera,
  selectedCameraId,
  draggedId,
  onCameraSelect,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setDraggedId
}: any) => {

  const isOnline =
    camera.status === 'online';

  const isWarning =
    camera.status === 'warning';

  return (

    <button
      draggable
      onDragStart={(e) =>
        handleDragStart(e, camera.id)
      }
      onDragOver={handleDragOver}
      onDrop={(e) =>
        handleDrop(e, camera.id)
      }
      onDragEnd={() =>
        setDraggedId(null)
      }
      onClick={() =>
        onCameraSelect(camera)
      }
      className={cn(
        'relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200',
        'bg-secondary hover:border-primary/50',
        selectedCameraId === camera.id
          ? 'border-primary'
          : 'border-border',
        draggedId === camera.id &&
          'opacity-50'
      )}
    >

      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />

      <div className="absolute top-2 left-2 flex items-center gap-1">

        <GripHorizontal className="w-3 h-3 text-primary" />

        <MapPin className="w-3 h-3 text-primary" />

        <span className="text-[10px]">
          {camera.zone}
        </span>

      </div>

      <div className="absolute top-2 right-2">

        {isOnline ? (

          <div className="flex items-center gap-1">

            <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />

            <span className="text-[10px]">
              REC
            </span>

          </div>

        ) : isWarning ? (

          <AlertTriangle className="w-4 h-4 text-yellow-500" />

        ) : (

          <VideoOff className="w-4 h-4 text-red-500" />

        )}

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">

        <div className="flex items-center gap-2">

          {isOnline ? (
            <Video className="w-4 h-4 text-green-500" />
          ) : (
            <VideoOff className="w-4 h-4 text-red-500" />
          )}

          <div className="text-left">

            <p className="text-xs font-medium">
              {camera.name}
            </p>

            <p className="text-[10px] text-muted-foreground">
              {camera.location}
            </p>

          </div>

        </div>

      </div>

    </button>
  );
});
