import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ShieldSlash, 
  FileX, 
  Lock, 
  File,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ExcludedFile } from '@/lib/types'

interface ExcludedFilesProps {
  excludedFiles: ExcludedFile[]
  protectedZones: string[]
}

export function ExcludedFilesPanel({ excludedFiles, protectedZones }: ExcludedFilesProps) {
  const byConstraint = excludedFiles.filter(f => f.category === 'excluded_by_constraint')
  const intentionallySkipped = excludedFiles.filter(f => f.category === 'intentionally_skipped')
  const protectedZoneFiles = excludedFiles.filter(f => f.category === 'protected_zone')

  const getCategoryIcon = (category: ExcludedFile['category']) => {
    switch (category) {
      case 'excluded_by_constraint':
        return FileX
      case 'intentionally_skipped':
        return ShieldSlash
      case 'protected_zone':
        return Lock
      default:
        return File
    }
  }

  const getCategoryBadge = (category: ExcludedFile['category']) => {
    const configs = {
      excluded_by_constraint: { 
        label: 'Excluded by Constraint', 
        className: 'bg-muted text-muted-foreground' 
      },
      intentionally_skipped: { 
        label: 'Intentionally Skipped', 
        className: 'bg-secondary/20 text-secondary-foreground border-secondary/40' 
      },
      protected_zone: { 
        label: 'Protected Zone', 
        className: 'bg-destructive/20 text-destructive-foreground border-destructive/40' 
      },
    }
    const config = configs[category]
    return (
      <Badge variant="outline" className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    )
  }

  if (excludedFiles.length === 0 && protectedZones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldSlash size={20} weight="fill" className="text-muted-foreground" />
            What Was NOT Touched
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            All relevant files were processed. No exclusions or protected zones.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldSlash size={20} weight="fill" className="text-muted-foreground" />
          What Was NOT Touched
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldSlash size={16} />
          <span>The AI stayed in its lane and respected boundaries</span>
        </div>

        {protectedZones.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={16} weight="fill" className="text-destructive" />
                <h4 className="font-semibold text-sm">Protected Zones</h4>
                <Badge variant="outline" className="text-xs">
                  {protectedZones.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {protectedZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1.5 bg-destructive/5 rounded text-xs font-mono flex items-center gap-2"
                    >
                      <Lock size={12} weight="fill" className="text-destructive" />
                      {zone}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {byConstraint.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileX size={16} weight="fill" className="text-muted-foreground" />
                <h4 className="font-semibold text-sm">Excluded by Constraints</h4>
                <Badge variant="outline" className="text-xs">
                  {byConstraint.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {byConstraint.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-muted/50 rounded text-xs space-y-1"
                    >
                      <div className="font-mono font-medium">{file.path}</div>
                      <div className="text-muted-foreground">{file.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {intentionallySkipped.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldSlash size={16} weight="fill" className="text-secondary" />
                <h4 className="font-semibold text-sm">Intentionally Skipped</h4>
                <Badge variant="outline" className="text-xs">
                  {intentionallySkipped.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {intentionallySkipped.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-muted/50 rounded text-xs space-y-1"
                    >
                      <div className="font-mono font-medium">{file.path}</div>
                      <div className="text-muted-foreground">{file.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {protectedZoneFiles.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={16} weight="fill" className="text-destructive" />
                <h4 className="font-semibold text-sm">Files in Protected Zones</h4>
                <Badge variant="outline" className="text-xs">
                  {protectedZoneFiles.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {protectedZoneFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-destructive/5 rounded text-xs space-y-1"
                    >
                      <div className="font-mono font-medium flex items-center gap-2">
                        <Lock size={12} weight="fill" className="text-destructive" />
                        {file.path}
                      </div>
                      <div className="text-muted-foreground">{file.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
