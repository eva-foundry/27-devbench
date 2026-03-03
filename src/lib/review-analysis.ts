import type { ChangeRisk, SemanticGroup } from './types'

export function analyzeChangeRisk(filePath: string, content: string, additions: number, deletions: number): ChangeRisk {
  const lowRiskPatterns = [
    /\.(md|txt|json)$/i,
    /README/i,
    /CHANGELOG/i,
    /\.test\./,
    /\.spec\./,
    /test\//,
    /__tests__\//,
  ]
  
  if (lowRiskPatterns.some(pattern => pattern.test(filePath))) {
    return 'low'
  }

  const highRiskIndicators = [
    /\b(if|else|switch|case)\b/g,
    /\b(for|while|do)\b/g,
    /\b(auth|login|password|token|secret|key)\b/gi,
    /\b(delete|drop|truncate|remove)\b/gi,
    /[+\-*/]\s*=/g,
    /\b(eval|exec|system|shell)\b/gi,
  ]
  
  let riskScore = 0
  for (const pattern of highRiskIndicators) {
    const matches = content.match(pattern)
    if (matches) {
      riskScore += matches.length
    }
  }

  const changeVolume = additions + deletions
  if (changeVolume > 200) riskScore += 3
  else if (changeVolume > 100) riskScore += 2
  else if (changeVolume > 50) riskScore += 1

  if (riskScore >= 10) return 'high'
  if (riskScore >= 5) return 'medium'
  return 'low'
}

export function isLargeDiff(additions: number, deletions: number, threshold = 100): boolean {
  return (additions + deletions) > threshold
}

export function isCoreLayer(filePath: string): boolean {
  const corePatterns = [
    /\/(domain|core|auth|security|policy)\//i,
    /authentication/i,
    /authorization/i,
    /middleware.*auth/i,
    /security/i,
  ]
  
  return corePatterns.some(pattern => pattern.test(filePath))
}

export function detectSemanticGroups(files: Array<{ path: string; type: string }>): SemanticGroup[] {
  const groups: Map<string, SemanticGroup> = new Map()

  const categoryPatterns: Array<{ 
    category: SemanticGroup['category']; 
    patterns: RegExp[]; 
    name: string 
  }> = [
    { 
      category: 'controller', 
      patterns: [/controller/i, /handler/i, /route/i, /endpoint/i],
      name: 'Controller changes'
    },
    { 
      category: 'dto', 
      patterns: [/dto/i, /model/i, /entity/i, /schema/i],
      name: 'DTO/Model changes'
    },
    { 
      category: 'service', 
      patterns: [/service/i, /repository/i, /dao/i],
      name: 'Service layer'
    },
    { 
      category: 'test', 
      patterns: [/\.test\./i, /\.spec\./i, /test\//i, /__tests__/i],
      name: 'Tests'
    },
    { 
      category: 'doc', 
      patterns: [/\.(md|txt)$/i, /doc/i, /readme/i],
      name: 'Documentation'
    },
    { 
      category: 'config', 
      patterns: [/config/i, /\.json$/i, /\.ya?ml$/i, /\.toml$/i],
      name: 'Configuration'
    },
  ]

  for (const file of files) {
    let matched = false
    for (const { category, patterns, name } of categoryPatterns) {
      if (patterns.some(p => p.test(file.path))) {
        const key = category
        if (!groups.has(key)) {
          groups.set(key, {
            name,
            category,
            files: [],
          })
        }
        groups.get(key)!.files.push(file.path)
        matched = true
        break
      }
    }
    
    if (!matched) {
      const key = 'other'
      if (!groups.has(key)) {
        groups.set(key, {
          name: 'Other changes',
          category: 'other',
          files: [],
        })
      }
      groups.get(key)!.files.push(file.path)
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    const order: Record<SemanticGroup['category'], number> = {
      controller: 1,
      service: 2,
      dto: 3,
      test: 4,
      doc: 5,
      config: 6,
      other: 7,
    }
    return order[a.category] - order[b.category]
  })
}

export function findRelatedTestFiles(filePath: string, allFiles: string[]): string[] {
  const baseName = filePath.replace(/\.[^.]+$/, '')
  const fileName = baseName.split('/').pop() || ''
  
  const testPatterns = [
    new RegExp(`${fileName}\\.test\\.`, 'i'),
    new RegExp(`${fileName}\\.spec\\.`, 'i'),
    new RegExp(`${fileName}_test\\.`, 'i'),
    new RegExp(`test.*${fileName}`, 'i'),
  ]
  
  return allFiles.filter(f => 
    testPatterns.some(p => p.test(f)) || 
    (f.includes('__tests__') && f.includes(fileName))
  )
}

export function shouldFlagForSME(filePath: string, content: string, riskLevel: ChangeRisk): boolean {
  if (riskLevel === 'high') return true
  if (isCoreLayer(filePath)) return true
  
  const smeRequiredPatterns = [
    /\b(business\s+logic|domain\s+logic)\b/i,
    /\b(compliance|regulation|policy)\b/i,
    /\b(gdpr|hipaa|pci|sox)\b/i,
  ]
  
  return smeRequiredPatterns.some(p => p.test(content))
}

export function extractChangeExplanation(hunkHeader?: string): string {
  if (!hunkHeader) return ''
  
  const functionMatch = hunkHeader.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/)
  if (functionMatch) {
    return `Function: ${functionMatch[1]}`
  }
  
  const classMatch = hunkHeader.match(/\b(class|interface|struct)\s+([a-zA-Z_][a-zA-Z0-9_]*)/)
  if (classMatch) {
    return `${classMatch[1]}: ${classMatch[2]}`
  }
  
  return hunkHeader.trim()
}
