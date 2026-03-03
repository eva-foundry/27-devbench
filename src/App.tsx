import { useState } from 'react'
import { AppProvider, useApp } from './lib/app-context'
import { ProjectsPage } from './components/pages/ProjectsPage'
import { ContextBundlesPage } from './components/pages/ContextBundlesPage'
import { RunsPage } from './components/pages/RunsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { DiffViewer } from './components/DiffViewer'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card'
import { 
  FolderOpen, 
  Package, 
  Play, 
  Gear, 
  List,
  Globe,
  ShieldCheck,
  CodeBlock,
} from '@phosphor-icons/react'
import { Toaster } from './components/ui/sonner'
import { getAccessToken } from './lib/config'
import { useSampleDiff } from './hooks/use-sample-diff'

type Page = 'projects' | 'bundles' | 'runs' | 'settings' | 'review-demo'

function AppContent() {
  const { state, updateSettings, t } = useApp()
  const [currentPage, setCurrentPage] = useState<Page>('review-demo')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sampleDiffContent = useSampleDiff()

  const hasAuth = Boolean(getAccessToken())

  const navItems: Array<{ id: Page; icon: typeof FolderOpen; label: string }> = [
    { id: 'review-demo', icon: CodeBlock, label: 'Review Mode Demo' },
    { id: 'projects', icon: FolderOpen, label: t.nav.projects },
    { id: 'bundles', icon: Package, label: t.nav.contextBundles },
    { id: 'runs', icon: Play, label: t.nav.runs },
    { id: 'settings', icon: Gear, label: t.nav.settings },
  ]

  const toggleLanguage = () => {
    const newLang = state.settings.language === 'en' ? 'fr' : 'en'
    updateSettings({ language: newLang })
  }

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navItems.map(item => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'secondary' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => {
              setCurrentPage(item.id)
              setMobileMenuOpen(false)
            }}
          >
            <Icon size={20} />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background">
      {!hasAuth && (
        <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium">
          <ShieldCheck size={16} className="inline mr-2" weight="fill" />
          {t.app.notAuthenticated}
        </div>
      )}

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <List size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="mt-6">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-2xl font-bold font-heading">{t.app.title}</h1>
              <Badge variant="outline" className="text-xs mt-1">
                {t.app.environment}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.settings.demoMode && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
              aria-label="Toggle language"
            >
              <Globe size={18} />
              <span className="text-xs font-mono">{state.settings.language.toUpperCase()}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <NavContent />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {currentPage === 'review-demo' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck size={24} weight="fill" className="text-accent" />
                      Review Mode Demo
                    </CardTitle>
                    <CardDescription>
                      Toggle Review Mode to see risk indicators, large diff warnings, core layer highlights, and file provenance badges on the diff below. Toggle Semantic Groups to organize files by architectural layer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">What Review Mode Shows:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        <li><span className="text-foreground">Risk Badges:</span> 🟢 Low (docs, tests) | 🟡 Medium (scaffolding) | 🔴 High (auth, logic)</li>
                        <li><span className="text-foreground">Provenance Badges:</span> Shows which AI agent and model generated each file with full audit trail</li>
                        <li><span className="text-foreground">Large Diff Warnings:</span> Files with over 100 lines changed</li>
                        <li><span className="text-foreground">Core Layer Indicators:</span> Critical files in auth/, security/, domain/</li>
                        <li><span className="text-foreground">Generated vs Modified:</span> Visual distinction of file types</li>
                        <li><span className="text-foreground">File Review Status:</span> Mark files as OK, Needs SME, Needs Re-run, or Pending</li>
                        <li><span className="text-foreground">Review Progress:</span> Track completion with summary dashboard and bulk actions</li>
                        <li><span className="text-foreground">Agent Rationale:</span> Expand "Why this change?" to see agent reasoning and assumptions</li>
                        <li><span className="text-foreground">Semantic Groups:</span> Files organized by architectural layer (Controllers, DTOs, Services, Tests)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <DiffViewer content={sampleDiffContent || 'No diff content available'} />
              </div>
            )}
            {currentPage === 'projects' && <ProjectsPage />}
            {currentPage === 'bundles' && <ContextBundlesPage />}
            {currentPage === 'runs' && <RunsPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
