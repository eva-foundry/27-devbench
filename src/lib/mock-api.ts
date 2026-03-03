/**
 * Mock API Client for EVA DevBench
 * 
 * This file provides realistic mock data for development and demo mode, including:
 * - Agent rationale data showing AI reasoning per file
 * - File provenance tracking generation metadata
 * - Review metadata with risk analysis and SME flags
 * - Excluded files showing what the AI intentionally didn't touch
 * - Semantic grouping of files by architectural layer
 * 
 * The mock data is based on actual run history from legacy modernization projects
 * and represents realistic patterns from ASP.NET MVC → TypeScript/Express conversions.
 */

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
  AgentRationale,
  FileProvenance,
  FileReviewMetadata,
  ExcludedFile,
  SemanticGroup,
} from './types'
import { v4 as uuidv4 } from 'uuid'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Agent Rationale Mock Data
 * Maps file paths to detailed AI reasoning, showing:
 * - Which agent made the changes
 * - Input signals used for decision-making
 * - Explicit assumptions made
 * - Confidence level (low/medium/high)
 * - Natural language reasoning
 */
export const mockAgentRationales: Record<string, AgentRationale> = {
  'src/controllers/UserController.ts': {
    agentName: 'Scaffolder',
    inputSignals: [
      'Controllers/HomeController.cs (legacy ASP.NET MVC pattern)',
      'Constraint: "Target .NET MVC 5" → TypeScript/Express equivalent',
      'Pattern: RESTful API with error handling',
      'UserService interface detected in context bundle'
    ],
    assumptions: [
      'Express.js is the target framework (inferred from project structure)',
      'NextFunction error handling pattern is preferred over try-catch response',
      'UserService methods return Promises (async/await pattern)',
      'ValidationError and NotFoundError are custom error classes in the codebase'
    ],
    confidenceLevel: 'high',
    reasoning: 'Converted ASP.NET MVC controller pattern to Express.js with TypeScript best practices. Added proper async/await handling, validation guards, structured error propagation via next(), and standardized response format { data, success }. The service layer separation follows the original architecture.'
  },
  'src/services/UserService.ts': {
    agentName: 'Scaffolder',
    inputSignals: [
      'UserController.ts references UserService',
      'Database abstraction pattern detected in context bundle',
      'No existing UserService found in legacy code',
      'Constraint: "Do not invent logic" → minimal business rules'
    ],
    assumptions: [
      'Database interface follows repository pattern with findOne/create methods',
      'User model includes email as unique identifier',
      'Password sanitization is required for user objects',
      'ID generation should be deterministic for testing'
    ],
    confidenceLevel: 'medium',
    reasoning: 'Created new service layer to match controller expectations. Since no legacy service existed, implemented minimal CRUD operations following detected patterns. Email uniqueness check and password sanitization are defensive measures. SME should validate business rules for user creation workflow.'
  },
  'tests/UserController.test.ts': {
    agentName: 'Tester',
    inputSignals: [
      'UserController.ts public methods: getUser, createUser',
      'Jest test framework detected in existing test files',
      'Mock pattern: jest.fn() for dependencies',
      'Controller signature includes NextFunction parameter'
    ],
    assumptions: [
      'Unit tests should mock UserService, not integration test',
      'Response format validation is critical: { data, success }',
      'NextFunction should be tested for error propagation',
      'Status codes should be explicitly asserted'
    ],
    confidenceLevel: 'high',
    reasoning: 'Generated unit tests covering success paths for both controller methods. Updated existing test to match new signature with NextFunction and standardized response format. Tests validate status codes, response structure, and service method calls.'
  },
  'src/errors/ValidationError.ts': {
    agentName: 'Refactorer',
    inputSignals: [
      'UserController.ts throws ValidationError',
      'Express error handling middleware pattern',
      'No existing ValidationError in context bundle',
      'Standard HTTP 400 status for validation errors'
    ],
    assumptions: [
      'Custom error classes extend Error with statusCode property',
      'Error middleware will use statusCode to determine HTTP response',
      'ValidationError is distinct from NotFoundError (404)',
      'Error messages should be user-facing'
    ],
    confidenceLevel: 'high',
    reasoning: 'Created custom ValidationError class to support semantic error handling. Extends Error with statusCode property for Express middleware. This pattern allows controllers to throw domain-specific errors while middleware handles HTTP concerns.'
  },
  'src/errors/NotFoundError.ts': {
    agentName: 'Refactorer',
    inputSignals: [
      'UserService.ts throws NotFoundError',
      'RESTful convention: 404 for missing resources',
      'Parallel to ValidationError pattern',
      'Database queries may return null'
    ],
    assumptions: [
      'NotFoundError uses 404 status code',
      'Error message includes resource identifier for debugging',
      'Middleware will catch and format for JSON response',
      'Frontend expects consistent error structure'
    ],
    confidenceLevel: 'high',
    reasoning: 'Created NotFoundError to handle missing resource scenarios. Consistent with ValidationError pattern. Used by service layer when database lookups fail, allowing controllers to remain clean and focused on orchestration.'
  },
  'src/utils/logger.ts': {
    agentName: 'Scaffolder',
    inputSignals: [
      'UserController.ts imports logger utility',
      'Info-level logging for audit trail',
      'No existing logger implementation in context bundle',
      'Production apps require structured logging'
    ],
    assumptions: [
      'Console-based logging is acceptable for MVP',
      'Logger should support multiple levels (info, warn, error)',
      'Timestamp and level prefixes improve readability',
      'Future: logger may be swapped for Winston/Pino'
    ],
    confidenceLevel: 'medium',
    reasoning: 'Implemented minimal structured logger to satisfy controller imports. Uses console with formatted output. Marked as placeholder for production logger. SME should determine if this meets audit/compliance requirements or if structured logging service is needed.'
  },
  'src/types/User.ts': {
    agentName: 'ReverseEngineer',
    inputSignals: [
      'UserService references User and UserCreateInput types',
      'Database schema hints from service methods',
      'Email, name, role fields used in controller',
      'Status and emailVerified suggest user lifecycle management'
    ],
    assumptions: [
      'User type includes metadata: createdAt, updatedAt, status',
      'UserCreateInput is subset for creation (no id, timestamps)',
      'Role field is optional with default value',
      'Password field exists but should be filtered in responses'
    ],
    confidenceLevel: 'medium',
    reasoning: 'Reverse-engineered User types from usage patterns in controller and service. Inferred lifecycle fields based on common user management patterns. SME should validate against actual database schema and business requirements.'
  },
  'src/database/Database.ts': {
    agentName: 'Scaffolder',
    inputSignals: [
      'UserService imports Database interface',
      'Repository pattern: findOne, create methods',
      'No existing Database implementation found',
      'TypeScript interface allows test mocking'
    ],
    assumptions: [
      'Database interface abstracts persistence layer',
      'Each entity (users) has repository-like methods',
      'Actual implementation (Postgres, MongoDB) is separate',
      'Interface enables dependency injection and testing'
    ],
    confidenceLevel: 'low',
    reasoning: 'Created Database interface stub to resolve TypeScript errors. This is a placeholder - actual database implementation missing from context bundle. SME MUST provide database layer implementation or this code will not run. Consider this a contract definition only.'
  }
}

/**
 * File Provenance Mock Data
 * Tracks the generation metadata for each file, providing full audit trail:
 * - Which agent generated the file
 * - Model profile used (e.g., gpt-4o-code-gen, gpt-4o-test-gen)
 * - Context bundle hash for traceability
 * - Run ID linking back to the execution
 * - Timestamp of generation
 */
export const mockFileProvenance: Record<string, FileProvenance> = {
  'src/controllers/UserController.ts': {
    generatedBy: 'Scaffolder',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:23:45Z'
  },
  'src/services/UserService.ts': {
    generatedBy: 'Scaffolder',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:24:12Z'
  },
  'tests/UserController.test.ts': {
    generatedBy: 'Tester',
    modelProfile: 'gpt-4o-test-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:25:33Z'
  },
  'src/errors/ValidationError.ts': {
    generatedBy: 'Refactorer',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:23:58Z'
  },
  'src/errors/NotFoundError.ts': {
    generatedBy: 'Refactorer',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:24:01Z'
  },
  'src/utils/logger.ts': {
    generatedBy: 'Scaffolder',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:23:52Z'
  },
  'src/types/User.ts': {
    generatedBy: 'ReverseEngineer',
    modelProfile: 'gpt-4o-analysis',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:22:18Z'
  },
  'src/database/Database.ts': {
    generatedBy: 'Scaffolder',
    modelProfile: 'gpt-4o-code-gen',
    contextBundleHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
    runId: '770e8400-e29b-41d4-a716-446655440001',
    timestamp: '2024-02-10T14:23:15Z'
  }
}

/**
 * File Review Metadata Mock Data
 * Provides governance-grade review information for each file:
 * - Review status (ok, needs_sme, needs_rerun, pending)
 * - Change risk level (low, medium, high)
 * - Large diff indicator (>100 lines)
 * - Core layer flag (touches critical systems)
 * - SME validation flag (requires expert review)
 * - Test coverage indicator
 * - Optional review notes
 */
export const mockFileReviewMetadata: Record<string, FileReviewMetadata> = {
  'src/controllers/UserController.ts': {
    reviewStatus: 'ok',
    changeRisk: 'medium',
    isLargeDiff: false,
    isCoreLayer: true,
    hasSMEFlag: false,
    hasTests: true,
    testFiles: ['tests/UserController.test.ts']
  },
  'src/services/UserService.ts': {
    reviewStatus: 'needs_sme',
    changeRisk: 'high',
    isLargeDiff: false,
    isCoreLayer: true,
    hasSMEFlag: true,
    hasTests: false,
    reviewNotes: 'Business logic validation required - email uniqueness rules and user lifecycle'
  },
  'tests/UserController.test.ts': {
    reviewStatus: 'ok',
    changeRisk: 'low',
    isLargeDiff: false,
    isCoreLayer: false,
    hasSMEFlag: false,
    hasTests: false
  },
  'src/errors/ValidationError.ts': {
    reviewStatus: 'ok',
    changeRisk: 'low',
    isLargeDiff: false,
    isCoreLayer: false,
    hasSMEFlag: false,
    hasTests: false
  },
  'src/errors/NotFoundError.ts': {
    reviewStatus: 'ok',
    changeRisk: 'low',
    isLargeDiff: false,
    isCoreLayer: false,
    hasSMEFlag: false,
    hasTests: false
  },
  'src/utils/logger.ts': {
    reviewStatus: 'needs_sme',
    changeRisk: 'medium',
    isLargeDiff: false,
    isCoreLayer: false,
    hasSMEFlag: true,
    hasTests: false,
    reviewNotes: 'Placeholder logger - determine if meets audit/compliance requirements'
  },
  'src/types/User.ts': {
    reviewStatus: 'needs_sme',
    changeRisk: 'medium',
    isLargeDiff: false,
    isCoreLayer: true,
    hasSMEFlag: true,
    hasTests: false,
    reviewNotes: 'Validate against actual database schema and business requirements'
  },
  'src/database/Database.ts': {
    reviewStatus: 'needs_rerun',
    changeRisk: 'high',
    isLargeDiff: false,
    isCoreLayer: true,
    hasSMEFlag: true,
    hasTests: false,
    reviewNotes: 'CRITICAL: Stub only - actual database implementation required'
  }
}

/**
 * Excluded Files Mock Data
 * Shows files that the AI intentionally did NOT touch, building trust by demonstrating
 * the AI "stayed in its lane" and respected boundaries:
 * - Protected zones: Security-critical files (auth, secrets, config)
 * - Excluded by constraint: Files filtered by user-defined rules
 * - Intentionally skipped: Files detected but deemed out of scope
 */
export const mockExcludedFiles: ExcludedFile[] = [
  {
    path: 'src/auth/TokenValidator.ts',
    reason: 'Contains security-critical JWT validation logic',
    category: 'protected_zone'
  },
  {
    path: 'src/config/secrets.ts',
    reason: 'Configuration file with sensitive credential management',
    category: 'protected_zone'
  },
  {
    path: 'src/middleware/AuthMiddleware.ts',
    reason: 'Authentication layer explicitly excluded by constraint',
    category: 'excluded_by_constraint'
  },
  {
    path: 'node_modules/**',
    reason: 'Third-party dependencies',
    category: 'intentionally_skipped'
  },
  {
    path: 'dist/**',
    reason: 'Build artifacts',
    category: 'intentionally_skipped'
  },
  {
    path: 'src/legacy/OldUserManager.ts',
    reason: 'Deprecated module not referenced in scope',
    category: 'intentionally_skipped'
  },
  {
    path: 'src/admin/AdminController.ts',
    reason: 'Admin functionality out of scope for current work package',
    category: 'excluded_by_constraint'
  }
]

/**
 * Semantic Groups Mock Data
 * Organizes changed files by architectural layer rather than directory structure,
 * helping reviewers understand the shape of the change quickly:
 * - Controllers: API endpoints and route handlers
 * - Services: Business logic and data access
 * - DTOs: Data transfer objects and type definitions
 * - Tests: Test files and specs
 * - Docs: Documentation files
 * - Config: Configuration and infrastructure
 */
export const mockSemanticGroups: SemanticGroup[] = [
  {
    name: 'Controller Changes',
    category: 'controller',
    files: ['src/controllers/UserController.ts'],
    description: 'HTTP request handlers and routing logic'
  },
  {
    name: 'Service Layer',
    category: 'service',
    files: ['src/services/UserService.ts'],
    description: 'Business logic and data access'
  },
  {
    name: 'Error Handling',
    category: 'other',
    files: ['src/errors/ValidationError.ts', 'src/errors/NotFoundError.ts'],
    description: 'Custom error classes for semantic error handling'
  },
  {
    name: 'Type Definitions',
    category: 'dto',
    files: ['src/types/User.ts'],
    description: 'TypeScript interfaces and type definitions'
  },
  {
    name: 'Tests Added',
    category: 'test',
    files: ['tests/UserController.test.ts'],
    description: 'Unit and integration tests'
  },
  {
    name: 'Infrastructure',
    category: 'config',
    files: ['src/utils/logger.ts', 'src/database/Database.ts'],
    description: 'Utilities and infrastructure abstractions'
  }
]

export class MockApiClient {
  private projects: Project[] = [
    {
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Customer Portal Modernization',
      description: 'Modernize legacy customer portal to React',
      costCenter: 'IT-2024-001',
      owners: ['john.doe@example.gc.ca', 'jane.smith@example.gc.ca'],
      createdAtUtc: '2024-01-15T10:30:00Z',
    },
    {
      projectId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Payment Gateway Integration',
      description: 'Integrate new payment gateway API',
      costCenter: 'IT-2024-002',
      owners: ['alice.johnson@example.gc.ca'],
      createdAtUtc: '2024-02-01T14:20:00Z',
    },
  ]

  private bundles: ContextBundle[] = [
    {
      contextBundleId: '660e8400-e29b-41d4-a716-446655440001',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Legacy Portal Codebase',
      description: 'Complete ASP.NET MVC codebase',
      sensitivity: 'ULL',
      status: 'sealed',
      manifest: {
        inputs: [
          { type: 'text', name: 'Target Framework', content: 'Target .NET MVC 5' },
          { type: 'file', path: 'Controllers/HomeController.cs' },
          { type: 'file', path: 'Views/Home/Index.cshtml' },
        ],
        hashes: [
          { path: 'Controllers/HomeController.cs', sha256: 'a1b2c3d4e5f6' },
          { path: 'Views/Home/Index.cshtml', sha256: 'f6e5d4c3b2a1' },
        ],
      },
      createdAtUtc: '2024-02-10T09:00:00Z',
      sealedAtUtc: '2024-02-10T09:15:00Z',
    },
  ]

  private workPackages: WorkPackage[] = [
    {
      workPackageId: 'reverse-engineer',
      name: 'Reverse Engineer Workflow',
      description: 'Analyze legacy code and document workflows, data flows, and business logic',
      purposes: ['reverse_engineer', 'learn'],
    },
    {
      workPackageId: 'scaffold',
      name: 'Scaffold Feature',
      description: 'Generate boilerplate code for new features based on patterns',
      purposes: ['scaffold'],
    },
    {
      workPackageId: 'refactor',
      name: 'Refactor Module',
      description: 'Improve code structure, remove duplication, apply best practices',
      purposes: ['refactor'],
    },
    {
      workPackageId: 'tests',
      name: 'Generate Tests',
      description: 'Create comprehensive unit and integration tests',
      purposes: ['tests'],
    },
    {
      workPackageId: 'docs',
      name: 'Generate Documentation',
      description: 'Produce technical documentation, API docs, and user guides',
      purposes: ['docs'],
    },
  ]

  private runs: Run[] = []
  private artifacts: Artifact[] = []

  async health(): Promise<HealthResponse> {
    await delay(200)
    return {
      status: 'ok',
      build: 'demo-v1.0.0',
      timeUtc: new Date().toISOString(),
    }
  }

  async listProjects(): Promise<{ items: Project[] }> {
    await delay(300)
    return { items: this.projects }
  }

  async createProject(data: ProjectCreateRequest): Promise<Project> {
    await delay(400)
    const project: Project = {
      projectId: uuidv4(),
      ...data,
      createdAtUtc: new Date().toISOString(),
    }
    this.projects.push(project)
    return project
  }

  async createContextBundle(
    data: ContextBundleCreateRequest
  ): Promise<ContextBundleCreateResponse> {
    await delay(400)
    const bundleId = uuidv4()
    
    const bundle: ContextBundle = {
      contextBundleId: bundleId,
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      sensitivity: data.sensitivity,
      status: 'draft',
      manifest: { inputs: data.inputs },
      createdAtUtc: new Date().toISOString(),
    }
    this.bundles.push(bundle)

    const uploadFiles = data.inputs
      .filter(i => i.type === 'file')
      .map(i => ({
        path: i.path || '',
        putUrl: `https://mock-storage.example.com/upload/${bundleId}/${i.path}`,
        headers: { 'x-ms-blob-type': 'BlockBlob' },
      }))

    return {
      contextBundleId: bundleId,
      upload: {
        mode: 'sas',
        files: uploadFiles,
      },
    }
  }

  async getContextBundle(bundleId: string): Promise<ContextBundle> {
    await delay(200)
    const bundle = this.bundles.find(b => b.contextBundleId === bundleId)
    if (!bundle) throw new Error('Bundle not found')
    return bundle
  }

  async finalizeContextBundle(bundleId: string): Promise<{ contextBundleId: string; status: string; hashes: Array<{ path: string; sha256: string }> }> {
    await delay(600)
    const bundle = this.bundles.find(b => b.contextBundleId === bundleId)
    if (!bundle) throw new Error('Bundle not found')
    
    bundle.status = 'sealed'
    bundle.sealedAtUtc = new Date().toISOString()
    
    const hashes = bundle.manifest?.inputs
      ?.filter(i => i.type === 'file')
      .map(i => ({
        path: i.path || '',
        sha256: Math.random().toString(36).substring(2, 15),
      })) || []
    
    if (bundle.manifest) {
      bundle.manifest.hashes = hashes
    }

    return {
      contextBundleId: bundleId,
      status: 'sealed',
      hashes,
    }
  }

  async uploadFile(
    url: string,
    file: File,
    headers: Record<string, string> = {}
  ): Promise<void> {
    await delay(1000)
  }

  async listWorkPackages(): Promise<{ items: WorkPackage[] }> {
    await delay(200)
    return { items: this.workPackages }
  }

  async createRun(
    data: RunCreateRequest,
    projectId: string,
    purpose: Purpose,
    dataClass: DataClass
  ): Promise<RunCreateResponse> {
    await delay(400)
    const runId = uuidv4()
    
    const run: Run = {
      runId,
      projectId: data.projectId,
      workPackageId: data.workPackageId,
      contextBundleId: data.contextBundleId,
      status: 'running',
      progress: { phase: 'Initializing', percent: 0 },
      costs: { tokensIn: 0, tokensOut: 0, estimatedCad: 0 },
      createdAtUtc: new Date().toISOString(),
    }
    this.runs.push(run)

    setTimeout(() => this.simulateRunProgress(runId), 2000)

    return {
      runId,
      status: 'running',
      streamUrl: `/runs/${runId}/events`,
    }
  }

  private async simulateRunProgress(runId: string) {
    const run = this.runs.find(r => r.runId === runId)
    if (!run) return

    const phases = [
      { phase: 'Planning', percent: 20, agent: 'Planner' },
      { phase: 'Analysis', percent: 40, agent: 'ReverseEngineer' },
      { phase: 'Generation', percent: 60, agent: 'Scaffolder' },
      { phase: 'Testing', percent: 80, agent: 'Tester' },
      { phase: 'Review', percent: 95, agent: 'Reviewer' },
    ]

    for (const phase of phases) {
      await delay(3000)
      run.progress = { ...phase, currentAgent: phase.agent }
      run.costs = {
        tokensIn: Math.floor(Math.random() * 10000),
        tokensOut: Math.floor(Math.random() * 5000),
        estimatedCad: Math.random() * 5,
      }
    }

    await delay(2000)
    run.status = 'completed'
    run.finishedAtUtc = new Date().toISOString()
    run.summary = 'Successfully completed analysis and generated artifacts'

    const patchArtifact: Artifact = {
      artifactId: uuidv4(),
      runId,
      type: 'patch',
      name: 'refactored-code.patch',
      contentType: 'text/plain',
      bytes: 15234,
      sha256: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
      createdAtUtc: new Date().toISOString(),
    }
    this.artifacts.push(patchArtifact)

    const markdownArtifact: Artifact = {
      artifactId: uuidv4(),
      runId,
      type: 'markdown',
      name: 'architecture-docs.md',
      contentType: 'text/markdown',
      bytes: 8432,
      sha256: 'b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      createdAtUtc: new Date().toISOString(),
    }
    this.artifacts.push(markdownArtifact)

    const testArtifact: Artifact = {
      artifactId: uuidv4(),
      runId,
      type: 'test_suite',
      name: 'user-controller-tests.ts',
      contentType: 'text/typescript',
      bytes: 5621,
      sha256: 'c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      createdAtUtc: new Date().toISOString(),
    }
    this.artifacts.push(testArtifact)
  }

  async getRun(runId: string): Promise<Run> {
    await delay(200)
    const run = this.runs.find(r => r.runId === runId)
    if (!run) throw new Error('Run not found')
    return run
  }

  async cancelRun(runId: string): Promise<{ runId: string; status: string }> {
    await delay(300)
    const run = this.runs.find(r => r.runId === runId)
    if (!run) throw new Error('Run not found')
    run.status = 'canceled'
    return { runId, status: 'canceled' }
  }

  getRunEventsUrl(runId: string): string {
    return `/mock/runs/${runId}/events`
  }

  async listRunArtifacts(runId: string): Promise<{ items: Artifact[] }> {
    await delay(200)
    return { items: this.artifacts.filter(a => a.runId === runId) }
  }

  async getArtifact(artifactId: string): Promise<Artifact> {
    await delay(200)
    const artifact = this.artifacts.find(a => a.artifactId === artifactId)
    if (!artifact) throw new Error('Artifact not found')
    return artifact
  }

  async getArtifactContent(artifactId: string): Promise<ArtifactContentResponse> {
    await delay(300)
    const artifact = this.artifacts.find(a => a.artifactId === artifactId)
    if (!artifact) throw new Error('Artifact not found')

    if (artifact.type === 'patch') {
      return {
        mode: 'inline_text',
        text: `diff --git a/src/controllers/UserController.ts b/src/controllers/UserController.ts
index a1b2c3d..e4f5g6h 100644
--- a/src/controllers/UserController.ts
+++ b/src/controllers/UserController.ts
@@ -1,15 +1,23 @@
-import { Request, Response } from 'express';
-import { UserService } from '../services/UserService';
+import { Request, Response, NextFunction } from 'express';
+import { UserService } from '../services/UserService';
+import { ValidationError } from '../errors/ValidationError';
+import { logger } from '../utils/logger';
 
 export class UserController {
-  constructor(private userService: UserService) {}
+  constructor(
+    private readonly userService: UserService
+  ) {}
 
-  async getUser(req: Request, res: Response) {
+  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.params.id;
-      const user = await this.userService.findById(userId);
-      res.json(user);
+      
+      if (!userId) {
+        throw new ValidationError('User ID is required');
+      }
+      
+      const user = await this.userService.findById(userId);
+      logger.info(\`User retrieved: \${userId}\`);
+      res.status(200).json({ data: user, success: true });
     } catch (error) {
-      res.status(500).json({ error: 'Internal server error' });
+      next(error);
     }
   }
@@ -25,12 +33,20 @@ export class UserController {
-  async createUser(req: Request, res: Response) {
+  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
-      const userData = req.body;
+      const { email, name, role } = req.body;
+      
+      if (!email || !name) {
+        throw new ValidationError('Email and name are required fields');
+      }
+      
       const user = await this.userService.create({
-        ...userData,
-        createdAt: new Date()
+        email,
+        name,
+        role: role || 'user',
+        createdAt: new Date(),
+        updatedAt: new Date()
       });
-      res.status(201).json(user);
+      logger.info(\`User created: \${user.id}\`);
+      res.status(201).json({ data: user, success: true });
     } catch (error) {
-      res.status(500).json({ error: 'Failed to create user' });
+      next(error);
     }
   }
 }
diff --git a/src/services/UserService.ts b/src/services/UserService.ts
new file mode 100644
index 0000000..f1a2b3c
--- /dev/null
+++ b/src/services/UserService.ts
@@ -0,0 +1,45 @@
+import { User, UserCreateInput } from '../types/User';
+import { Database } from '../database/Database';
+import { NotFoundError } from '../errors/NotFoundError';
+
+export class UserService {
+  constructor(private readonly db: Database) {}
+
+  async findById(id: string): Promise<User> {
+    const user = await this.db.users.findOne({ id });
+    
+    if (!user) {
+      throw new NotFoundError(\`User with ID \${id} not found\`);
+    }
+    
+    return this.sanitizeUser(user);
+  }
+
+  async create(input: UserCreateInput): Promise<User> {
+    const existingUser = await this.db.users.findOne({ email: input.email });
+    
+    if (existingUser) {
+      throw new Error('User with this email already exists');
+    }
+    
+    const user = await this.db.users.create({
+      ...input,
+      id: this.generateId(),
+      status: 'active',
+      emailVerified: false
+    });
+    
+    return this.sanitizeUser(user);
+  }
+
+  private sanitizeUser(user: User): User {
+    const { password, ...sanitized } = user as User & { password?: string };
+    return sanitized;
+  }
+
+  private generateId(): string {
+    return \`user_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
+  }
+}
diff --git a/tests/UserController.test.ts b/tests/UserController.test.ts
index d4e5f6g..h7i8j9k 100644
--- a/tests/UserController.test.ts
+++ b/tests/UserController.test.ts
@@ -10,8 +10,10 @@ describe('UserController', () => {
     mockUserService = {
       findById: jest.fn(),
+      create: jest.fn(),
     } as any;
-    controller = new UserController(mockUserService);
+    
+    controller = new UserController(mockUserService);
   });
 
   describe('getUser', () => {
@@ -20,10 +22,12 @@ describe('UserController', () => {
       const mockUser = { id: '123', name: 'John Doe' };
       mockUserService.findById.mockResolvedValue(mockUser);
 
-      await controller.getUser(mockReq, mockRes);
+      const next = jest.fn();
+      await controller.getUser(mockReq, mockRes, next);
 
-      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
+      expect(mockRes.status).toHaveBeenCalledWith(200);
+      expect(mockRes.json).toHaveBeenCalledWith({ data: mockUser, success: true });
     });
   });
 });`,
      }
    }

    return {
      mode: 'inline_text',
      text: 'Sample artifact content for type: ' + artifact.type,
    }
  }

  createMockEventSource(runId: string): EventSource {
    const events = [
      { type: 'run.started', data: { runId, ts: new Date().toISOString() } },
      { type: 'agent.started', data: { agent: 'Planner', message: 'Planning work...' } },
      { type: 'agent.step', data: { agent: 'Planner', message: 'Analyzing requirements' } },
      { type: 'agent.started', data: { agent: 'ReverseEngineer', message: 'Parsing code...' } },
      { type: 'agent.step', data: { agent: 'ReverseEngineer', message: 'Building dependency graph' } },
      { type: 'artifact.created', data: { artifactId: uuidv4(), type: 'patch' } },
      { type: 'run.completed', data: { runId, status: 'completed' } },
    ]

    const mockES = new EventTarget() as unknown as EventSource
    let index = 0

    const interval = setInterval(() => {
      if (index >= events.length) {
        clearInterval(interval)
        return
      }

      const event = events[index++]
      const messageEvent = new MessageEvent(event.type, {
        data: JSON.stringify(event.data),
      })
      mockES.dispatchEvent(messageEvent)
    }, 2000)

    return mockES
  }
}
