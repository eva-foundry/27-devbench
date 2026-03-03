import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Package, Lock, Files, UploadSimple, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { BundleInput, Sensitivity } from '@/lib/types'

export function ContextBundlesPage() {
  const { state, addRecentBundle, api, t } = useApp()
  const [bundles, setBundles] = useState<Array<{contextBundleId: string; name: string; status: string; sensitivity: string; createdAtUtc: string}>>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sensitivity: 'ULL' as Sensitivity,
    inputs: [] as BundleInput[],
  })

  const loadBundles = async () => {
    setLoading(true)
    try {
      const mockBundles = state.recentBundles
      setBundles(mockBundles as never[])
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to load bundles',
      })
    } finally {
      setLoading(false)
    }
  }

  const addTextConstraint = () => {
    setFormData(d => ({
      ...d,
      inputs: [...d.inputs, { type: 'text', name: '', content: '' }],
    }))
  }

  const addFileInput = () => {
    setFormData(d => ({
      ...d,
      inputs: [...d.inputs, { type: 'file', path: '', contentType: 'text/plain' }],
    }))
  }

  const removeInput = (index: number) => {
    setFormData(d => ({
      ...d,
      inputs: d.inputs.filter((_, i) => i !== index),
    }))
  }

  const updateInput = (index: number, updates: Partial<BundleInput>) => {
    setFormData(d => ({
      ...d,
      inputs: d.inputs.map((input, i) => i === index ? { ...input, ...updates } : input),
    }))
  }

  const handleCreate = async () => {
    if (!formData.name || !state.activeProject) {
      toast.error(t.common.error, { description: 'Name and active project required' })
      return
    }

    setLoading(true)
    setUploading(true)
    try {
      const response = await api.createContextBundle({
        projectId: state.activeProject.projectId,
        name: formData.name,
        description: formData.description,
        sensitivity: formData.sensitivity,
        inputs: formData.inputs,
      })

      const fileInputs = formData.inputs.filter(i => i.type === 'file')
      if (fileInputs.length > 0 && response.upload.files.length > 0) {
        for (let i = 0; i < response.upload.files.length; i++) {
          setUploadProgress(((i + 1) / response.upload.files.length) * 100)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      await api.finalizeContextBundle(response.contextBundleId)
      const bundle = await api.getContextBundle(response.contextBundleId)
      addRecentBundle(bundle)

      toast.success(t.common.success, { description: `Bundle "${bundle.name}" created and sealed` })
      setDialogOpen(false)
      setFormData({ name: '', description: '', sensitivity: 'ULL', inputs: [] })
      setUploadProgress(0)
      loadBundles()
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to create bundle',
      })
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (!bundles.length && !loading) {
    loadBundles()
  }

  if (!state.activeProject) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <Package size={64} className="mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">{t.bundles.requiresProject}</h3>
            <p className="text-muted-foreground">Select a project first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t.bundles.title}</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus />
              {t.bundles.create}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.bundles.create}</DialogTitle>
              <DialogDescription>
                Package code context for AI processing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-name">{t.bundles.name} *</Label>
                <Input
                  id="bundle-name"
                  value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  placeholder="Legacy Portal Codebase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-description">{t.bundles.description}</Label>
                <Textarea
                  id="bundle-description"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Complete ASP.NET MVC codebase"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.bundles.sensitivity}</Label>
                <Select
                  value={formData.sensitivity}
                  onValueChange={v => setFormData(d => ({ ...d, sensitivity: v as Sensitivity }))}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t.bundles.inputs}</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addTextConstraint}>
                      <Plus size={14} className="mr-1" />
                      {t.bundles.addTextConstraint}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addFileInput}>
                      <Files size={14} className="mr-1" />
                      {t.bundles.addFile}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.inputs.map((input, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{input.type}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeInput(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>

                      {input.type === 'text' ? (
                        <>
                          <Input
                            placeholder="Constraint name"
                            value={input.name || ''}
                            onChange={e => updateInput(index, { name: e.target.value })}
                          />
                          <Textarea
                            placeholder="Content"
                            value={input.content || ''}
                            onChange={e => updateInput(index, { content: e.target.value })}
                            rows={2}
                          />
                        </>
                      ) : (
                        <Input
                          placeholder="File path (e.g., src/controllers/HomeController.cs)"
                          value={input.path || ''}
                          onChange={e => updateInput(index, { path: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.bundles.uploadProgress}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreate} disabled={loading || uploading}>
                <UploadSimple className="mr-2" />
                {t.bundles.finalize}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && bundles.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Package size={64} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">{t.bundles.noBundles}</h3>
              <p className="text-muted-foreground">{t.bundles.noBundlesDesc}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bundles.map(bundle => (
            <Card key={bundle.contextBundleId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="line-clamp-1">{bundle.name}</span>
                  {bundle.status === 'sealed' && (
                    <Lock size={18} className="text-success" weight="fill" />
                  )}
                </CardTitle>
                <CardDescription className="flex gap-2 mt-2">
                  <Badge variant={bundle.status === 'sealed' ? 'default' : 'secondary'}>
                    {bundle.status}
                  </Badge>
                  <Badge variant={bundle.sensitivity === 'PB' ? 'destructive' : 'outline'}>
                    {bundle.sensitivity}
                  </Badge>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
