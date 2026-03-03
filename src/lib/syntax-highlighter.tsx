import React from 'react'

export interface HighlightToken {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'class' | 'operator' | 'punctuation' | 'property' | 'tag' | 'attribute' | 'plain'
  content: string
}

interface LanguagePattern {
  keywords: RegExp
  strings: RegExp
  comments: RegExp
  numbers: RegExp
  functions: RegExp
  classes: RegExp
  operators: RegExp
  properties: RegExp
  tags?: RegExp
  attributes?: RegExp
}

const createKeywordRegex = (keywords: string[]) => {
  return new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
}

const languagePatterns: Record<string, LanguagePattern> = {
  typescript: {
    keywords: createKeywordRegex([
      'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class',
      'const', 'constructor', 'continue', 'debugger', 'declare', 'default', 'delete', 'do',
      'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
      'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'is', 'keyof',
      'let', 'namespace', 'never', 'new', 'null', 'number', 'of', 'package', 'private',
      'protected', 'public', 'readonly', 'return', 'set', 'static', 'string', 'super',
      'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined',
      'unknown', 'var', 'void', 'while', 'with', 'yield'
    ]),
    strings: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|\d+\.?\d*([eE][+-]?\d+)?)\b/g,
    functions: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w$]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+/g,
    properties: /\.([a-zA-Z_$][\w$]*)/g,
  },
  javascript: {
    keywords: createKeywordRegex([
      'abstract', 'arguments', 'async', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
      'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
      'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float',
      'for', 'from', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof',
      'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'of', 'package', 'private',
      'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized',
      'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void',
      'volatile', 'while', 'with', 'yield'
    ]),
    strings: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|\d+\.?\d*([eE][+-]?\d+)?)\b/g,
    functions: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w$]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+/g,
    properties: /\.([a-zA-Z_$][\w$]*)/g,
  },
  python: {
    keywords: createKeywordRegex([
      'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
      'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
      'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
      'return', 'try', 'while', 'with', 'yield'
    ]),
    strings: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|f["'](?:\\.|[^"'\\])*["'])/g,
    comments: /#.*$/gm,
    numbers: /\b(\d+\.?\d*([eE][+-]?\d+)?|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~@]+/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
  java: {
    keywords: createKeywordRegex([
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
      'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
      'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
      'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
      'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
      'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|\d+\.?\d*([eE][+-]?\d+)?[fFdDlL]?)\b/g,
    functions: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w$]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+/g,
    properties: /\.([a-zA-Z_$][\w$]*)/g,
  },
  csharp: {
    keywords: createKeywordRegex([
      'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked',
      'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else',
      'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for',
      'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock',
      'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override', 'params',
      'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed',
      'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this',
      'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort',
      'using', 'virtual', 'void', 'volatile', 'while'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1|@"(?:""|[^"])*"/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|\d+\.?\d*([eE][+-]?\d+)?[fFdDmM]?)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
  html: {
    keywords: /(?!)/g,
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /<!--[\s\S]*?-->/g,
    numbers: /\b\d+\b/g,
    functions: /(?!)/g,
    classes: /(?!)/g,
    operators: /[=]/g,
    properties: /(?!)/g,
    tags: /<\/?[\w-]+|>/g,
    attributes: /\b[\w-]+(?==)/g,
  },
  css: {
    keywords: createKeywordRegex([
      'important', 'inherit', 'initial', 'unset', 'revert'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /\/\*[\s\S]*?\*\//g,
    numbers: /[-+]?\d*\.?\d+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|deg|rad|grad|turn|s|ms)?/g,
    functions: /\b([a-zA-Z-]+)\s*(?=\()/g,
    classes: /\.[a-zA-Z_-][\w-]*/g,
    operators: /[+\-*/%=<>!:]+/g,
    properties: /\b[a-zA-Z-]+(?=\s*:)/g,
  },
  json: {
    keywords: createKeywordRegex(['true', 'false', 'null']),
    strings: /"(?:\\.|[^"\\])*"/g,
    comments: /(?!)/g,
    numbers: /-?\d+\.?\d*([eE][+-]?\d+)?/g,
    functions: /(?!)/g,
    classes: /(?!)/g,
    operators: /[{}[\]:,]/g,
    properties: /"([^"\\]|\\.)*"(?=\s*:)/g,
  },
  sql: {
    keywords: createKeywordRegex([
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
      'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS',
      'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP',
      'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
      'select', 'from', 'where', 'insert', 'update', 'delete', 'create', 'alter', 'drop',
      'table', 'index', 'view', 'join', 'left', 'right', 'inner', 'outer', 'on', 'as',
      'and', 'or', 'not', 'null', 'is', 'in', 'like', 'between', 'order', 'by', 'group',
      'having', 'limit', 'offset', 'distinct', 'count', 'sum', 'avg', 'max', 'min'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /(?!)/g,
    operators: /[+\-*/%=<>!]+/g,
    properties: /(?!)/g,
  },
  ruby: {
    keywords: createKeywordRegex([
      'BEGIN', 'END', 'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined',
      'do', 'else', 'elsif', 'end', 'ensure', 'false', 'for', 'if', 'in', 'module', 'next',
      'nil', 'not', 'or', 'redo', 'rescue', 'retry', 'return', 'self', 'super', 'then',
      'true', 'undef', 'unless', 'until', 'when', 'while', 'yield', 'require', 'include',
      'extend', 'attr_accessor', 'attr_reader', 'attr_writer', 'private', 'protected', 'public'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1|%[qQwWiI]?\((?:[^()\\]|\\.)*\)|%[qQwWiI]?\[(?:[^\[\]\\]|\\.)*\]|%[qQwWiI]?\{(?:[^{}\\]|\\.)*\}/g,
    comments: /#.*$/gm,
    numbers: /\b(\d+\.?\d*([eE][+-]?\d+)?|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/g,
    functions: /\b([a-zA-Z_][\w]*[!?]?)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+|=>|<<|>>|\.\./g,
    properties: /[@$:]([a-zA-Z_][\w]*)/g,
  },
  go: {
    keywords: createKeywordRegex([
      'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough',
      'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range',
      'return', 'select', 'struct', 'switch', 'type', 'var', 'bool', 'byte', 'complex64',
      'complex128', 'error', 'float32', 'float64', 'int', 'int8', 'int16', 'int32', 'int64',
      'rune', 'string', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr', 'true',
      'false', 'iota', 'nil', 'append', 'cap', 'close', 'copy', 'delete', 'len', 'make',
      'new', 'panic', 'print', 'println', 'recover'
    ]),
    strings: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|\d+\.?\d*([eE][+-]?\d+)?[i]?)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~:]+|:=|<-|\.\.\.|\+\+|--|&&|\|\||==|!=|<=|>=/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
  rust: {
    keywords: createKeywordRegex([
      'abstract', 'as', 'async', 'await', 'become', 'box', 'break', 'const', 'continue',
      'crate', 'do', 'dyn', 'else', 'enum', 'extern', 'false', 'final', 'fn', 'for', 'if',
      'impl', 'in', 'let', 'loop', 'macro', 'match', 'mod', 'move', 'mut', 'override',
      'priv', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait',
      'true', 'type', 'typeof', 'unsafe', 'unsized', 'use', 'virtual', 'where', 'while',
      'yield', 'bool', 'char', 'f32', 'f64', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
      'str', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize', 'String', 'Vec', 'Option', 'Result',
      'Some', 'None', 'Ok', 'Err'
    ]),
    strings: /(r#*"(?:[^"\\]|\\.)*"#*|b?"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)+')/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*\.?[\d_]*([eE][+-]?[\d_]+)?)(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64)?\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\(|!)/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+|=>|->|\.\.|\.\.=|::|&&|\|\||==|!=|<=|>=/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
  php: {
    keywords: createKeywordRegex([
      'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone',
      'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty',
      'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit',
      'extends', 'final', 'finally', 'fn', 'for', 'foreach', 'function', 'global', 'goto', 'if',
      'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
      'list', 'match', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public',
      'readonly', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait',
      'try', 'unset', 'use', 'var', 'while', 'xor', 'yield', 'true', 'false', 'null', 'parent',
      'self', 'int', 'float', 'bool', 'string', 'void', 'mixed', 'object', 'iterable', 'never'
    ]),
    strings: /(["'])(?:\\.|(?!\1)[^\\\n])*\1|<<<['"]?(\w+)['"]?[\s\S]*?\n\2/g,
    comments: /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|\d+\.?\d*([eE][+-]?\d+)?)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+|=>|->|\.\.\.|\.\.|&&|\|\||==|===|!=|!==|<=|>=/g,
    properties: /->([a-zA-Z_][\w]*)/g,
  },
  kotlin: {
    keywords: createKeywordRegex([
      'abstract', 'actual', 'annotation', 'as', 'break', 'by', 'catch', 'class', 'companion',
      'const', 'constructor', 'continue', 'crossinline', 'data', 'delegate', 'do', 'dynamic',
      'else', 'enum', 'expect', 'external', 'false', 'field', 'file', 'final', 'finally', 'for',
      'fun', 'get', 'if', 'import', 'in', 'infix', 'init', 'inline', 'inner', 'interface',
      'internal', 'is', 'lateinit', 'noinline', 'null', 'object', 'open', 'operator', 'out',
      'override', 'package', 'param', 'private', 'property', 'protected', 'public', 'receiver',
      'reified', 'return', 'sealed', 'set', 'setparam', 'super', 'suspend', 'tailrec', 'this',
      'throw', 'true', 'try', 'typealias', 'typeof', 'val', 'var', 'vararg', 'when', 'where',
      'while', 'Boolean', 'Byte', 'Char', 'Double', 'Float', 'Int', 'Long', 'Short', 'String',
      'Unit', 'Any', 'Nothing'
    ]),
    strings: /("""[\s\S]*?"""|"(?:\\.|[^"\\])*")/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F]+|0b[01]+|\d+\.?\d*([eE][+-]?\d+)?[fFdDlL]?)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+|\.\.|\?:|!!|&&|\|\||==|===|!=|!==|<=|>=|->|::/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
  swift: {
    keywords: createKeywordRegex([
      'associatedtype', 'break', 'case', 'catch', 'class', 'continue', 'default', 'defer', 'deinit',
      'do', 'else', 'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'for', 'func',
      'guard', 'if', 'import', 'in', 'init', 'inout', 'internal', 'is', 'let', 'nil', 'open',
      'operator', 'private', 'protocol', 'public', 'repeat', 'rethrows', 'return', 'self', 'Self',
      'static', 'struct', 'subscript', 'super', 'switch', 'throw', 'throws', 'true', 'try',
      'typealias', 'var', 'where', 'while', 'Any', 'AnyObject', 'Int', 'Double', 'Float', 'Bool',
      'String', 'Character', 'Optional', 'Array', 'Dictionary', 'Set', 'Void', 'some', 'async',
      'await', 'actor', 'isolated', 'nonisolated'
    ]),
    strings: /("""[\s\S]*?"""|"(?:\\.|[^"\\])*")/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*\.?[\d_]*([eE][+-]?[\d_]+)?)\b/g,
    functions: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
    classes: /\b([A-Z][\w]*)\b/g,
    operators: /[+\-*/%=<>!&|^~?:]+|\.\.\.|\.\.|&&|\|\||==|!=|===|!==|<=|>=|->/g,
    properties: /\.([a-zA-Z_][\w]*)/g,
  },
}

const getLanguageFromExtension = (filename: string): string | null => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mapping: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'html': 'html',
    'htm': 'html',
    'xml': 'html',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'less': 'css',
    'json': 'json',
    'sql': 'sql',
    'rb': 'ruby',
    'rake': 'ruby',
    'gemspec': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'phtml': 'php',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'swift': 'swift',
  }
  return ext ? mapping[ext] || null : null
}

export function highlightCode(code: string, filename: string): HighlightToken[] {
  const language = getLanguageFromExtension(filename)
  if (!language || !languagePatterns[language]) {
    return [{ type: 'plain', content: code }]
  }

  const pattern = languagePatterns[language]
  const tokens: HighlightToken[] = []
  const matches: Array<{ start: number; end: number; type: HighlightToken['type']; content: string }> = []

  const addMatches = (regex: RegExp, type: HighlightToken['type'], captureGroup = 0) => {
    const r = new RegExp(regex.source, regex.flags)
    let match
    while ((match = r.exec(code)) !== null) {
      const content = captureGroup > 0 && match[captureGroup] ? match[captureGroup] : match[0]
      const start = captureGroup > 0 && match[captureGroup] ? match.index + match[0].indexOf(content) : match.index
      matches.push({
        start,
        end: start + content.length,
        type,
        content: match[0],
      })
    }
  }

  addMatches(pattern.comments, 'comment')
  addMatches(pattern.strings, 'string')
  addMatches(pattern.numbers, 'number')
  if (pattern.tags) addMatches(pattern.tags, 'tag')
  if (pattern.attributes) addMatches(pattern.attributes, 'attribute')
  addMatches(pattern.keywords, 'keyword')
  addMatches(pattern.classes, 'class')
  addMatches(pattern.functions, 'function')
  addMatches(pattern.properties, 'property', 1)
  addMatches(pattern.operators, 'operator')

  matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))

  const usedRanges: Array<{ start: number; end: number }> = []
  const finalMatches: typeof matches = []

  for (const match of matches) {
    const overlaps = usedRanges.some(
      (range) => !(match.end <= range.start || match.start >= range.end)
    )
    if (!overlaps) {
      finalMatches.push(match)
      usedRanges.push({ start: match.start, end: match.end })
    }
  }

  finalMatches.sort((a, b) => a.start - b.start)

  let lastIndex = 0
  for (const match of finalMatches) {
    if (match.start > lastIndex) {
      tokens.push({
        type: 'plain',
        content: code.slice(lastIndex, match.start),
      })
    }
    tokens.push({
      type: match.type,
      content: match.content,
    })
    lastIndex = match.end
  }

  if (lastIndex < code.length) {
    tokens.push({
      type: 'plain',
      content: code.slice(lastIndex),
    })
  }

  return tokens
}

export function renderHighlightedCode(tokens: HighlightToken[]): React.ReactNode {
  return tokens.map((token, idx) => {
    const className = getTokenClassName(token.type)
    if (className) {
      return React.createElement('span', { key: idx, className }, token.content)
    }
    return token.content
  })
}

function getTokenClassName(type: HighlightToken['type']): string {
  const classMap: Record<HighlightToken['type'], string> = {
    keyword: 'text-purple-600 dark:text-purple-400 font-semibold',
    string: 'text-green-600 dark:text-green-400',
    comment: 'text-gray-500 dark:text-gray-500 italic',
    number: 'text-orange-600 dark:text-orange-400',
    function: 'text-blue-600 dark:text-blue-400',
    class: 'text-yellow-600 dark:text-yellow-400',
    operator: 'text-gray-700 dark:text-gray-300',
    punctuation: 'text-gray-600 dark:text-gray-400',
    property: 'text-cyan-600 dark:text-cyan-400',
    tag: 'text-red-600 dark:text-red-400',
    attribute: 'text-indigo-600 dark:text-indigo-400',
    plain: '',
  }
  return classMap[type] || ''
}
