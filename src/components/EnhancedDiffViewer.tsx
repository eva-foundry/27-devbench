import { useState, useMemo } from 'react'
import { DiffViewer } from './DiffViewer'
import { ReviewModePanel } from './ReviewModePanel'
import { AgentRationalePanel, FileProvenanceBadge } from './AgentRationalePanel'
import { ExcludedFilesPanel } from './ExcludedFilesPanel'
import { SemanticGroupsPanel } from './SemanticGroupsPanel'
import { ExplainHunkPanel } from './ExplainHunkPanel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useKV } from '@github/spark/hooks'
import { 
  ShieldCheck, 
  Eye, 
  List, 
  ShieldSlash,
  Lightbulb,
} from '@phosphor-icons/react'
import type { 
  ReviewChecklist, 
  ReviewStatus, 
  AgentRationale, 
  ExcludedFile,
  SemanticGroup,
  FileProvenance,
  FileReviewMetadata,
} from '@/lib/types'
import { 
  analyzeChangeRisk, 
  isLargeDiff, 
  isCoreLayer, 
  detectSemanticGroups,
  shouldFlagForSME,
} from '@/lib/review-analysis'
import { getRiskBadge } from './ReviewModePanel'
import {
  mockAgentRationales,
  mockFileProvenance,
  mockFileReviewMetadata,
  mockExcludedFiles,
  mockSemanticGroups,
} from '@/lib/mock-api'

interface EnhancedDiffViewerProps {
  content: string
  runId: string
  contextBundleHash: string
  onExplainHunk?: (hunkContent: string, filePath: string) => Promise<{
    whatChanged: string
    whyNecessary: string
    watchOut: string[]
    howToTest: string[]
  }>
}

interface ParsedFile {
  path: string
  type: string
  additions: number
  deletions: number
  content: string
}

function parseFilesFromDiff(content: string): ParsedFile[] {
  const files: ParsedFile[] = []
  const lines = content.split('\n')
  let currentFile: ParsedFile | null = null
  let fileContent: string[] = []

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (currentFile && fileContent.length > 0) {
        currentFile.content = fileContent.join('\n')
        files.push(currentFile)
      }

      const match = line.match(/diff --git a\/(.+?) b\/(.+)/)
      if (match) {
        currentFile = {
          path: match[2],
          type: 'modified',
          additions: 0,
          deletions: 0,
          content: '',
        }
        fileContent = [line]
      }
    } else if (currentFile) {
      fileContent.push(line)
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentFile.additions++
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        currentFile.deletions++
      }
      if (line.startsWith('new file mode')) currentFile.type = 'added'
      if (line.startsWith('deleted file mode')) currentFile.type = 'deleted'
      if (line.startsWith('rename from')) currentFile.type = 'renamed'
    }
  }

  if (currentFile && fileContent.length > 0) {
    currentFile.content = fileContent.join('\n')
    files.push(currentFile)
  }

  return files
}

export function EnhancedDiffViewer({ 
  content, 
  runId, 
  contextBundleHash,
  onExplainHunk,
}: EnhancedDiffViewerProps) {
  const [reviewModeEnabled, setReviewModeEnabled] = useKV<boolean>('review-mode-enabled', false)
  const [checklist, setChecklist] = useKV<ReviewChecklist>('review-checklist', {
    businessLogicInferred: null,
    smeValidationRequired: false,
    testsGenerated: false,
    securityReviewed: null,
    performanceConsidered: null,
  })
  const [fileReviewStatus, setFileReviewStatus] = useKV<Map<string, ReviewStatus>>(
    'file-review-status',
    new Map()
  )
  const [selectedHunk, setSelectedHunk] = useState<{ content: string; filePath: string } | null>(null)

  const parsedFiles = useMemo(() => parseFilesFromDiff(content), [content])

  const fileMetadata = useMemo(() => {
    const metadata = new Map<string, FileReviewMetadata>()
    
    for (const file of parsedFiles) {
      const existingMetadata = mockFileReviewMetadata[file.path]
      
      if (existingMetadata) {
        metadata.set(file.path, {
          ...existingMetadata,
          reviewStatus: fileReviewStatus?.get(file.path) || existingMetadata.reviewStatus,
        })
      } else {
        const risk = analyzeChangeRisk(file.path, file.content, file.additions, file.deletions)
        const largeDiff = isLargeDiff(file.additions, file.deletions)
        const coreLayer = isCoreLayer(file.path)
        const smeFlag = shouldFlagForSME(file.path, file.content, risk)

        metadata.set(file.path, {
          reviewStatus: fileReviewStatus?.get(file.path) || 'pending',
          changeRisk: risk,
          isLargeDiff: largeDiff,
          isCoreLayer: coreLayer,
          hasSMEFlag: smeFlag,
          hasTests: file.path.includes('.test.') || file.path.includes('.spec.'),
        })
      }
    }

    return metadata
  }, [parsedFiles, fileReviewStatus])

  const semanticGroups = useMemo(() => {
    return mockSemanticGroups.length > 0 
      ? mockSemanticGroups 
      : detectSemanticGroups(parsedFiles.map(f => ({ path: f.path, type: f.type })))
  }, [parsedFiles])

  const protectedZones = useMemo(() => [
    'src/auth/**',
    'src/security/**',
    'config/**/*.secret.*',
    'src/middleware/AuthMiddleware.ts',
  ], [])

  const stats = useMemo(() => {
    let largeDiffCount = 0
    let coreLayerCount = 0
    let highRiskCount = 0
    let mediumRiskCount = 0
    let lowRiskCount = 0
    const testFiles: string[] = []
    const smeFlags: { file: string; reason: string }[] = []

    fileMetadata.forEach((meta, filePath) => {
      if (meta.isLargeDiff) largeDiffCount++
      if (meta.isCoreLayer) coreLayerCount++
      if (meta.changeRisk === 'high') highRiskCount++
      if (meta.changeRisk === 'medium') mediumRiskCount++
      if (meta.changeRisk === 'low') lowRiskCount++
      
      if (meta.hasTests || filePath.includes('.test.') || filePath.includes('.spec.')) {
        testFiles.push(filePath)
      }
      
      if (meta.hasSMEFlag) {
        let reason = 'Auto-flagged'
        if (meta.changeRisk === 'high') reason = 'High risk changes'
        else if (meta.isCoreLayer) reason = 'Core layer modification'
        smeFlags.push({ file: filePath, reason })
      }
    })

    return {
      fileCount: parsedFiles.length,
      largeDiffCount,
      coreLayerCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      testFiles,
      smeFlags,
    }
  }, [fileMetadata, parsedFiles])

  const handleFileReview = (filePath: string, status: ReviewStatus) => {
    const newMap = new Map(fileReviewStatus)
    newMap.set(filePath, status)
    setFileReviewStatus(newMap)
  }

  const provenance: FileProvenance = parsedFiles.length > 0 && mockFileProvenance[parsedFiles[0].path]
    ? mockFileProvenance[parsedFiles[0].path]
    : {
        generatedBy: 'Unknown',
        modelProfile: 'default',
        contextBundleHash: contextBundleHash,
        runId: runId,
        timestamp: new Date().toISOString(),
      }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold font-heading">Code Review</h3>
          <p className="text-sm text-muted-foreground">
            Enhanced diff viewer with governance and review features
          </p>
        </div>
        <FileProvenanceBadge {...provenance} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {reviewModeEnabled && parsedFiles.length > 0 && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} weight="fill" className="text-accent" />
                <h4 className="font-semibold text-sm">Review Highlights</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedFiles.slice(0, 3).map(file => {
                  const meta = fileMetadata.get(file.path)
                  if (!meta) return null
                  return (
                    <div key={file.path} className="flex items-center gap-2 text-xs">
                      <span className="font-mono truncate max-w-[200px]">{file.path}</span>
                      {getRiskBadge(meta.changeRisk)}
                      {meta.isLargeDiff && (
                        <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                          Large diff
                        </Badge>
                      )}
                      {meta.isCoreLayer && (
                        <Badge variant="outline" className="bg-destructive/20 text-destructive-foreground">
                          Core layer
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {parsedFiles.length > 0 && reviewModeEnabled && (
            <AgentRationalePanel 
              filePath={parsedFiles[0].path} 
              rationale={
                mockAgentRationales[parsedFiles[0].path] || {
                  agentName: 'Unknown',
                  inputSignals: ['File modified in this run'],
                  assumptions: [],
                  confidenceLevel: 'medium',
                  reasoning: 'No detailed rationale available for this file.'
                }
              } 
            />
          )}

          <DiffViewer content={content} />

          {selectedHunk && onExplainHunk && (
            <ExplainHunkPanel
              hunkContent={selectedHunk.content}
              filePath={selectedHunk.filePath}
              onClose={() => setSelectedHunk(null)}
              onExplain={onExplainHunk}
            />
          )}
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="review" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="review" className="gap-1 text-xs">
                <Eye size={14} />
                Review
              </TabsTrigger>
              <TabsTrigger value="groups" className="gap-1 text-xs">
                <List size={14} />
                Groups
              </TabsTrigger>
              <TabsTrigger value="excluded" className="gap-1 text-xs">
                <ShieldSlash size={14} />
                Excluded
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-4 mt-4">
              <ReviewModePanel
                enabled={reviewModeEnabled ?? false}
                onToggle={setReviewModeEnabled}
                checklist={checklist ?? {
                  businessLogicInferred: null,
                  smeValidationRequired: false,
                  testsGenerated: false,
                  securityReviewed: null,
                  performanceConsidered: null,
                }}
                onChecklistChange={setChecklist}
                {...stats}
              />
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <SemanticGroupsPanel
                groups={semanticGroups}
                fileReviewStatus={Object.fromEntries(fileReviewStatus ?? new Map())}
                onFileReview={handleFileReview}
              />
            </TabsContent>

            <TabsContent value="excluded" className="mt-4">
              <ExcludedFilesPanel
                excludedFiles={mockExcludedFiles}
                protectedZones={protectedZones}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
