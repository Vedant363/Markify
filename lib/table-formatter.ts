export function detectTables(text: string): string {
  let result = text

  // First, preserve existing markdown tables
  const tableRegex = /\|[\s\S]*?\|[\s\S]*?\n\|[\s\S]*?\|/g
  const existingTables: string[] = []
  result = result.replace(tableRegex, (match) => {
    existingTables.push(match)
    return `__TABLE_${existingTables.length - 1}__`
  })

  // Look for patterns that might be tables
  const tablePatterns = [
    // Pattern for CSV-like data
    {
      pattern: /(?:^[^,\n"]+(?:,[^,\n"]+)+\n(?:[^,\n"]+(?:,[^,\n"]+)+\n)+)/gm,
      delimiter: /\s*,\s*/,
      minRows: 2,
      minCols: 2,
    },

    // Pattern for space/tab separated columns with consistent spacing
    {
      pattern: /(?:^[^\s\n]+(?:\s{2,}[^\s\n]+){2,}\n(?:[^\s\n]+(?:\s{2,}[^\s\n]+){2,}\n)+)/gm,
      delimiter: /\s{2,}/,
      minRows: 2,
      minCols: 3,
    },

    // Pattern for pipe-separated tables
    {
      pattern: /(?:^[^|\n]*\|[^|\n]*(?:\|[^|\n]*)+\n(?:[^|\n]*\|[^|\n]*(?:\|[^|\n]*)+\n)+)/gm,
      delimiter: /\s*\|\s*/,
      minRows: 2,
      minCols: 2,
    },

    // Pattern for tab-separated values
    {
      pattern: /(?:^[^\t\n]+(?:\t[^\t\n]+)+\n(?:[^\t\n]+(?:\t[^\t\n]+)+\n)+)/gm,
      delimiter: /\t/,
      minRows: 2,
      minCols: 2,
    },
  ]

  // Process each pattern
  for (const { pattern, delimiter, minRows, minCols } of tablePatterns) {
    result = result.replace(pattern, (match) => {
      // Skip if it's a placeholder for an existing table
      if (match.startsWith("__TABLE_")) {
        return match
      }

      // Skip if inside a code block
      if (isInCodeBlock(result, match)) {
        return match
      }

      return convertToMarkdownTable(match, delimiter, minRows, minCols)
    })
  }

  // Restore existing tables
  existingTables.forEach((table, index) => {
    result = result.replace(`__TABLE_${index}__`, table)
  })

  return result
}

function convertToMarkdownTable(tableText: string, delimiter: RegExp, minRows: number, minCols: number): string {
  const lines = tableText.trim().split("\n")

  if (lines.length < minRows) {
    return tableText // Not enough rows for a table
  }

  // Parse the rows
  const rows = lines.map((line) => {
    // For pipe tables, remove leading and trailing pipes
    const cleanLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, "")
    return cleanLine.split(delimiter).map((cell) => cell.trim())
  })

  // Get the maximum number of columns
  const columnCount = Math.max(...rows.map((row) => row.length))

  if (columnCount < minCols) {
    return tableText // Not enough columns for a table
  }

  // Ensure all rows have the same number of columns
  const normalizedRows = rows.map((row) => {
    while (row.length < columnCount) {
      row.push("")
    }
    return row
  })

  // Create the markdown table
  let markdownTable = ""

  // Header row
  markdownTable += "| " + normalizedRows[0].join(" | ") + " |\n"

  // Separator row
  markdownTable += "| " + Array(columnCount).fill("---").join(" | ") + " |\n"

  // Data rows
  for (let i = 1; i < normalizedRows.length; i++) {
    markdownTable += "| " + normalizedRows[i].join(" | ") + " |\n"
  }

  return markdownTable
}

// Helper function to check if text is inside a code block
function isInCodeBlock(fullText: string, matchText: string): boolean {
  const startPos = fullText.indexOf(matchText)
  if (startPos === -1) return false

  const textBefore = fullText.substring(0, startPos)
  const codeBlockStarts = (textBefore.match(/```/g) || []).length

  // If there's an odd number of code block markers before this text,
  // then we're inside a code block
  return codeBlockStarts % 2 === 1
}
