import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Warning, 
  TestTube, 
  X,
} from '@phosphor-icons/react'

interface HunkExplanation {
  whatChanged: string
  whyNecessary: string
  watchOut: string[]
  howToTest: string[]
}

interface ExplainHunkPanelProps {
  hunkContent: string
  filePath: string
  onClose: () => void
  onExplain: (hunkContent: string, filePath: string) => Promise<HunkExplanation>
}

export function ExplainHunkPanel({
  hunkContent,
  filePath,
  onClose,
  onExplain,
}: ExplainHunkPanelProps) {
  const [explanation, setExplanation] = useState<HunkExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExplain = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await onExplain(hunkContent, filePath)
      setExplanation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate explanation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb size={20} weight="fill" className="text-accent" />
              Explain This Change
            </CardTitle>
            <CardDescription className="font-mono text-xs mt-1">
              {filePath}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!explanation && !isLoading && (
          <div className="text-center py-6">
            <Lightbulb size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered explanation of this code change
            </p>
            <Button onClick={handleExplain} className="gap-2">
              <Lightbulb size={16} />
              Generate Explanation
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing change...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleExplain} className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {explanation && (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10">What Changed</Badge>
                </h4>
                <p className="text-sm text-muted-foreground">{explanation.whatChanged}</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-accent/10">Why Necessary</Badge>
                </h4>
                <p className="text-sm text-muted-foreground">{explanation.whyNecessary}</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Warning size={16} weight="fill" className="text-warning" />
                  <Badge variant="outline" className="bg-warning/10">What to Watch Out For</Badge>
                </h4>
                {explanation.watchOut.length > 0 ? (
                  <ul className="space-y-1">
                    {explanation.watchOut.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific concerns identified</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TestTube size={16} weight="fill" className="text-success" />
                  <Badge variant="outline" className="bg-success/10">How to Test</Badge>
                </h4>
                {explanation.howToTest.length > 0 ? (
                  <ul className="space-y-1">
                    {explanation.howToTest.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific testing guidance</p>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
