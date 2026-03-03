export type Language = 'en' | 'fr'

export type Purpose = 'reverse_engineer' | 'scaffold' | 'refactor' | 'tests' | 'docs' | 'learn'
export type DataClass = 'ULL' | 'PB'
export type Sensitivity = 'ULL' | 'PB'
export type BundleStatus = 'draft' | 'uploading' | 'sealed'
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled'
export type ArtifactType = 'patch' | 'zip' | 'markdown' | 'test_suite' | 'diagram' | 'trace_log'
export type ContentMode = 'signed_url' | 'inline_text'

export interface Project {
  projectId: string
  name: string
  description?: string
  costCenter?: string
  owners?: string[]
  createdAtUtc: string
}

export interface ProjectCreateRequest {
  name: string
  description?: string
  costCenter?: string
  owners?: string[]
}

export interface BundleInput {
  type: 'file' | 'text'
  path?: string
  name?: string
  content?: string
  contentType?: string
}

export interface BundleFileHash {
  path: string
  sha256: string
}

export interface ContextBundleManifest {
  inputs?: BundleInput[]
  hashes?: BundleFileHash[]
}

export interface ContextBundle {
  contextBundleId: string
  projectId: string
  name: string
  description?: string
  sensitivity: Sensitivity
  status: BundleStatus
  manifest?: ContextBundleManifest
  createdAtUtc: string
  sealedAtUtc?: string
}

export interface ContextBundleCreateRequest {
  projectId: string
  name: string
  description?: string
  sensitivity: Sensitivity
  inputs: BundleInput[]
}

export interface UploadFile {
  path: string
  putUrl: string
  headers?: Record<string, string>
}

export interface UploadPlan {
  mode: 'sas' | 'direct'
  files: UploadFile[]
}

export interface ContextBundleCreateResponse {
  contextBundleId: string
  upload: UploadPlan
}

export interface WorkPackage {
  workPackageId: string
  name: string
  description?: string
  purposes: Purpose[]
  parametersSchema?: Record<string, unknown>
}

export interface RunCreateRequest {
  projectId: string
  workPackageId: string
  contextBundleId: string
  parameters?: Record<string, unknown>
}

export interface RunProgress {
  phase?: string
  percent?: number
  currentAgent?: string
}

export interface RunCosts {
  tokensIn?: number
  tokensOut?: number
  estimatedCad?: number
}

export interface Run {
  runId: string
  projectId: string
  workPackageId?: string
  contextBundleId?: string
  status: RunStatus
  progress?: RunProgress
  costs?: RunCosts
  createdAtUtc: string
  finishedAtUtc?: string
  summary?: string
  warnings?: string[]
  errors?: string[]
}

export interface RunCreateResponse {
  runId: string
  status: RunStatus
  streamUrl: string
}

export interface Artifact {
  artifactId: string
  runId: string
  type: ArtifactType
  name: string
  contentType?: string
  bytes?: number
  sha256: string
  createdAtUtc: string
}

export interface ArtifactContentResponse {
  mode: ContentMode
  url?: string
  text?: string
}

export interface HealthResponse {
  status: 'ok'
  build: string
  timeUtc: string
}

export interface AppSettings {
  language: Language
  baseUrl: string
  demoMode: boolean
}

export interface AppState {
  activeProject: Project | null
  recentBundles: ContextBundle[]
  recentRuns: Run[]
  settings: AppSettings
}

export interface RunEvent {
  type: string
  data: Record<string, unknown>
  timestamp?: string
}

export type ReviewStatus = 'ok' | 'needs_sme' | 'needs_rerun' | 'pending'
export type ChangeRisk = 'low' | 'medium' | 'high'
export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface AgentRationale {
  agentName: string
  inputSignals: string[]
  assumptions: string[]
  confidenceLevel: ConfidenceLevel
  reasoning: string
}

export interface FileProvenance {
  generatedBy: string
  modelProfile: string
  contextBundleHash: string
  runId: string
  timestamp: string
}

export interface FileReviewMetadata {
  reviewStatus: ReviewStatus
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  changeRisk: ChangeRisk
  isLargeDiff: boolean
  isCoreLayer: boolean
  hasSMEFlag: boolean
  hasTests: boolean
  testFiles?: string[]
}

export interface ReviewChecklist {
  businessLogicInferred: boolean | null
  smeValidationRequired: boolean
  testsGenerated: boolean
  securityReviewed: boolean | null
  performanceConsidered: boolean | null
}

export interface ExcludedFile {
  path: string
  reason: string
  category: 'excluded_by_constraint' | 'intentionally_skipped' | 'protected_zone'
}

export interface SemanticGroup {
  name: string
  category: 'controller' | 'dto' | 'service' | 'test' | 'doc' | 'config' | 'other'
  files: string[]
  description?: string
}
