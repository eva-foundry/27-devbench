import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Stop, ArrowClockwise, Package, Robot, Warning, XCircle, CheckCircle, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Run, Purpose, DataClass, WorkPackage } from '@/lib/types'
import { ArtifactViewer } from '@/components/ArtifactViewer'

export function RunsPage() {
  const { state, addRecentRun, api, t } = useApp()
  const [runs, setRuns] = useState<Run[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [runConfig, setRunConfig] = useState<{
    workPackageId: string
    contextBundleId: string
    purpose: Purpose
    dataClass: DataClass
  }>({
    workPackageId: '',
    contextBundleId: '',
    purpose: 'reverse_engineer',
    dataClass: 'ULL',
  })

  const loadWorkPackages = async () => {
    try {
      const response = await api.listWorkPackages()
      setWorkPackages(response.items)
    } catch (error) {
      console.error('Failed to load work packages:', error)
    }
  }

  const loadRuns = () => {
    setRuns(state.recentRuns)
  }

  const handleStartRun = async () => {
    if (!runConfig.workPackageId || !runConfig.contextBundleId || !state.activeProject) {
      toast.error(t.common.error, { description: 'Please configure all fields' })
      return
    }

    setLoading(true)
    try {
      const response = await api.createRun(
        {
          projectId: state.activeProject.projectId,
          workPackageId: runConfig.workPackageId,
          contextBundleId: runConfig.contextBundleId,
          parameters: {},
        },
        state.activeProject.projectId,
        runConfig.purpose,
        runConfig.dataClass
      )

      const run = await api.getRun(response.runId)
      addRecentRun(run)
      setSelectedRun(run)
      
      toast.success(t.common.success, { description: `Run started: ${response.runId.slice(0, 8)}` })
      setRunDialogOpen(false)
      loadRuns()

      const pollInterval = setInterval(async () => {
        try {
          const updated = await api.getRun(response.runId)
          setSelectedRun(updated)
          if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'canceled') {
            clearInterval(pollInterval)
            addRecentRun(updated)
            loadRuns()
          }
        } catch (error) {
          clearInterval(pollInterval)
        }
      }, 3000)

    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to start run',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRun = async (runId: string) => {
    try {
      await api.cancelRun(runId)
      toast.success(t.common.success, { description: 'Run canceled' })
      const updated = await api.getRun(runId)
      setSelectedRun(updated)
      addRecentRun(updated)
      loadRuns()
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to cancel run',
      })
    }
  }

  const handleRefreshRun = async (runId: string) => {
    try {
      const updated = await api.getRun(runId)
      setSelectedRun(updated)
      addRecentRun(updated)
      loadRuns()
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to refresh run',
      })
    }
  }

  useEffect(() => {
    loadWorkPackages()
    loadRuns()
  }, [])

  const getStatusBadge = (status: Run['status']) => {
    const variants: Record<Run['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
      queued: { variant: 'secondary', icon: ArrowClockwise },
      running: { variant: 'default', icon: Play },
      completed: { variant: 'outline', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      canceled: { variant: 'secondary', icon: Stop },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={14} weight="fill" />
        {t.runs[status] || status}
      </Badge>
    )
  }

  if (!state.activeProject) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <Play size={64} className="mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Select a project first</h3>
            <p className="text-muted-foreground">Choose a project to view runs</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t.runs.title}</h1>
        
        <Button className="gap-2" onClick={() => setRunDialogOpen(true)}>
          <Play />
          {t.workPackages.startRun}
        </Button>
      </div>

      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workPackages.configure}</DialogTitle>
            <DialogDescription>Configure and start a new run</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Work Package</label>
              <Select
                value={runConfig.workPackageId}
                onValueChange={v => setRunConfig(c => ({ ...c, workPackageId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work package" />
                </SelectTrigger>
                <SelectContent>
                  {workPackages.map(pkg => (
                    <SelectItem key={pkg.workPackageId} value={pkg.workPackageId}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.workPackages.selectBundle}</label>
              <Select
                value={runConfig.contextBundleId}
                onValueChange={v => setRunConfig(c => ({ ...c, contextBundleId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context bundle" />
                </SelectTrigger>
                <SelectContent>
                  {state.recentBundles.map(bundle => (
                    <SelectItem key={bundle.contextBundleId} value={bundle.contextBundleId}>
                      {bundle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.workPackages.purpose}</label>
              <Select
                value={runConfig.purpose}
                onValueChange={v => setRunConfig(c => ({ ...c, purpose: v as Purpose }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reverse_engineer">Reverse Engineer</SelectItem>
                  <SelectItem value="scaffold">Scaffold</SelectItem>
                  <SelectItem value="refactor">Refactor</SelectItem>
                  <SelectItem value="tests">Generate Tests</SelectItem>
                  <SelectItem value="docs">Generate Docs</SelectItem>
                  <SelectItem value="learn">Learn/Explain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.workPackages.dataClass}</label>
              <Select
                value={runConfig.dataClass}
                onValueChange={v => setRunConfig(c => ({ ...c, dataClass: v as DataClass }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ULL">ULL (Unclassified)</SelectItem>
                  <SelectItem value="PB">PB (Protected B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleStartRun} disabled={loading}>
              <Play className="mr-2" />
              {t.workPackages.startRun}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Runs</h2>
          {runs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Play size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{t.runs.noRuns}</h3>
                  <p className="text-sm text-muted-foreground">{t.runs.noRunsDesc}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {runs.map(run => (
                <Card
                  key={run.runId}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedRun(run)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="font-mono text-sm">{run.runId.slice(0, 8)}</span>
                      {getStatusBadge(run.status)}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(run.createdAtUtc).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  {run.progress && (
                    <CardContent className="pt-0">
                      <Progress value={run.progress.percent || 0} className="h-1" />
                      {run.progress.currentAgent && (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Robot size={12} />
                          {run.progress.currentAgent}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedRun && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.runs.console}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefreshRun(selectedRun.runId)}
                >
                  <ArrowClockwise size={16} />
                </Button>
                {(selectedRun.status === 'running' || selectedRun.status === 'queued') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelRun(selectedRun.runId)}
                  >
                    <Stop size={16} className="mr-1" />
                    {t.runs.cancel}
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <Tabs defaultValue="progress">
                <CardHeader>
                  <TabsList className="w-full">
                    <TabsTrigger value="progress" className="flex-1">{t.runs.progress}</TabsTrigger>
                    <TabsTrigger value="costs" className="flex-1">{t.runs.costs}</TabsTrigger>
                    <TabsTrigger value="issues" className="flex-1">Issues</TabsTrigger>
                    <TabsTrigger value="artifacts" className="flex-1">{t.artifacts.title}</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="progress" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{selectedRun.progress?.phase || 'Initializing'}</span>
                        <span>{selectedRun.progress?.percent || 0}%</span>
                      </div>
                      <Progress value={selectedRun.progress?.percent || 0} />
                    </div>

                    {selectedRun.progress?.currentAgent && (
                      <div className="flex items-center gap-2 text-sm">
                        <Robot size={18} className="text-accent" />
                        <span className="font-medium">{selectedRun.progress.currentAgent}</span>
                      </div>
                    )}

                    {selectedRun.summary && (
                      <div className="text-sm bg-muted p-3 rounded-lg">
                        {selectedRun.summary}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="costs" className="space-y-3 mt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t.audit.tokensIn}</span>
                        <span className="font-mono">{selectedRun.costs?.tokensIn?.toLocaleString() || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>{t.audit.tokensOut}</span>
                        <span className="font-mono">{selectedRun.costs?.tokensOut?.toLocaleString() || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-medium">
                        <span>{t.audit.estimatedCost}</span>
                        <span className="font-mono">${selectedRun.costs?.estimatedCad?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="issues" className="mt-0">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {selectedRun.warnings && selectedRun.warnings.length > 0 && (
                          <div className="space-y-2">
                            {selectedRun.warnings.map((warning, i) => (
                              <div key={i} className="flex gap-2 text-sm bg-warning/10 p-2 rounded">
                                <Warning size={16} className="text-warning flex-shrink-0 mt-0.5" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedRun.errors && selectedRun.errors.length > 0 && (
                          <div className="space-y-2">
                            {selectedRun.errors.map((error, i) => (
                              <div key={i} className="flex gap-2 text-sm bg-destructive/10 p-2 rounded">
                                <XCircle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(!selectedRun.warnings || selectedRun.warnings.length === 0) &&
                         (!selectedRun.errors || selectedRun.errors.length === 0) && (
                          <div className="text-center text-sm text-muted-foreground py-8">
                            <CheckCircle size={32} className="mx-auto mb-2" />
                            No issues reported
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="artifacts" className="mt-0">
                    <ArtifactViewer runId={selectedRun.runId} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
