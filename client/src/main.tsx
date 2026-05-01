import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/authContext"
import { Toaster } from "react-hot-toast"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
         <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1e2e",
              color: "#e2e2f0",
              border: "1px solid #2a2a3e",
              borderRadius: "10px",
              fontSize: "14px"
            },
            success: {
              iconTheme: { primary: "#00d68f", secondary: "#1e1e2e" }
            },
            error: {
              iconTheme: { primary: "#ff4d6d", secondary: "#1e1e2e" }
            }
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)