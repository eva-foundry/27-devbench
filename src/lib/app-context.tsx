import { createContext, useContext, type ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import type { AppState, Project, ContextBundle, Run, Language } from './types'
import { config } from './config'
import { ApiClient } from './api'
import { MockApiClient } from './mock-api'
import { translations } from './i18n'

interface AppContextValue {
  state: AppState
  setActiveProject: (project: Project | null) => void
  addRecentBundle: (bundle: ContextBundle) => void
  addRecentRun: (run: Run) => void
  updateSettings: (settings: Partial<AppState['settings']>) => void
  api: ApiClient | MockApiClient
  t: typeof translations.en
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useKV<AppState>('app-state', {
    activeProject: null,
    recentBundles: [],
    recentRuns: [],
    settings: {
      language: config.DEFAULT_LANGUAGE,
      baseUrl: config.DEFAULT_BASE_URL,
      demoMode: config.DEFAULT_DEMO_MODE,
    },
  })

  const defaultState: AppState = {
    activeProject: null,
    recentBundles: [],
    recentRuns: [],
    settings: {
      language: config.DEFAULT_LANGUAGE,
      baseUrl: config.DEFAULT_BASE_URL,
      demoMode: config.DEFAULT_DEMO_MODE,
    },
  }

  const currentState = state || defaultState

  const setActiveProject = (project: Project | null) => {
    setState(current => {
      const base = current || defaultState
      return { ...base, activeProject: project }
    })
  }

  const addRecentBundle = (bundle: ContextBundle) => {
    setState(current => {
      const base = current || defaultState
      return {
        ...base,
        recentBundles: [bundle, ...base.recentBundles.filter(b => b.contextBundleId !== bundle.contextBundleId)].slice(0, 10),
      }
    })
  }

  const addRecentRun = (run: Run) => {
    setState(current => {
      const base = current || defaultState
      return {
        ...base,
        recentRuns: [run, ...base.recentRuns.filter(r => r.runId !== run.runId)].slice(0, 10),
      }
    })
  }

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(current => {
      const base = current || defaultState
      return {
        ...base,
        settings: { ...base.settings, ...newSettings },
      }
    })
  }

  const api = currentState.settings.demoMode
    ? new MockApiClient()
    : new ApiClient(currentState.settings.baseUrl)

  const t = translations[currentState.settings.language as Language]

  return (
    <AppContext.Provider
      value={{
        state: currentState,
        setActiveProject,
        addRecentBundle,
        addRecentRun,
        updateSettings,
        api,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
