// EVA-FEATURE: F27-02
// EVA-STORY: F27-02-001
// EVA-STORY: F27-02-002
// EVA-STORY: F27-02-003
// EVA-STORY: F27-03-001
// EVA-STORY: F27-03-002
// EVA-STORY: F27-03-003
// EVA-STORY: F27-09-001
// EVA-STORY: F27-09-002
// EVA-STORY: F27-09-003
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
