import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    watch: {
      // Docker Desktop on Windows doesn't reliably forward inotify events
      // across the bind-mounted volume, so chokidar's default watcher can
      // miss host-side file edits entirely. Polling guarantees changes are
      // picked up inside the container.
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
