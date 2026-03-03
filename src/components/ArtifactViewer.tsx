import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FileText, FileZip, FileMd, TestTube, Graph, ClockCounterClockwise, Download, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApp } from '@/lib/app-context'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Artifact, ArtifactType } from '@/lib/types'
import { EnhancedDiffViewer } from './EnhancedDiffViewer'

interface ArtifactViewerProps {
  runId: string
}

export function ArtifactViewer({ runId }: ArtifactViewerProps) {
  const { api, t } = useApp()
  const isMobile = useIsMobile()
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [artifactContent, setArtifactContent] = useState<{ mode: string; text?: string; url?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  useEffect(() => {
    loadArtifacts()
  }, [runId])

  const loadArtifacts = async () => {
    try {
      const response = await api.listRunArtifacts(runId)
      setArtifacts(response.items)
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to load artifacts',
      })
    }
  }

  const handleViewArtifact = async (artifact: Artifact) => {
    setSelectedArtifact(artifact)
    setLoading(true)
    setViewerOpen(true)

    try {
      const content = await api.getArtifactContent(artifact.artifactId)
      setArtifactContent(content)
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to load artifact content',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (artifact: Artifact) => {
    if (artifactContent?.mode === 'signed_url' && artifactContent.url) {
      window.open(artifactContent.url, '_blank')
    } else if (artifactContent?.mode === 'inline_text' && artifactContent.text) {
      const blob = new Blob([artifactContent.text], { type: artifact.contentType || 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = artifact.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case 'patch':
        return FileText
      case 'zip':
        return FileZip
      case 'markdown':
        return FileMd
      case 'test_suite':
        return TestTube
      case 'diagram':
        return Graph
      case 'trace_log':
        return ClockCounterClockwise
      default:
        return FileText
    }
  }

  const getArtifactTypeBadge = (type: ArtifactType) => {
    const colors: Record<ArtifactType, string> = {
      patch: 'bg-accent/10 text-accent-foreground border-accent/20',
      zip: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
      markdown: 'bg-primary/10 text-primary-foreground border-primary/20',
      test_suite: 'bg-success/10 text-success-foreground border-success/20',
      diagram: 'bg-muted text-muted-foreground',
      trace_log: 'bg-muted text-muted-foreground',
    }

    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    )
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const ViewerContent = () => {
    if (!selectedArtifact) return null

    return (
      <>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg">{selectedArtifact.name}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {getArtifactTypeBadge(selectedArtifact.type)}
                <span>•</span>
                <span>{formatBytes(selectedArtifact.bytes)}</span>
                <span>•</span>
                <span className="font-mono text-xs">{selectedArtifact.sha256.slice(0, 12)}...</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedArtifact && handleDownload(selectedArtifact)}
              disabled={!artifactContent}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>

          <Separator />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
                <p className="text-sm text-muted-foreground">Loading content...</p>
              </div>
            </div>
          ) : artifactContent?.mode === 'signed_url' ? (
            <div className="text-center py-12 space-y-4">
              <FileZip size={64} className="mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Large artifact available for download</p>
                <Button onClick={() => selectedArtifact && handleDownload(selectedArtifact)}>
                  <Download size={16} className="mr-2" />
                  Download {selectedArtifact.name}
                </Button>
              </div>
            </div>
          ) : artifactContent?.text && selectedArtifact.type === 'patch' ? (
            <EnhancedDiffViewer 
              content={artifactContent.text} 
              runId={runId}
              contextBundleHash="mock-bundle-hash-12345"
              onExplainHunk={async (hunkContent, filePath) => {
                const promptText = `You are a code reviewer analyzing a diff change.

File: ${filePath}
Change:
\`\`\`
${hunkContent}
\`\`\`

Provide a structured explanation with:
1. What changed (brief summary)
2. Why this change was necessary
3. What to watch out for (potential issues, edge cases)
4. How to test this change

Return ONLY valid JSON with these exact keys: whatChanged, whyNecessary, watchOut (array), howToTest (array)`
                
                try {
                  const response = await window.spark.llm(promptText, 'gpt-4o', true)
                  return JSON.parse(response)
                } catch (error) {
                  throw new Error('Failed to generate explanation')
                }
              }}
            />
          ) : artifactContent?.text && selectedArtifact.type === 'markdown' ? (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg">
                <pre className="whitespace-pre-wrap font-body text-sm">{artifactContent.text}</pre>
              </div>
            </ScrollArea>
          ) : artifactContent?.text ? (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <pre className="p-4 bg-muted/30 rounded-lg text-xs font-mono overflow-x-auto">
                {artifactContent.text}
              </pre>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText size={48} className="mx-auto mb-2" />
              <p className="text-sm">No content available</p>
            </div>
          )}
        </div>
      </>
    )
  }

  if (artifacts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
        <div>
          <h3 className="text-lg font-semibold">{t.artifacts?.noArtifacts || 'No artifacts yet'}</h3>
          <p className="text-muted-foreground text-sm">
            {t.artifacts?.noArtifactsDesc || 'Artifacts will appear here when the run completes'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {t.artifacts?.description || `${artifacts.length} artifact${artifacts.length !== 1 ? 's' : ''} generated`}
          </p>
        </div>
        <div className="space-y-2">
          {artifacts.map((artifact) => {
              const Icon = getArtifactIcon(artifact.type)
              return (
                <Card
                  key={artifact.artifactId}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewArtifact(artifact)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon size={24} className="text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{artifact.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-mono">{artifact.sha256.slice(0, 12)}...</span>
                            <span>•</span>
                            <span>{formatBytes(artifact.bytes)}</span>
                            <span>•</span>
                            <span>{new Date(artifact.createdAtUtc).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getArtifactTypeBadge(artifact.type)}
                        <Button variant="ghost" size="sm">
                          <Eye size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {isMobile ? (
        <Sheet open={viewerOpen} onOpenChange={setViewerOpen}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Artifact Viewer</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ViewerContent />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Artifact Viewer</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ViewerContent />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
