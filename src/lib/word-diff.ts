export interface WordDiffSegment {
  type: 'unchanged' | 'added' | 'removed'
  text: string
}

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp
}

function backtrackLCS(
  a: string[],
  b: string[],
  dp: number[][],
  i: number,
  j: number,
  result: { type: 'match' | 'delete' | 'insert'; value: string }[]
): void {
  if (i === 0 && j === 0) {
    return
  }

  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    backtrackLCS(a, b, dp, i - 1, j - 1, result)
    result.push({ type: 'match', value: a[i - 1] })
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    backtrackLCS(a, b, dp, i, j - 1, result)
    result.push({ type: 'insert', value: b[j - 1] })
  } else if (i > 0) {
    backtrackLCS(a, b, dp, i - 1, j, result)
    result.push({ type: 'delete', value: a[i - 1] })
  }
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inWord = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const isWordChar = /\w/.test(char)

    if (isWordChar) {
      if (!inWord && current) {
        tokens.push(current)
        current = ''
      }
      current += char
      inWord = true
    } else {
      if (inWord && current) {
        tokens.push(current)
        current = ''
      }
      current += char
      inWord = false
    }
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

export function computeWordDiff(oldText: string, newText: string): {
  oldSegments: WordDiffSegment[]
  newSegments: WordDiffSegment[]
} {
  const oldTokens = tokenize(oldText)
  const newTokens = tokenize(newText)

  const dp = computeLCS(oldTokens, newTokens)
  const diff: { type: 'match' | 'delete' | 'insert'; value: string }[] = []
  backtrackLCS(oldTokens, newTokens, dp, oldTokens.length, newTokens.length, diff)

  const oldSegments: WordDiffSegment[] = []
  const newSegments: WordDiffSegment[] = []

  for (const item of diff) {
    if (item.type === 'match') {
      oldSegments.push({ type: 'unchanged', text: item.value })
      newSegments.push({ type: 'unchanged', text: item.value })
    } else if (item.type === 'delete') {
      oldSegments.push({ type: 'removed', text: item.value })
    } else if (item.type === 'insert') {
      newSegments.push({ type: 'added', text: item.value })
    }
  }

  return { oldSegments, newSegments }
}

export function mergeConsecutiveSegments(segments: WordDiffSegment[]): WordDiffSegment[] {
  if (segments.length === 0) return []

  const merged: WordDiffSegment[] = []
  let current = { ...segments[0] }

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].type === current.type) {
      current.text += segments[i].text
    } else {
      merged.push(current)
      current = { ...segments[i] }
    }
  }

  merged.push(current)
  return merged
}
