import { lazy, Suspense } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  isAuthenticated
} from "@/services/auth";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLoader() {

  return (

    <div className="h-screen flex items-center justify-center bg-background">

      <div className="space-y-4 text-center">

        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="text-sm text-muted-foreground">
          Cargando sistema...
        </p>

      </div>

    </div>
  );
}

const App = () => {

  return (

    <QueryClientProvider client={queryClient}>

      <TooltipProvider>

        <Toaster />
        <Sonner />

        <BrowserRouter>

          <Suspense fallback={<AppLoader />}>

            <Routes>

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>

          </Suspense>

        </BrowserRouter>

      </TooltipProvider>

    </QueryClientProvider>
  );
};

export default App;