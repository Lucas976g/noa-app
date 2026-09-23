import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import "./index.css"
import App from "@/app/App"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import { ErrorBoundary } from "@/shared/ui/error-boundary"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
)
