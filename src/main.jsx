import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/index.js'
import { Toaster } from 'sonner'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'inherit',
          borderRadius: '12px',
          fontSize: '0.875rem',
        },
        duration: 4000,
      }}
      richColors
    />
    <App />
  </StrictMode>,
)
