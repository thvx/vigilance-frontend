import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    proxy: {

      // ✅ FASTAPI BACKEND
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },

      // ✅ WEBSOCKET
      "/ws": {
        target: "ws://127.0.0.1:8000",
        ws: true,
        changeOrigin: true,
      },

      // ✅ HLS VIDEO STREAMS
      "/hls": {
        target: "http://127.0.0.1:8888",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

}));