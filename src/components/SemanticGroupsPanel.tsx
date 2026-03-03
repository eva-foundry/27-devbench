import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { 
  Folders,
  CaretDown,
  CaretRight,
  File,
  CheckCircle,
  Brain,
  ArrowClockwise,
  Clock,
  Cube,
  Package,
  Wrench,
  Flask,
  FileText,
  Gear,
  Question,
  Funnel,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { SemanticGroup, ReviewStatus } from '@/lib/types'
import { useState, useMemo } from 'react'

interface SemanticGroupsPanelProps {
  groups: SemanticGroup[]
  onFileClick?: (filePath: string) => void
  fileReviewStatus?: Record<string, ReviewStatus>
  onFileReview?: (filePath: string, status: ReviewStatus) => void
}

export function SemanticGroupsPanel({ 
  groups, 
  onFileClick,
  fileReviewStatus,
  onFileReview,
}: SemanticGroupsPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([groups[0]?.name]))
  const [statusFilter, setStatusFilter] = useState<ReviewStatus[]>([])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  const filteredGroups = useMemo(() => {
    if (statusFilter.length === 0) {
      return groups
    }

    return groups.map(group => ({
      ...group,
      files: group.files.filter(file => {
        const status = fileReviewStatus?.[file] || 'pending'
        return statusFilter.includes(status)
      })
    })).filter(group => group.files.length > 0)
  }, [groups, statusFilter, fileReviewStatus])

  const handleFilterChange = (value: string[]) => {
    setStatusFilter(value as ReviewStatus[])
  }

  const statusCounts = useMemo(() => {
    const counts: Record<ReviewStatus, number> = {
      ok: 0,
      needs_sme: 0,
      needs_rerun: 0,
      pending: 0,
    }
    
    groups.forEach(group => {
      group.files.forEach(file => {
        const status = fileReviewStatus?.[file] || 'pending'
        counts[status]++
      })
    })
    
    return counts
  }, [groups, fileReviewStatus])

  const getCategoryIcon = (category: SemanticGroup['category']) => {
    const iconMap = {
      controller: Cube,
      dto: Package,
      service: Wrench,
      test: Flask,
      doc: FileText,
      config: Gear,
      other: Question,
    }
    return iconMap[category]
  }

  const getCategoryBadge = (category: SemanticGroup['category']) => {
    const configs = {
      controller: { label: 'Controllers', className: 'bg-accent/20 text-accent-foreground border-accent/40' },
      dto: { label: 'DTOs', className: 'bg-primary/20 text-primary-foreground border-primary/40' },
      service: { label: 'Services', className: 'bg-secondary/20 text-secondary-foreground border-secondary/40' },
      test: { label: 'Tests', className: 'bg-success/20 text-success-foreground border-success/40' },
      doc: { label: 'Documentation', className: 'bg-muted text-muted-foreground' },
      config: { label: 'Configuration', className: 'bg-warning/20 text-warning-foreground border-warning/40' },
      other: { label: 'Other', className: 'bg-muted text-muted-foreground' },
    }
    const config = configs[category]
    return (
      <Badge variant="outline" className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    )
  }

  const getReviewStatusBadge = (status: ReviewStatus) => {
    const configs = {
      ok: { 
        label: 'OK', 
        className: 'bg-success/20 text-success-foreground border-success/40',
        icon: CheckCircle,
      },
      needs_sme: { 
        label: 'Needs SME', 
        className: 'bg-warning/20 text-warning-foreground border-warning/40',
        icon: Brain,
      },
      needs_rerun: { 
        label: 'Needs Re-run', 
        className: 'bg-destructive/20 text-destructive-foreground border-destructive/40',
        icon: ArrowClockwise,
      },
      pending: { 
        label: 'Pending', 
        className: 'bg-muted text-muted-foreground',
        icon: Clock,
      },
    }
    const config = configs[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={cn('text-xs gap-1', config.className)}>
        <Icon size={12} weight={status === 'pending' ? 'regular' : 'fill'} />
        {config.label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Folders size={20} weight="fill" className="text-accent" />
          Semantic Groups
        </CardTitle>
        <CardDescription className="text-xs">
          Files organized by architectural layer and purpose
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Funnel size={14} weight="bold" className="text-muted-foreground" />
              <Label className="text-xs font-semibold">Filter by Status</Label>
            </div>
            <ToggleGroup 
              type="multiple" 
              value={statusFilter}
              onValueChange={handleFilterChange}
              className="grid grid-cols-2 gap-1"
            >
              <ToggleGroupItem 
                value="ok" 
                aria-label="Filter OK"
                className="text-xs gap-1 h-8"
              >
                <CheckCircle size={12} weight="fill" />
                OK ({statusCounts.ok})
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="needs_sme" 
                aria-label="Filter Needs SME"
                className="text-xs gap-1 h-8"
              >
                <Brain size={12} weight="fill" />
                SME ({statusCounts.needs_sme})
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="needs_rerun" 
                aria-label="Filter Needs Re-run"
                className="text-xs gap-1 h-8"
              >
                <ArrowClockwise size={12} weight="bold" />
                Re-run ({statusCounts.needs_rerun})
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="pending" 
                aria-label="Filter Pending"
                className="text-xs gap-1 h-8"
              >
                <Clock size={12} weight="regular" />
                Pending ({statusCounts.pending})
              </ToggleGroupItem>
            </ToggleGroup>
            {statusFilter.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter([])}
                className="w-full mt-2 h-7 text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
          
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-2">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Funnel size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files match the selected filters</p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.name)
                  const Icon = getCategoryIcon(group.category)
                  
                  return (
                    <Collapsible
                      key={group.name}
                      open={isExpanded}
                      onOpenChange={() => toggleGroup(group.name)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors text-left rounded border"
                        >
                          {isExpanded ? (
                            <CaretDown size={14} weight="bold" className="flex-shrink-0" />
                          ) : (
                            <CaretRight size={14} weight="bold" className="flex-shrink-0" />
                          )}
                          <Icon size={16} className="flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm font-medium flex-1">{group.name}</span>
                          {getCategoryBadge(group.category)}
                          <Badge variant="secondary" className="text-xs">
                            {group.files.length}
                          </Badge>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-1 ml-4 pl-4 border-l-2 space-y-1">
                          {group.files.map((file) => {
                            const status = fileReviewStatus?.[file] || 'pending'
                            return (
                              <div
                                key={file}
                                className="flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-muted/30 rounded text-xs group"
                              >
                                <button
                                  onClick={() => onFileClick?.(file)}
                                  className="font-mono text-left flex-1 truncate hover:text-accent transition-colors"
                                >
                                  {file}
                                </button>
                                {onFileReview && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => onFileReview(file, 'ok')}
                                      title="Mark as OK"
                                    >
                                      <CheckCircle size={14} weight={status === 'ok' ? 'fill' : 'regular'} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => onFileReview(file, 'needs_sme')}
                                      title="Needs SME"
                                    >
                                      <Brain size={14} weight={status === 'needs_sme' ? 'fill' : 'regular'} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => onFileReview(file, 'needs_rerun')}
                                      title="Needs Re-run"
                                    >
                                      <ArrowClockwise size={14} weight={status === 'needs_rerun' ? 'fill' : 'regular'} />
                                    </Button>
                                  </div>
                                )}
                                {status !== 'pending' && !onFileReview && (
                                  <div className="flex-shrink-0">
                                    {getReviewStatusBadge(status)}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
