export function detectCodeBlocks(text: string): string {
  let result = text

  // First, preserve existing code blocks
  const codeBlockRegex = /```[\s\S]*?```/g
  const existingCodeBlocks: string[] = []
  result = result.replace(codeBlockRegex, (match) => {
    existingCodeBlocks.push(match)
    return `__CODE_BLOCK_${existingCodeBlocks.length - 1}__`
  })

  // Pattern for detecting code blocks
  const codeBlockPatterns = [
    // Indented blocks (4 spaces or tab)
    {
      pattern: /(?:^(?:[ \t]{4}|\t).*(?:\n(?:[ \t]{4}|\t).*)*)/gm,
      minLines: 2,
    },

    // Blocks that look like code (contain symbols like {}, (), etc.)
    {
      pattern: /(?:^(?:function|class|const|let|var|import|export|if|for|while).*\{(?:\n.*)*?\n\})/gm,
      minLines: 2,
    },

    // Blocks with consistent special formatting that look like code
    {
      pattern:
        /(?:^(?:public|private|protected|static|void|int|string|bool|function|def|class|interface)\s+\w+[\s\S]*?(?:\{[\s\S]*?\}|;))/gm,
      minLines: 1,
    },
  ]

  // Process each pattern
  for (const { pattern, minLines } of codeBlockPatterns) {
    result = result.replace(pattern, (match) => {
      // Skip if it's a placeholder for an existing code block
      if (match.startsWith("__CODE_BLOCK_")) {
        return match
      }

      // Skip if too short
      const lines = match.split("\n")
      if (lines.length < minLines) {
        return match
      }

      // Try to detect the language
      const language = detectLanguage(match)

      // Format as a code block
      return `\`\`\`${language}\n${match.replace(/^[ \t]{4}|\t/gm, "")}\n\`\`\``
    })
  }

  // Restore existing code blocks
  existingCodeBlocks.forEach((block, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, block)
  })

  // Detect inline code
  result = detectInlineCode(result)

  return result
}

function detectLanguage(code: string): string {
  // Simple language detection based on keywords and syntax

  // JavaScript
  if (/\b(function|const|let|var|document|window|console|Promise|async|await)\b/.test(code)) {
    return "javascript"
  }

  // TypeScript
  if (
    /\b(interface|type|namespace|enum|as|implements|extends)\b/.test(code) ||
    /:\s*(string|number|boolean|any|void|never)\b/.test(code)
  ) {
    return "typescript"
  }

  // Python
  if (
    /\b(def|class|import|from|if __name__ == ['"]__main__['"]:)\b/.test(code) ||
    /\b(self|None|True|False)\b/.test(code)
  ) {
    return "python"
  }

  // Java
  if (
    /\b(public|private|protected|class|void|static|final|extends|implements)\b/.test(code) &&
    /\b(String|Integer|Boolean|System\.out)\b/.test(code)
  ) {
    return "java"
  }

  // HTML
  if (/<(!DOCTYPE|html|head|body|div|span|h[1-6]|p|a|img|ul|ol|li|table)[\s>]/.test(code) || /<\/[a-z]+>/.test(code)) {
    return "html"
  }

  // CSS
  if (
    /\{[\s\S]*?:[^;{]*;[\s\S]*?\}/.test(code) &&
    /\b(margin|padding|color|background|font|width|height|display|position)\s*:/.test(code)
  ) {
    return "css"
  }

  // SQL
  if (/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\b/i.test(code)) {
    return "sql"
  }

  // C/C++
  if (
    /\b(int|char|float|double|void|struct|class|namespace|template|cout|cin|printf|scanf)\b/.test(code) &&
    /\b(return|if|else|for|while|switch)\b/.test(code)
  ) {
    return "cpp"
  }

  // Shell/Bash
  if (
    /\b(echo|export|source|alias|cd|ls|grep|awk|sed|cat|chmod|chown)\b/.test(code) ||
    /\$\{[^}]+\}/.test(code) ||
    /^#!\/bin\/(ba)?sh/.test(code)
  ) {
    return "bash"
  }

  // Generic code with syntax elements
  if (/(\{|\}|\[|\]|$$|$$|;|::|->|=>)/.test(code)) {
    return ""
  }

  return ""
}

function detectInlineCode(text: string): string {
  // Don't process inside code blocks
  const lines = text.split("\n")
  let inCodeBlock = false
  const processedLines = lines.map((line) => {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      return line
    }

    if (inCodeBlock) {
      return line
    }

    // Detect and format inline code
    return (
      line
        // Already formatted inline code
        .replace(/(?<![`\\])(`[^`\n]+?`)(?![`])/g, "$1")

        // Function calls
        .replace(/(?<![`\\])(?<!\w)([a-zA-Z_]\w*$$$$)(?![`\w])/g, "`$1`")

        // Method calls
        .replace(/(?<![`\\])(?<!\w)([a-zA-Z_]\w*\.[a-zA-Z_]\w*$$$$)(?![`\w])/g, "`$1`")

        // Variable names in technical context
        .replace(/(?<![`\\a-zA-Z0-9_])([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)(?=\s+[=:]|\s*[,;])(?![`\w])/g, "`$1`")

        // Command line arguments and flags
        .replace(/(?<![`\\])(?<=\s|^)(--?[a-zA-Z][\w-]*)(?![`\w])/g, "`$1`")

        // File paths and URLs in technical context
        .replace(/(?<![`\\([])(\/[a-zA-Z0-9_\-./]+)(?![`\w)\]])/g, "`$1`")

        // Code-like text in quotes
        .replace(/(?<![`\\])"([a-zA-Z0-9_\-./\\]+)"(?![`])/g, "`$1`")
    )
  })

  return processedLines.join("\n")
}
