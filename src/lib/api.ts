import type {
  Project,
  ProjectCreateRequest,
  ContextBundle,
  ContextBundleCreateRequest,
  ContextBundleCreateResponse,
  WorkPackage,
  Run,
  RunCreateRequest,
  RunCreateResponse,
  Artifact,
  ArtifactContentResponse,
  HealthResponse,
  Purpose,
  DataClass,
} from './types'
import { getAccessToken } from './config'
import { v4 as uuidv4 } from 'uuid'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  constructor(private baseUrl: string) {}

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    headers: Record<string, string> = {}
  ): Promise<T> {
    const token = getAccessToken()
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new ApiError(
        response.status,
        text || `HTTP ${response.status}: ${response.statusText}`,
        text
      )
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async health(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/health')
  }

  async listProjects(): Promise<{ items: Project[] }> {
    return this.fetch<{ items: Project[] }>('/projects')
  }

  async createProject(data: ProjectCreateRequest): Promise<Project> {
    return this.fetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createContextBundle(
    data: ContextBundleCreateRequest
  ): Promise<ContextBundleCreateResponse> {
    return this.fetch<ContextBundleCreateResponse>('/context-bundles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getContextBundle(bundleId: string): Promise<ContextBundle> {
    return this.fetch<ContextBundle>(`/context-bundles/${bundleId}`)
  }

  async finalizeContextBundle(bundleId: string): Promise<{ contextBundleId: string; status: string; hashes: Array<{ path: string; sha256: string }> }> {
    return this.fetch(`/context-bundles/${bundleId}:finalize`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async uploadFile(
    url: string,
    file: File,
    headers: Record<string, string> = {}
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers,
    })

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `Upload failed: ${response.statusText}`
      )
    }
  }

  async listWorkPackages(): Promise<{ items: WorkPackage[] }> {
    return this.fetch<{ items: WorkPackage[] }>('/work-packages')
  }

  async createRun(
    data: RunCreateRequest,
    projectId: string,
    purpose: Purpose,
    dataClass: DataClass
  ): Promise<RunCreateResponse> {
    const traceId = uuidv4()
    return this.fetch<RunCreateResponse>(
      '/runs',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      {
        'x-evadb-project-id': projectId,
        'x-evadb-trace-id': traceId,
        'x-evadb-purpose': purpose,
        'x-evadb-data-class': dataClass,
      }
    )
  }

  async getRun(runId: string): Promise<Run> {
    return this.fetch<Run>(`/runs/${runId}`)
  }

  async cancelRun(runId: string): Promise<{ runId: string; status: string }> {
    return this.fetch(`/runs/${runId}:cancel`, {
      method: 'POST',
    })
  }

  getRunEventsUrl(runId: string): string {
    return `${this.baseUrl}/runs/${runId}/events`
  }

  async listRunArtifacts(runId: string): Promise<{ items: Artifact[] }> {
    return this.fetch<{ items: Artifact[] }>(`/runs/${runId}/artifacts`)
  }

  async getArtifact(artifactId: string): Promise<Artifact> {
    return this.fetch<Artifact>(`/artifacts/${artifactId}`)
  }

  async getArtifactContent(artifactId: string): Promise<ArtifactContentResponse> {
    return this.fetch<ArtifactContentResponse>(`/artifacts/${artifactId}/content`)
  }
}
