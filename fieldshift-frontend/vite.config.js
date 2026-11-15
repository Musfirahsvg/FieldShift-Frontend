import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run dev`        -> React dev server on :5173, /api proxied to FastAPI on :8000 (live NASA data)
// `npm run build`      -> production build in dist/ (FastAPI serves it at http://localhost:8000)
// `npm run build:demo` -> ONE self-contained HTML file with bundled demo snapshots (no backend needed)
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "demo" ? [viteSingleFile()] : [])],
  define: { __STATIC_DEMO__: JSON.stringify(mode === "demo") },
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
  build: { outDir: mode === "demo" ? "dist-demo" : "dist", chunkSizeWarningLimit: 2000 },
}));
