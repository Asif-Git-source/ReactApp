/**
 * APP ENTRY POINT
 *
 * initSentry() must be called BEFORE createRoot() so that errors thrown
 * during the initial render are captured. If Sentry is initialized after
 * React renders, early errors (e.g. in module-level code) are missed.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from '@services/sentry'

// Initialize Sentry before the React tree renders
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
