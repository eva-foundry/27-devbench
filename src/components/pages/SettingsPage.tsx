import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Globe, CheckCircle, XCircle, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { state, updateSettings, api, t } = useApp()
  const [formData, setFormData] = useState(state.settings)
  const [healthStatus, setHealthStatus] = useState<{ status: string; build?: string; error?: string } | null>(null)
  const [checking, setChecking] = useState(false)

  const handleSave = () => {
    updateSettings(formData)
    toast.success(t.common.success, { description: 'Settings saved' })
  }

  const handleCheckHealth = async () => {
    setChecking(true)
    try {
      const response = await api.health()
      setHealthStatus({ status: 'ok', build: response.build })
      toast.success(t.common.success, { description: 'API is healthy' })
    } catch (error) {
      setHealthStatus({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      toast.error(t.common.error, { description: 'API health check failed' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground mt-2">
          Configure application preferences and API connection
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            {t.settings.language}
          </CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={formData.language === 'en' ? 'default' : 'outline'}
              onClick={() => setFormData(d => ({ ...d, language: 'en' }))}
            >
              English
            </Button>
            <Button
              variant={formData.language === 'fr' ? 'default' : 'outline'}
              onClick={() => setFormData(d => ({ ...d, language: 'fr' }))}
            >
              Français
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.apiConfiguration}</CardTitle>
          <CardDescription>Configure APIM endpoint and demo mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-url">{t.settings.baseUrl}</Label>
            <Input
              id="base-url"
              value={formData.baseUrl}
              onChange={e => setFormData(d => ({ ...d, baseUrl: e.target.value }))}
              placeholder="/devbench/v1"
              className="font-mono text-sm"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="demo-mode">{t.settings.demoMode}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.demoModeDesc}
              </p>
            </div>
            <Switch
              id="demo-mode"
              checked={formData.demoMode}
              onCheckedChange={checked => setFormData(d => ({ ...d, demoMode: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.health}</CardTitle>
          <CardDescription>Test API connectivity and health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckHealth} disabled={checking} className="w-full gap-2">
            <ArrowClockwise size={18} className={checking ? 'animate-spin' : ''} />
            {t.settings.checkHealth}
          </Button>

          {healthStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {healthStatus.status === 'ok' ? (
                  <>
                    <CheckCircle size={20} className="text-success" weight="fill" />
                    <span className="font-medium text-success">Healthy</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-destructive" weight="fill" />
                    <span className="font-medium text-destructive">Error</span>
                  </>
                )}
              </div>

              {healthStatus.build && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Build:</span>{' '}
                  <Badge variant="outline" className="font-mono text-xs">
                    {healthStatus.build}
                  </Badge>
                </div>
              )}

              {healthStatus.error && (
                <div className="text-sm bg-destructive/10 p-3 rounded-lg">
                  <span className="font-medium">{t.settings.lastError}:</span>
                  <pre className="mt-1 text-xs font-mono whitespace-pre-wrap">
                    {healthStatus.error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          {t.settings.save}
        </Button>
      </div>
    </div>
  )
}
