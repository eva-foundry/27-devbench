import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  ShieldCheck, 
  Brain, 
  TestTube, 
  Warning, 
  CaretDown, 
  CaretRight,
  CheckCircle,
  XCircle,
  MinusCircle,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ReviewChecklist, ChangeRisk } from '@/lib/types'

interface ReviewModePanelProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  checklist: ReviewChecklist
  onChecklistChange: (checklist: ReviewChecklist) => void
  fileCount: number
  largeDiffCount: number
  coreLayerCount: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  testFiles?: string[]
  smeFlags?: { file: string; reason: string }[]
}

export function ReviewModePanel({
  enabled,
  onToggle,
  checklist,
  onChecklistChange,
  fileCount,
  largeDiffCount,
  coreLayerCount,
  highRiskCount,
  mediumRiskCount,
  lowRiskCount,
  testFiles = [],
  smeFlags = [],
}: ReviewModePanelProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck size={20} weight="fill" className="text-accent" />
            Review Mode
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Overview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between px-2 py-1 bg-card rounded">
                <span className="text-muted-foreground">Files changed</span>
                <span className="font-mono font-semibold">{fileCount}</span>
              </div>
              {largeDiffCount > 0 && (
                <div className="flex items-center justify-between px-2 py-1 bg-warning/10 rounded">
                  <span className="text-muted-foreground">Large diffs</span>
                  <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                    {largeDiffCount}
                  </Badge>
                </div>
              )}
              {coreLayerCount > 0 && (
                <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 rounded">
                  <span className="text-muted-foreground">Core layers</span>
                  <Badge variant="outline" className="bg-destructive/20 text-destructive-foreground">
                    {coreLayerCount}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Risk Distribution</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span>High risk</span>
                </div>
                <span className="font-mono">{highRiskCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span>Medium risk</span>
                </div>
                <span className="font-mono">{mediumRiskCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>Low risk</span>
                </div>
                <span className="font-mono">{lowRiskCount}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Review Checklist</h4>
            <div className="space-y-3">
              <ChecklistItem
                icon={Brain as PhosphorIcon}
                label="Business logic inferred?"
                value={checklist.businessLogicInferred}
                onChange={(value) =>
                  onChecklistChange({ ...checklist, businessLogicInferred: value })
                }
              />
              <div>
                <ChecklistItem
                  icon={ShieldCheck as PhosphorIcon}
                  label="SME validation required?"
                  value={checklist.smeValidationRequired ? true : false}
                  onChange={(value) =>
                    onChecklistChange({ ...checklist, smeValidationRequired: value === true })
                  }
                />
                {smeFlags.length > 0 && (
                  <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs mt-1 h-7"
                      >
                        <CaretRight size={12} className={cn('transition-transform', showDetails && 'rotate-90')} />
                        {smeFlags.length} file{smeFlags.length !== 1 ? 's' : ''} auto-flagged
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-1">
                      {smeFlags.slice(0, 5).map((flag, idx) => (
                        <div key={idx} className="text-xs px-2 py-1 bg-warning/10 rounded border border-warning/20">
                          <div className="font-mono truncate">{flag.file}</div>
                          <div className="text-muted-foreground">{flag.reason}</div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
              <div>
                <ChecklistItem
                  icon={TestTube as PhosphorIcon}
                  label="Tests generated?"
                  value={checklist.testsGenerated}
                  onChange={(value) =>
                    onChecklistChange({ ...checklist, testsGenerated: value === true })
                  }
                />
                {testFiles.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground px-2">
                    Found {testFiles.length} test file{testFiles.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <ChecklistItem
                icon={ShieldCheck as PhosphorIcon}
                label="Security reviewed?"
                value={checklist.securityReviewed}
                onChange={(value) =>
                  onChecklistChange({ ...checklist, securityReviewed: value })
                }
              />
              <ChecklistItem
                icon={Warning as PhosphorIcon}
                label="Performance considered?"
                value={checklist.performanceConsidered}
                onChange={(value) =>
                  onChecklistChange({ ...checklist, performanceConsidered: value })
                }
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface ChecklistItemProps {
  icon: PhosphorIcon
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

function ChecklistItem({ icon: Icon, label, value, onChange }: ChecklistItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 flex-1">
        <Icon size={16} weight="regular" className="text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            value === true && 'bg-success/20 text-success hover:bg-success/30'
          )}
          onClick={() => onChange(value === true ? null : true)}
        >
          <CheckCircle size={16} weight={value === true ? 'fill' : 'regular'} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            value === false && 'bg-destructive/20 text-destructive hover:bg-destructive/30'
          )}
          onClick={() => onChange(value === false ? null : false)}
        >
          <XCircle size={16} weight={value === false ? 'fill' : 'regular'} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            value === null && 'bg-muted text-muted-foreground'
          )}
          onClick={() => onChange(null)}
        >
          <MinusCircle size={16} weight={value === null ? 'fill' : 'regular'} />
        </Button>
      </div>
    </div>
  )
}

export function getRiskBadge(risk: ChangeRisk) {
  const configs = {
    high: { 
      icon: '🔴', 
      label: 'High Risk', 
      className: 'bg-destructive/20 text-destructive-foreground border-destructive/40',
      description: 'Branching logic, conditionals, auth, calculations'
    },
    medium: { 
      icon: '🟡', 
      label: 'Medium Risk', 
      className: 'bg-warning/20 text-warning-foreground border-warning/40',
      description: 'Scaffolding, wiring, moderate complexity'
    },
    low: { 
      icon: '🟢', 
      label: 'Low Risk', 
      className: 'bg-success/20 text-success-foreground border-success/40',
      description: 'Comments, docs, tests, configuration'
    },
  }
  
  const config = configs[risk]
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', config.className)} title={config.description}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  )
}
