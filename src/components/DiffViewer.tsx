import { useState, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  CaretRight, 
  CaretDown, 
  File, 
  Plus, 
  Minus, 
  Columns, 
  ListDashes, 
  TextAa, 
  ShieldCheck, 
  Warning,
  CheckCircle,
  Brain,
  ArrowClockwise,
  Clock,
  Folders,
} from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { highlightCode, renderHighlightedCode, type HighlightToken } from '@/lib/syntax-highlighter'
import { computeWordDiff, mergeConsecutiveSegments, type WordDiffSegment } from '@/lib/word-diff'
import { analyzeChangeRisk, isLargeDiff, isCoreLayer } from '@/lib/review-analysis'
import { categorizeFilesByArchitecturalLayer } from '@/lib/semantic-grouping'
import { useKV } from '@github/spark/hooks'
import type { ChangeRisk, ReviewStatus, AgentRationale, FileProvenance } from '@/lib/types'
import { AgentRationalePanel, FileProvenanceBadge } from './AgentRationalePanel'
import { SemanticGroupsPanel } from './SemanticGroupsPanel'

interface DiffViewerProps {
  content: string
}

interface FileDiff {
  path: string
  oldPath?: string
  type: 'modified' | 'added' | 'deleted' | 'renamed'
  hunks: DiffHunk[]
  additions: number
  deletions: number
  reviewMetadata?: {
    risk: ChangeRisk
    isLarge: boolean
    isCoreLayer: boolean
  }
}

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
  header?: string
}

interface DiffLine {
  type: 'add' | 'delete' | 'context' | 'header'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
  highlighted?: HighlightToken[]
  wordDiff?: WordDiffSegment[]
}

function generateMockProvenance(filePath: string): FileProvenance {
  const provenanceMap: Record<string, FileProvenance> = {
    'src/auth/AuthService.ts': {
      generatedBy: 'Agent-Refactorer-v2',
      modelProfile: 'gpt-4o',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:45.123Z',
    },
    'src/domain/UserRepository.ts': {
      generatedBy: 'Agent-Refactorer-v2',
      modelProfile: 'gpt-4o',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:47.456Z',
    },
    'src/controllers/UserController.ts': {
      generatedBy: 'Agent-Scaffolder-v3',
      modelProfile: 'gpt-4o-mini',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:49.789Z',
    },
    'src/services/UserService.ts': {
      generatedBy: 'Agent-Refactorer-v2',
      modelProfile: 'gpt-4o',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:52.012Z',
    },
    'src/types/User.ts': {
      generatedBy: 'Agent-Scaffolder-v3',
      modelProfile: 'gpt-4o-mini',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:54.345Z',
    },
    'tests/UserService.test.ts': {
      generatedBy: 'Agent-Tester-v2',
      modelProfile: 'gpt-4o-mini',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:56.678Z',
    },
    'README.md': {
      generatedBy: 'Agent-Documenter-v1',
      modelProfile: 'gpt-4o-mini',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:23:58.901Z',
    },
    'config/database.json': {
      generatedBy: 'Agent-Scaffolder-v3',
      modelProfile: 'gpt-4o-mini',
      contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
      runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
      timestamp: '2024-01-15T14:24:01.234Z',
    }
  }

  return provenanceMap[filePath] || {
    generatedBy: 'Agent-Scaffolder-v3',
    modelProfile: 'gpt-4o-mini',
    contextBundleHash: 'abc123def456789012345678901234567890123456789012345678901234',
    runId: 'run_01JCQX9TBWZ5A3Y4K2M8P0N1R7',
    timestamp: new Date().toISOString(),
  }
}

function generateMockRationale(filePath: string, fileType: FileDiff['type']): AgentRationale {
  const rationaleMap: Record<string, AgentRationale> = {
    'src/auth/AuthService.ts': {
      agentName: 'Agent-Refactorer-v2',
      inputSignals: [
        'Original AuthService implementation (synchronous)',
        'Security best practices constraint bundle',
        'Token management requirement from context',
        'async/await pattern preference in codebase'
      ],
      assumptions: [
        'Token-based authentication is required for the system',
        'Credentials validation should be asynchronous to support external auth providers',
        'TokenManager class exists or will be created separately',
        'Existing synchronous login calls can be migrated to async'
      ],
      confidenceLevel: 'high',
      reasoning: 'Refactored authentication to use async/await pattern with proper token management. Added credential validation and token generation to align with modern security practices. This change enables future integration with external authentication providers and improves security by centralizing token operations.'
    },
    'src/domain/UserRepository.ts': {
      agentName: 'Agent-Refactorer-v2',
      inputSignals: [
        'Existing UserRepository.findById method',
        'Soft delete requirement from PRD',
        'SQL injection prevention patterns',
        'Null safety concerns flagged in static analysis'
      ],
      assumptions: [
        'Database schema includes deleted_at timestamp column',
        'Soft delete is preferred over hard delete for audit trail',
        'mapToUser helper method exists for data transformation',
        'Default behavior should exclude deleted records'
      ],
      confidenceLevel: 'high',
      reasoning: 'Enhanced findById method to support soft delete filtering and added proper null handling. The includeDeleted parameter provides flexibility while defaulting to excluding deleted records, maintaining data integrity and supporting audit requirements.'
    },
    'src/controllers/UserController.ts': {
      agentName: 'Agent-Scaffolder-v3',
      inputSignals: [
        'Express.js framework detected in dependencies',
        'RESTful API pattern from architecture constraints',
        'UserService interface and methods',
        'Error handling and logging requirements'
      ],
      assumptions: [
        'Express Request/Response types are available',
        'Logger utility is configured and available',
        'UserService methods match the expected signatures',
        'Standard HTTP status codes (404, 500, 201, 204) are appropriate',
        'JSON response format is the API standard'
      ],
      confidenceLevel: 'medium',
      reasoning: 'Generated new UserController to provide HTTP endpoints for user operations. Implemented standard CRUD operations (GET, POST, DELETE) with proper error handling, logging, and HTTP status codes. This follows the repository-service-controller pattern detected in the codebase.'
    },
    'src/services/UserService.ts': {
      agentName: 'Agent-Refactorer-v2',
      inputSignals: [
        'Existing UserService with basic create operation',
        'Email notification requirement from feature spec',
        'UserRepository interface and available methods',
        'Separation of concerns principle'
      ],
      assumptions: [
        'EmailService exists or will be created',
        'Welcome email should be sent asynchronously after user creation',
        'Email sending failures should not block user creation',
        'Soft delete is the preferred deletion strategy'
      ],
      confidenceLevel: 'high',
      reasoning: 'Expanded UserService with getUserById and deleteUser methods, and integrated email notifications for new user creation. This maintains separation of concerns while adding business logic for user lifecycle events. Soft delete implementation preserves audit trail.'
    },
    'src/types/User.ts': {
      agentName: 'Agent-Scaffolder-v3',
      inputSignals: [
        'Existing User interface structure',
        'Token requirement from AuthService changes',
        'Soft delete pattern requiring timestamp fields',
        'Audit trail best practices'
      ],
      assumptions: [
        'Token field is optional as not all User contexts require it',
        'TypeScript Date type is appropriate for timestamp fields',
        'deletedAt being optional indicates active vs. deleted status',
        'No breaking changes to existing User interface consumers'
      ],
      confidenceLevel: 'high',
      reasoning: 'Extended User type with token field to support authentication changes, and added audit timestamp fields (createdAt, updatedAt, deletedAt). These additions support both security requirements and soft delete functionality while maintaining backward compatibility.'
    },
    'tests/UserService.test.ts': {
      agentName: 'Agent-Tester-v2',
      inputSignals: [
        'UserService implementation with new methods',
        'Vitest testing framework detected',
        'Testing patterns from existing test files',
        'Mock patterns for dependencies'
      ],
      assumptions: [
        'Vitest is configured and available',
        'UserRepository should be mocked for unit testing',
        'Test coverage for both success and failure paths is required',
        'jest.Mocked type is compatible with vitest mocks'
      ],
      confidenceLevel: 'medium',
      reasoning: 'Generated comprehensive unit tests for UserService covering getUserById and createUser methods. Tests include both success and error cases with proper mocking of dependencies. Note: There may be a minor incompatibility between jest.Mocked type and vitest that should be verified.'
    },
    'README.md': {
      agentName: 'Agent-Documenter-v1',
      inputSignals: [
        'Changes across AuthService, UserService, and test files',
        'New features: authentication, email, soft delete',
        'Testing infrastructure additions',
        'Existing README structure'
      ],
      assumptions: [
        'npm is the package manager in use',
        'Standard npm test script is configured',
        'Documentation should be user-facing, not technical implementation details',
        'Installation and testing sections are priorities for developers'
      ],
      confidenceLevel: 'high',
      reasoning: 'Updated README to reflect new features including authentication, email notifications, and testing. Added installation and testing instructions to help developers get started quickly. Documentation focuses on user-facing capabilities rather than implementation specifics.'
    },
    'config/database.json': {
      agentName: 'Agent-Scaffolder-v3',
      inputSignals: [
        'Existing database configuration',
        'Production readiness requirements',
        'Connection reliability best practices',
        'Timeout and retry patterns from infrastructure docs'
      ],
      assumptions: [
        'SSL configuration should be explicit (disabled for local dev)',
        '30-second timeout is reasonable for database operations',
        '3 retry attempts provides good balance between reliability and fail-fast',
        'Connection pool of 10 is sufficient for current scale'
      ],
      confidenceLevel: 'medium',
      reasoning: 'Enhanced database configuration with SSL settings, connection timeout, and retry logic. These additions improve production readiness and connection reliability. SSL is disabled by default for local development but should be enabled in production environments.'
    }
  }

  return rationaleMap[filePath] || {
    agentName: 'Agent-Scaffolder-v3',
    inputSignals: [
      'File context and surrounding codebase',
      'Architecture patterns and constraints'
    ],
    assumptions: [
      'Standard coding patterns should be followed',
      'Changes should maintain backward compatibility where possible'
    ],
    confidenceLevel: 'medium',
    reasoning: `${fileType === 'added' ? 'Generated new file' : 'Modified existing file'} to support the requested functionality. Changes align with established codebase patterns and architectural constraints.`
  }
}

function parseDiff(content: string): FileDiff[] {
  const files: FileDiff[] = []
  const lines = content.split('\n')
  let currentFile: FileDiff | null = null
  let currentHunk: DiffHunk | null = null
  let oldLineNumber = 0
  let newLineNumber = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('diff --git')) {
      if (currentFile && currentHunk) {
        currentFile.hunks.push(currentHunk)
      }
      
      const match = line.match(/diff --git a\/(.+?) b\/(.+)/)
      if (match) {
        currentFile = {
          path: match[2],
          oldPath: match[1] !== match[2] ? match[1] : undefined,
          type: 'modified',
          hunks: [],
          additions: 0,
          deletions: 0,
        }
        files.push(currentFile)
        currentHunk = null
      }
    } else if (line.startsWith('new file mode')) {
      if (currentFile) currentFile.type = 'added'
    } else if (line.startsWith('deleted file mode')) {
      if (currentFile) currentFile.type = 'deleted'
    } else if (line.startsWith('rename from')) {
      if (currentFile) currentFile.type = 'renamed'
    } else if (line.startsWith('@@')) {
      if (currentFile && currentHunk) {
        currentFile.hunks.push(currentHunk)
      }

      const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)/)
      if (match && currentFile) {
        oldLineNumber = parseInt(match[1])
        const oldCount = match[2] ? parseInt(match[2]) : 1
        newLineNumber = parseInt(match[3])
        const newCount = match[4] ? parseInt(match[4]) : 1
        
        currentHunk = {
          oldStart: oldLineNumber,
          oldLines: oldCount,
          newStart: newLineNumber,
          newLines: newCount,
          lines: [],
          header: match[5]?.trim() || undefined,
        }
      }
    } else if (currentHunk && currentFile) {
      if (line.startsWith('+')) {
        currentHunk.lines.push({
          type: 'add',
          content: line.slice(1),
          newLineNumber: newLineNumber++,
        })
        currentFile.additions++
      } else if (line.startsWith('-')) {
        currentHunk.lines.push({
          type: 'delete',
          content: line.slice(1),
          oldLineNumber: oldLineNumber++,
        })
        currentFile.deletions++
      } else if (line.startsWith(' ')) {
        currentHunk.lines.push({
          type: 'context',
          content: line.slice(1),
          oldLineNumber: oldLineNumber++,
          newLineNumber: newLineNumber++,
        })
      } else if (line.startsWith('\\')) {
        currentHunk.lines.push({
          type: 'context',
          content: line,
        })
      }
    }
  }

  if (currentFile && currentHunk) {
    currentFile.hunks.push(currentHunk)
  }

  return files
}

interface SplitSide {
  lineNumber?: number
  content: string
  highlighted?: HighlightToken[]
  wordDiff?: WordDiffSegment[]
  type: 'add' | 'delete' | 'context' | 'empty'
}

interface SplitLine {
  left: SplitSide
  right: SplitSide
}

function renderWordDiff(segments: WordDiffSegment[], lineType: 'add' | 'delete') {
  return segments.map((segment, index) => {
    if (segment.type === 'unchanged') {
      return <span key={index}>{segment.text}</span>
    } else if (segment.type === 'added' && lineType === 'add') {
      return (
        <span 
          key={index} 
          className="bg-success/30 rounded px-0.5"
        >
          {segment.text}
        </span>
      )
    } else if (segment.type === 'removed' && lineType === 'delete') {
      return (
        <span 
          key={index} 
          className="bg-destructive/30 rounded px-0.5"
        >
          {segment.text}
        </span>
      )
    }
    return null
  })
}

function createSplitLines(hunk: DiffHunk): SplitLine[] {
  const splitLines: SplitLine[] = []
  const deletions: DiffLine[] = []
  const additions: DiffLine[] = []

  for (const line of hunk.lines) {
    if (line.type === 'delete') {
      deletions.push(line)
    } else if (line.type === 'add') {
      additions.push(line)
    } else if (line.type === 'context') {
      if (deletions.length > 0 || additions.length > 0) {
        const maxLen = Math.max(deletions.length, additions.length)
        for (let i = 0; i < maxLen; i++) {
          const del = deletions[i]
          const add = additions[i]
          
          let delSide: SplitSide
          let addSide: SplitSide
          
          if (del && add) {
            const { oldSegments, newSegments } = computeWordDiff(del.content, add.content)
            delSide = { 
              lineNumber: del.oldLineNumber, 
              content: del.content, 
              highlighted: del.highlighted, 
              wordDiff: mergeConsecutiveSegments(oldSegments),
              type: 'delete' 
            }
            addSide = { 
              lineNumber: add.newLineNumber, 
              content: add.content, 
              highlighted: add.highlighted, 
              wordDiff: mergeConsecutiveSegments(newSegments),
              type: 'add' 
            }
          } else {
            delSide = del
              ? { lineNumber: del.oldLineNumber, content: del.content, highlighted: del.highlighted, type: 'delete' }
              : { content: '', type: 'empty' }
            addSide = add
              ? { lineNumber: add.newLineNumber, content: add.content, highlighted: add.highlighted, type: 'add' }
              : { content: '', type: 'empty' }
          }
          
          splitLines.push({
            left: delSide,
            right: addSide,
          })
        }
        deletions.length = 0
        additions.length = 0
      }

      splitLines.push({
        left: { lineNumber: line.oldLineNumber, content: line.content, highlighted: line.highlighted, type: 'context' },
        right: { lineNumber: line.newLineNumber, content: line.content, highlighted: line.highlighted, type: 'context' },
      })
    }
  }

  if (deletions.length > 0 || additions.length > 0) {
    const maxLen = Math.max(deletions.length, additions.length)
    for (let i = 0; i < maxLen; i++) {
      const del = deletions[i]
      const add = additions[i]
      
      let delSide: SplitSide
      let addSide: SplitSide
      
      if (del && add) {
        const { oldSegments, newSegments } = computeWordDiff(del.content, add.content)
        delSide = { 
          lineNumber: del.oldLineNumber, 
          content: del.content, 
          highlighted: del.highlighted, 
          wordDiff: mergeConsecutiveSegments(oldSegments),
          type: 'delete' 
        }
        addSide = { 
          lineNumber: add.newLineNumber, 
          content: add.content, 
          highlighted: add.highlighted, 
          wordDiff: mergeConsecutiveSegments(newSegments),
          type: 'add' 
        }
      } else {
        delSide = del
          ? { lineNumber: del.oldLineNumber, content: del.content, highlighted: del.highlighted, type: 'delete' }
          : { content: '', type: 'empty' }
        addSide = add
          ? { lineNumber: add.newLineNumber, content: add.content, highlighted: add.highlighted, type: 'add' }
          : { content: '', type: 'empty' }
      }
      
      splitLines.push({
        left: delSide,
        right: addSide,
      })
    }
  }

  return splitLines
}

interface SplitViewProps {
  file: FileDiff & {
    hunks: Array<
      DiffHunk & {
        lines: Array<DiffLine & { highlighted?: HighlightToken[] }>
      }
    >
  }
  wordDiffEnabled: boolean
}

function SplitView({ file, wordDiffEnabled }: SplitViewProps) {
  return (
    <>
      {file.hunks.map((hunk, hunkIndex) => {
        const splitLines = createSplitLines(hunk)
        return (
          <div key={hunkIndex} className="border-t">
            {hunk.header && (
              <div className="px-4 py-1 bg-muted text-xs text-muted-foreground font-mono">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@ {hunk.header}
              </div>
            )}
            <div className="font-mono text-xs">
              {splitLines.map((splitLine, lineIndex) => (
                <div key={lineIndex} className="flex items-stretch">
                  <div
                    className={cn(
                      'flex-1 flex items-stretch min-w-0 border-r',
                      splitLine.left.type === 'delete' && 'bg-destructive/10',
                      splitLine.left.type === 'empty' && 'bg-muted/20'
                    )}
                  >
                    <div className="w-12 flex-shrink-0 px-2 text-right text-muted-foreground select-none bg-muted/50 border-r">
                      {splitLine.left.lineNumber}
                    </div>
                    {splitLine.left.type !== 'empty' && (
                      <>
                        <div
                          className={cn(
                            'w-6 flex-shrink-0 flex items-center justify-center',
                            splitLine.left.type === 'delete' && 'text-destructive'
                          )}
                        >
                          {splitLine.left.type === 'delete' && <Minus size={12} weight="bold" />}
                        </div>
                        <pre className="px-2 py-0.5 flex-1 overflow-x-auto whitespace-pre">
                          {wordDiffEnabled && splitLine.left.wordDiff
                            ? renderWordDiff(splitLine.left.wordDiff, 'delete')
                            : splitLine.left.highlighted
                            ? renderHighlightedCode(splitLine.left.highlighted)
                            : splitLine.left.content}
                        </pre>
                      </>
                    )}
                  </div>

                  <div
                    className={cn(
                      'flex-1 flex items-stretch min-w-0',
                      splitLine.right.type === 'add' && 'bg-success/10',
                      splitLine.right.type === 'empty' && 'bg-muted/20'
                    )}
                  >
                    <div className="w-12 flex-shrink-0 px-2 text-right text-muted-foreground select-none bg-muted/50 border-r">
                      {splitLine.right.lineNumber}
                    </div>
                    {splitLine.right.type !== 'empty' && (
                      <>
                        <div
                          className={cn(
                            'w-6 flex-shrink-0 flex items-center justify-center',
                            splitLine.right.type === 'add' && 'text-success'
                          )}
                        >
                          {splitLine.right.type === 'add' && <Plus size={12} weight="bold" />}
                        </div>
                        <pre className="px-2 py-0.5 flex-1 overflow-x-auto whitespace-pre">
                          {wordDiffEnabled && splitLine.right.wordDiff
                            ? renderWordDiff(splitLine.right.wordDiff, 'add')
                            : splitLine.right.highlighted
                            ? renderHighlightedCode(splitLine.right.highlighted)
                            : splitLine.right.content}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}

export function DiffViewer({ content }: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'split' | 'unified'>('unified')
  const [wordDiffEnabled, setWordDiffEnabled] = useKV<boolean>('diff-viewer-word-diff-enabled', true)
  const [reviewModeEnabled, setReviewModeEnabled] = useKV<boolean>('diff-viewer-review-mode', false)
  const [fileReviewStatuses, setFileReviewStatuses] = useKV<Record<string, ReviewStatus>>('file-review-statuses', {})
  const [showSemanticGroups, setShowSemanticGroups] = useKV<boolean>('diff-viewer-show-semantic-groups', false)

  const files = useMemo(() => parseDiff(content), [content])

  const semanticGroups = useMemo(() => {
    return categorizeFilesByArchitecturalLayer(files.map(f => f.path))
  }, [files])

  const setFileStatus = (filePath: string, status: ReviewStatus) => {
    setFileReviewStatuses((current) => ({
      ...current,
      [filePath]: status,
    }))
  }

  const getFileStatus = (filePath: string): ReviewStatus => {
    return fileReviewStatuses?.[filePath] || 'pending'
  }

  const scrollToFile = (filePath: string) => {
    const fileElement = document.getElementById(`file-${filePath}`)
    if (fileElement) {
      fileElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (!expandedFiles.has(filePath)) {
        toggleFile(filePath)
      }
    }
  }

  const highlightedFiles = useMemo(() => {
    return files.map(file => {
      const hunks = file.hunks.map(hunk => {
        const lines = [...hunk.lines]
        
        for (let i = 0; i < lines.length - 1; i++) {
          const currentLine = lines[i]
          const nextLine = lines[i + 1]
          
          if (currentLine.type === 'delete' && nextLine.type === 'add') {
            const { oldSegments, newSegments } = computeWordDiff(currentLine.content, nextLine.content)
            currentLine.wordDiff = mergeConsecutiveSegments(oldSegments)
            nextLine.wordDiff = mergeConsecutiveSegments(newSegments)
          }
        }
        
        return {
          ...hunk,
          lines: lines.map(line => ({
            ...line,
            highlighted: highlightCode(line.content, file.path),
          })),
        }
      })
      
      const fileContentForAnalysis = file.hunks
        .flatMap(h => h.lines)
        .map(l => l.content)
        .join('\n')
      
      const reviewMetadata = reviewModeEnabled ? {
        risk: analyzeChangeRisk(file.path, fileContentForAnalysis, file.additions, file.deletions),
        isLarge: isLargeDiff(file.additions, file.deletions),
        isCoreLayer: isCoreLayer(file.path),
      } : undefined
      
      return {
        ...file,
        hunks,
        reviewMetadata,
      }
    })
  }, [files, reviewModeEnabled])

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedFiles(new Set(files.map((f) => f.path)))
  }

  const collapseAll = () => {
    setExpandedFiles(new Set())
  }

  const markAllAs = (status: ReviewStatus) => {
    const newStatuses: Record<string, ReviewStatus> = {}
    files.forEach(file => {
      newStatuses[file.path] = status
    })
    setFileReviewStatuses(newStatuses)
  }

  const clearAllReviewStatuses = () => {
    setFileReviewStatuses({})
  }

  const getFileTypeBadge = (type: FileDiff['type']) => {
    const configs = {
      added: { label: 'Added', className: 'bg-success/20 text-success-foreground border-success/40' },
      deleted: { label: 'Deleted', className: 'bg-destructive/20 text-destructive-foreground border-destructive/40' },
      modified: { label: 'Modified', className: 'bg-accent/20 text-accent-foreground border-accent/40' },
      renamed: { label: 'Renamed', className: 'bg-warning/20 text-warning-foreground border-warning/40' },
    }
    const config = configs[type]
    return (
      <Badge variant="outline" className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: ChangeRisk) => {
    const configs = {
      high: { 
        icon: '🔴', 
        label: 'High Risk', 
        className: 'bg-destructive/20 text-destructive-foreground border-destructive/40' 
      },
      medium: { 
        icon: '🟡', 
        label: 'Medium', 
        className: 'bg-warning/20 text-warning-foreground border-warning/40' 
      },
      low: { 
        icon: '🟢', 
        label: 'Low Risk', 
        className: 'bg-success/20 text-success-foreground border-success/40' 
      },
    }
    const config = configs[risk]
    return (
      <Badge variant="outline" className={cn('text-xs gap-1', config.className)}>
        <span>{config.icon}</span>
        {config.label}
      </Badge>
    )
  }

  const getReviewStatusBadge = (status: ReviewStatus) => {
    const configs = {
      ok: { 
        icon: CheckCircle, 
        label: 'OK', 
        className: 'bg-success/20 text-success-foreground border-success/40',
        iconWeight: 'fill' as const,
      },
      needs_sme: { 
        icon: Brain, 
        label: 'Needs SME', 
        className: 'bg-warning/20 text-warning-foreground border-warning/40',
        iconWeight: 'fill' as const,
      },
      needs_rerun: { 
        icon: ArrowClockwise, 
        label: 'Needs Re-run', 
        className: 'bg-destructive/20 text-destructive-foreground border-destructive/40',
        iconWeight: 'bold' as const,
      },
      pending: { 
        icon: Clock, 
        label: 'Pending', 
        className: 'bg-muted text-muted-foreground border-muted-foreground/40',
        iconWeight: 'regular' as const,
      },
    }
    const config = configs[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={cn('text-xs gap-1', config.className)}>
        <Icon size={12} weight={config.iconWeight} />
        {config.label}
      </Badge>
    )
  }

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0)
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0)

  const reviewStatusCounts = useMemo(() => {
    const counts = { ok: 0, needs_sme: 0, needs_rerun: 0, pending: 0 }
    files.forEach(file => {
      const status = getFileStatus(file.path)
      counts[status]++
    })
    return counts
  }, [files, fileReviewStatuses])

  const reviewProgress = files.length > 0 
    ? Math.round(((reviewStatusCounts.ok + reviewStatusCounts.needs_sme + reviewStatusCounts.needs_rerun) / files.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      {reviewModeEnabled && files.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} weight="fill" className="text-accent" />
                <span className="font-semibold">Review Status</span>
                {reviewProgress === 100 && (
                  <Badge variant="outline" className="bg-success/20 text-success-foreground border-success/40">
                    <CheckCircle size={12} weight="fill" className="mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {reviewProgress}% reviewed ({files.length - reviewStatusCounts.pending} of {files.length} files)
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => markAllAs('ok')} className="gap-2">
                      <CheckCircle size={16} weight="fill" className="text-success" />
                      Mark all as OK
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => markAllAs('needs_sme')} className="gap-2">
                      <Brain size={16} weight="fill" className="text-warning" />
                      Mark all as Needs SME
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => markAllAs('needs_rerun')} className="gap-2">
                      <ArrowClockwise size={16} weight="bold" className="text-destructive" />
                      Mark all as Needs Re-run
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearAllReviewStatuses} className="gap-2">
                      <Clock size={16} weight="regular" className="text-muted-foreground" />
                      Reset all to Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center justify-between px-3 py-2 bg-success/10 rounded-md border border-success/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  <span className="text-sm font-medium">OK</span>
                </div>
                <span className="font-mono font-semibold">{reviewStatusCounts.ok}</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 bg-warning/10 rounded-md border border-warning/20">
                <div className="flex items-center gap-2">
                  <Brain size={16} weight="fill" className="text-warning" />
                  <span className="text-sm font-medium">Needs SME</span>
                </div>
                <span className="font-mono font-semibold">{reviewStatusCounts.needs_sme}</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 bg-destructive/10 rounded-md border border-destructive/20">
                <div className="flex items-center gap-2">
                  <ArrowClockwise size={16} weight="bold" className="text-destructive" />
                  <span className="text-sm font-medium">Needs Re-run</span>
                </div>
                <span className="font-mono font-semibold">{reviewStatusCounts.needs_rerun}</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md border border-border">
                <div className="flex items-center gap-2">
                  <Clock size={16} weight="regular" className="text-muted-foreground" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="font-mono font-semibold">{reviewStatusCounts.pending}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Files changed:</span>
            <span className="font-semibold">{files.length}</span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <Plus size={16} weight="bold" />
            <span className="font-mono font-semibold">{totalAdditions}</span>
          </div>
          <div className="flex items-center gap-2 text-destructive">
            <Minus size={16} weight="bold" />
            <span className="font-mono font-semibold">{totalDeletions}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-card">
            <ShieldCheck size={16} className="text-muted-foreground" />
            <Label htmlFor="review-mode-toggle" className="text-sm cursor-pointer">
              Review Mode
            </Label>
            <Switch
              id="review-mode-toggle"
              checked={reviewModeEnabled ?? false}
              onCheckedChange={(checked) => setReviewModeEnabled(checked)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-card">
            <Folders size={16} className="text-muted-foreground" />
            <Label htmlFor="semantic-groups-toggle" className="text-sm cursor-pointer">
              Semantic Groups
            </Label>
            <Switch
              id="semantic-groups-toggle"
              checked={showSemanticGroups ?? false}
              onCheckedChange={(checked) => setShowSemanticGroups(checked)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-card">
            <TextAa size={16} className="text-muted-foreground" />
            <Label htmlFor="word-diff-toggle" className="text-sm cursor-pointer">
              Word diff
            </Label>
            <Switch
              id="word-diff-toggle"
              checked={wordDiffEnabled}
              onCheckedChange={(checked) => setWordDiffEnabled(checked)}
            />
          </div>
          <div className="flex items-center border rounded-md">
            <Button
              variant={view === 'unified' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('unified')}
              className="rounded-r-none gap-2"
            >
              <ListDashes size={16} />
              Unified
            </Button>
            <Button
              variant={view === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('split')}
              className="rounded-l-none gap-2"
            >
              <Columns size={16} />
              Split
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {showSemanticGroups && (
          <div className="lg:col-span-4">
            <SemanticGroupsPanel 
              groups={semanticGroups}
              onFileClick={scrollToFile}
              fileReviewStatus={fileReviewStatuses}
              onFileReview={setFileStatus}
            />
          </div>
        )}
        
        <div className={showSemanticGroups ? "lg:col-span-8" : "lg:col-span-12"}>
          <ScrollArea className="h-[calc(100vh-400px)] border rounded-lg">
            <div className="divide-y">
              {highlightedFiles.map((file) => {
                const isExpanded = expandedFiles.has(file.path)
                const fileStatus = getFileStatus(file.path)
                const provenance = generateMockProvenance(file.path)
                return (
                  <div key={file.path} id={`file-${file.path}`} className="bg-card">
                <div className="w-full px-4 py-3 flex items-center gap-2 hover:bg-muted/50 transition-colors">
                  <button
                    onClick={() => toggleFile(file.path)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    {isExpanded ? (
                      <CaretDown size={16} weight="bold" className="flex-shrink-0" />
                    ) : (
                      <CaretRight size={16} weight="bold" className="flex-shrink-0" />
                    )}
                    <File size={16} className="flex-shrink-0 text-muted-foreground" />
                    <span className="font-mono text-sm flex-1 truncate">{file.path}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <FileProvenanceBadge {...provenance} />
                    {getFileTypeBadge(file.type)}
                    
                    {reviewModeEnabled && file.reviewMetadata && (
                      <>
                        {getRiskBadge(file.reviewMetadata.risk)}
                        {file.reviewMetadata.isLarge && (
                          <Badge variant="outline" className="text-xs gap-1 bg-warning/20 text-warning-foreground border-warning/40">
                            <Warning size={12} weight="bold" />
                            Large diff
                          </Badge>
                        )}
                        {file.reviewMetadata.isCoreLayer && (
                          <Badge variant="outline" className="text-xs gap-1 bg-destructive/20 text-destructive-foreground border-destructive/40">
                            <ShieldCheck size={12} weight="bold" />
                            Core layer
                          </Badge>
                        )}
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-0 hover:bg-transparent"
                        >
                          {getReviewStatusBadge(fileStatus)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setFileStatus(file.path, 'ok')}
                          className="gap-2"
                        >
                          <CheckCircle size={16} weight="fill" className="text-success" />
                          <span>OK</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFileStatus(file.path, 'needs_sme')}
                          className="gap-2"
                        >
                          <Brain size={16} weight="fill" className="text-warning" />
                          <span>Needs SME</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFileStatus(file.path, 'needs_rerun')}
                          className="gap-2"
                        >
                          <ArrowClockwise size={16} weight="bold" className="text-destructive" />
                          <span>Needs Re-run</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFileStatus(file.path, 'pending')}
                          className="gap-2"
                        >
                          <Clock size={16} weight="regular" className="text-muted-foreground" />
                          <span>Pending</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <div className="flex items-center gap-3 text-xs">
                      {file.additions > 0 && (
                        <span className="text-success font-mono">+{file.additions}</span>
                      )}
                      {file.deletions > 0 && (
                        <span className="text-destructive font-mono">-{file.deletions}</span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className="bg-muted/30">
                      {view === 'unified' ? (
                        file.hunks.map((hunk, hunkIndex) => (
                          <div key={hunkIndex} className="border-t">
                            {hunk.header && (
                              <div className="px-4 py-1 bg-muted text-xs text-muted-foreground font-mono">
                                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@ {hunk.header}
                              </div>
                            )}
                            <div className="font-mono text-xs">
                              {hunk.lines.map((line, lineIndex) => (
                                <div
                                  key={lineIndex}
                                  className={cn(
                                    'flex items-stretch',
                                    line.type === 'add' && 'bg-success/10',
                                    line.type === 'delete' && 'bg-destructive/10'
                                  )}
                                >
                                  <div className="flex items-stretch divide-x divide-border bg-muted/50">
                                    <div className="w-12 flex-shrink-0 px-2 text-right text-muted-foreground select-none">
                                      {line.oldLineNumber}
                                    </div>
                                    <div className="w-12 flex-shrink-0 px-2 text-right text-muted-foreground select-none">
                                      {line.newLineNumber}
                                    </div>
                                  </div>
                                  <div className="flex items-stretch flex-1 min-w-0">
                                    <div
                                      className={cn(
                                        'w-8 flex-shrink-0 flex items-center justify-center',
                                        line.type === 'add' && 'text-success',
                                        line.type === 'delete' && 'text-destructive'
                                      )}
                                    >
                                      {line.type === 'add' && <Plus size={12} weight="bold" />}
                                      {line.type === 'delete' && <Minus size={12} weight="bold" />}
                                    </div>
                                    <pre className="px-2 py-0.5 flex-1 overflow-x-auto whitespace-pre">
                                      {wordDiffEnabled && line.wordDiff
                                        ? renderWordDiff(line.wordDiff, line.type as 'add' | 'delete')
                                        : line.highlighted 
                                        ? renderHighlightedCode(line.highlighted) 
                                        : line.content}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <SplitView file={file} wordDiffEnabled={wordDiffEnabled ?? true} />
                      )}
                    </div>
                    <AgentRationalePanel 
                      filePath={file.path} 
                      rationale={generateMockRationale(file.path, file.type)} 
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {files.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <File size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No diff content to display</p>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
