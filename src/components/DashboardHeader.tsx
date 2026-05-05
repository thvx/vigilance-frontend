import {
  Shield,
  Wifi,
  Activity,
  LogOut,
} from "lucide-react";

import {
  SystemMetrics,
} from "@/types/surveillance";

import {
  useState,
  useEffect,
  memo,
} from "react";

import {
  logout,
  getUsername,
} from "@/services/auth";

interface DashboardHeaderProps {
  metrics: SystemMetrics;
}

function DashboardHeaderComponent({
  metrics,
}: DashboardHeaderProps) {

  const [currentTime, setCurrentTime] =
    useState("");

  const [username, setUsername] =
    useState("");

  useEffect(() => {

    setUsername(
      getUsername()
    );

    const interval = setInterval(() => {

      setCurrentTime(
        new Date().toLocaleTimeString(
          "es-ES"
        )
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  return (

    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">

      <div className="px-4 lg:px-6 py-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shadow-lg">

              <Shield className="w-6 h-6 text-white" />

            </div>

            <div>

              <h1 className="text-lg lg:text-xl font-bold">
                Centro de Vigilancia
              </h1>

              <p className="text-xs text-muted-foreground">
                Sistema Inteligente de Monitoreo
              </p>

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-5">

            <div className="flex items-center gap-2">

              <Wifi className="w-4 h-4 text-green-500" />

              <span className="text-sm font-medium">
                En línea
              </span>

            </div>

            <div className="flex items-center gap-2">

              <Activity className="w-4 h-4 text-blue-500" />

              <span className="text-sm font-semibold">
                {metrics.online_cameras}/
                {metrics.total_cameras}
              </span>

            </div>

            <div className="text-sm font-mono bg-secondary px-3 py-1 rounded-lg">
              {currentTime}
            </div>

            <div className="text-sm font-semibold bg-secondary px-3 py-1 rounded-lg">
              👤 {username}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md"
            >

              <LogOut className="w-4 h-4" />

              Salir

            </button>

          </div>

        </div>

      </div>

    </header>
  );
}

export const DashboardHeader =
  memo(DashboardHeaderComponent);
