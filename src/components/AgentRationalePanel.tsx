import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Lightbulb, 
  ShieldCheck, 
  CaretDown, 
  CaretRight,
  Fingerprint,
  ClockCounterClockwise,
  Cube,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { AgentRationale, ConfidenceLevel } from '@/lib/types'
import { useState } from 'react'

interface AgentRationalePanelProps {
  filePath: string
  rationale: AgentRationale
}

export function AgentRationalePanel({ filePath, rationale }: AgentRationalePanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    const configs = {
      high: { label: 'High Confidence', className: 'bg-success/20 text-success-foreground border-success/40' },
      medium: { label: 'Medium Confidence', className: 'bg-warning/20 text-warning-foreground border-warning/40' },
      low: { label: 'Low Confidence', className: 'bg-destructive/20 text-destructive-foreground border-destructive/40' },
    }
    const config = configs[level]
    return (
      <Badge variant="outline" className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full px-4 py-3 flex items-center gap-2 hover:bg-accent/5 transition-colors text-left border-b">
          {isOpen ? (
            <CaretDown size={16} weight="bold" className="flex-shrink-0" />
          ) : (
            <CaretRight size={16} weight="bold" className="flex-shrink-0" />
          )}
          <Brain size={18} weight="fill" className="text-accent flex-shrink-0" />
          <span className="text-sm font-medium flex-1">Why this change?</span>
          {getConfidenceBadge(rationale.confidenceLevel)}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 bg-accent/5 space-y-4 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cube size={16} className="text-muted-foreground" />
              <span className="font-semibold">Agent</span>
            </div>
            <Badge variant="secondary">{rationale.agentName}</Badge>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-muted-foreground" />
              <span className="font-semibold">Reasoning</span>
            </div>
            <p className="text-muted-foreground">{rationale.reasoning}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-muted-foreground" />
              <span className="font-semibold">Input Signals Used</span>
            </div>
            <ul className="space-y-1">
              {rationale.inputSignals.map((signal, idx) => (
                <li key={idx} className="text-muted-foreground text-xs flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-muted-foreground" />
              <span className="font-semibold">Explicit Assumptions</span>
            </div>
            <ul className="space-y-1">
              {rationale.assumptions.map((assumption, idx) => (
                <li key={idx} className="text-muted-foreground text-xs flex items-start gap-2">
                  <span className="text-warning">⚠</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface FileProvenanceBadgeProps {
  generatedBy: string
  modelProfile: string
  contextBundleHash: string
  runId: string
  timestamp: string
}

export function FileProvenanceBadge({
  generatedBy,
  modelProfile,
  contextBundleHash,
  runId,
  timestamp,
}: FileProvenanceBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded border transition-colors"
      >
        <Fingerprint size={12} weight="fill" />
        <span className="font-mono">{generatedBy}</span>
        {isExpanded ? <CaretDown size={10} /> : <CaretRight size={10} />}
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-card border rounded-lg shadow-sm space-y-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Generated by:</span>
            <span className="font-mono font-medium">{generatedBy}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Model profile:</span>
            <span className="font-mono">{modelProfile}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Context bundle:</span>
            <span className="font-mono text-[10px]">{contextBundleHash.slice(0, 16)}...</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Run ID:</span>
            <button 
              className="font-mono text-accent hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(runId)
              }}
            >
              {runId.slice(0, 8)}...
            </button>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="font-mono">{new Date(timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
