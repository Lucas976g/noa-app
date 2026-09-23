import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const DEFAULT_API_URL = "http://localhost:8080"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiUrl = (env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "")

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/auth": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/products": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/order": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/orders": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/clients": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/inventory": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/deliveries": {
          target: apiUrl,
          changeOrigin: true,
        },
        "/reports": {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
