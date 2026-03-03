import type { SemanticGroup } from './types'

export function categorizeFilesByArchitecturalLayer(filePaths: string[]): SemanticGroup[] {
  const groups: Record<string, string[]> = {
    Controllers: [],
    DTOs: [],
    Services: [],
    Tests: [],
    Documentation: [],
    Configuration: [],
    Other: [],
  }

  filePaths.forEach(filePath => {
    const lowerPath = filePath.toLowerCase()
    const fileName = filePath.split('/').pop()?.toLowerCase() || ''

    if (lowerPath.includes('/test/') || lowerPath.includes('/tests/') || 
        fileName.endsWith('.test.ts') || fileName.endsWith('.test.tsx') || 
        fileName.endsWith('.test.js') || fileName.endsWith('.test.jsx') ||
        fileName.endsWith('.spec.ts') || fileName.endsWith('.spec.tsx') ||
        fileName.endsWith('.spec.js') || fileName.endsWith('.spec.jsx')) {
      groups.Tests.push(filePath)
    } else if (lowerPath.includes('/controller') || fileName.includes('controller')) {
      groups.Controllers.push(filePath)
    } else if (lowerPath.includes('/dto') || lowerPath.includes('/types') || 
               lowerPath.includes('/models') || lowerPath.includes('/entities') ||
               fileName.includes('dto.') || fileName.includes('type.') || 
               fileName.includes('model.') || fileName.includes('entity.')) {
      groups.DTOs.push(filePath)
    } else if (lowerPath.includes('/service') || fileName.includes('service')) {
      groups.Services.push(filePath)
    } else if (fileName.endsWith('.md') || fileName.endsWith('.mdx') || 
               fileName === 'readme' || fileName === 'changelog' ||
               lowerPath.includes('/docs/')) {
      groups.Documentation.push(filePath)
    } else if (lowerPath.includes('/config') || fileName.includes('config') ||
               fileName.endsWith('.json') || fileName.endsWith('.yaml') || 
               fileName.endsWith('.yml') || fileName.endsWith('.env') ||
               fileName.endsWith('.toml')) {
      groups.Configuration.push(filePath)
    } else {
      groups.Other.push(filePath)
    }
  })

  const semanticGroups: SemanticGroup[] = []

  if (groups.Controllers.length > 0) {
    semanticGroups.push({
      name: 'Controllers',
      category: 'controller',
      files: groups.Controllers.sort(),
      description: 'HTTP request handlers and routing logic'
    })
  }

  if (groups.DTOs.length > 0) {
    semanticGroups.push({
      name: 'DTOs & Types',
      category: 'dto',
      files: groups.DTOs.sort(),
      description: 'Data transfer objects, type definitions, and models'
    })
  }

  if (groups.Services.length > 0) {
    semanticGroups.push({
      name: 'Services',
      category: 'service',
      files: groups.Services.sort(),
      description: 'Business logic and service layer'
    })
  }

  if (groups.Tests.length > 0) {
    semanticGroups.push({
      name: 'Tests',
      category: 'test',
      files: groups.Tests.sort(),
      description: 'Unit tests, integration tests, and test suites'
    })
  }

  if (groups.Documentation.length > 0) {
    semanticGroups.push({
      name: 'Documentation',
      category: 'doc',
      files: groups.Documentation.sort(),
      description: 'README files, guides, and documentation'
    })
  }

  if (groups.Configuration.length > 0) {
    semanticGroups.push({
      name: 'Configuration',
      category: 'config',
      files: groups.Configuration.sort(),
      description: 'Config files, environment variables, and settings'
    })
  }

  if (groups.Other.length > 0) {
    semanticGroups.push({
      name: 'Other Files',
      category: 'other',
      files: groups.Other.sort(),
      description: 'Miscellaneous files not categorized above'
    })
  }

  return semanticGroups
}
