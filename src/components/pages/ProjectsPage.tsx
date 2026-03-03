import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderOpen, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ProjectCreateRequest } from '@/lib/types'

export function ProjectsPage() {
  const { state, setActiveProject, api, t } = useApp()
  const [projects, setProjects] = useState<typeof state.activeProject[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProjectCreateRequest>({
    name: '',
    description: '',
    costCenter: '',
    owners: [],
  })

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await api.listProjects()
      setProjects(response.items)
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to load projects',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error(t.common.error, { description: 'Project name is required' })
      return
    }

    setLoading(true)
    try {
      const ownersArray = formData.owners && typeof formData.owners === 'string'
        ? (formData.owners as unknown as string).split(',').map(o => o.trim()).filter(Boolean)
        : []

      const project = await api.createProject({
        ...formData,
        owners: ownersArray,
      })
      
      toast.success(t.common.success, { description: `Project "${project.name}" created` })
      setDialogOpen(false)
      setFormData({ name: '', description: '', costCenter: '', owners: [] })
      loadProjects()
    } catch (error) {
      toast.error(t.common.error, {
        description: error instanceof Error ? error.message : 'Failed to create project',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProject = (project: typeof state.activeProject) => {
    setActiveProject(project)
    toast.success(t.common.success, { description: `Active project: ${project?.name}` })
  }

  if (!projects.length && !loading) {
    loadProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.projects.title}</h1>
          <p className="text-muted-foreground mt-2">
            {state.activeProject && (
              <span className="inline-flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="text-success" weight="fill" />
                  {t.projects.active}: {state.activeProject.name}
                </Badge>
              </span>
            )}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus />
              {t.projects.create}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.projects.create}</DialogTitle>
              <DialogDescription>
                Create a new project to organize your work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">{t.projects.name} *</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  placeholder="Customer Portal Modernization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">{t.projects.description}</Label>
                <Textarea
                  id="project-description"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Modernize legacy customer portal..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-cost-center">{t.projects.costCenter}</Label>
                <Input
                  id="project-cost-center"
                  value={formData.costCenter}
                  onChange={e => setFormData(d => ({ ...d, costCenter: e.target.value }))}
                  placeholder="IT-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-owners">{t.projects.owners}</Label>
                <Input
                  id="project-owners"
                  value={formData.owners?.join(', ') || ''}
                  onChange={e => setFormData(d => ({ ...d, owners: e.target.value.split(',').map(o => o.trim()) as never[] }))}
                  placeholder="john.doe@example.gc.ca, jane.smith@example.gc.ca"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {t.common.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && projects.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <FolderOpen size={64} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">{t.projects.noProjects}</h3>
              <p className="text-muted-foreground">{t.projects.noProjectsDesc}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card
              key={project?.projectId}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectProject(project)}
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1">{project?.name}</span>
                  {state.activeProject?.projectId === project?.projectId && (
                    <CheckCircle size={20} className="text-success flex-shrink-0" weight="fill" />
                  )}
                </CardTitle>
                {project?.description && (
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {project?.costCenter && (
                  <div className="text-sm">
                    <span className="font-medium">{t.projects.costCenter}:</span>{' '}
                    <span className="font-mono text-xs">{project.costCenter}</span>
                  </div>
                )}
                {project?.owners && project.owners.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Owners:</span> {project.owners.length}
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {t.projects.createdAt}: {new Date(project?.createdAtUtc || '').toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
