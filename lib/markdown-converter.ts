import { detectTables } from "./table-formatter"

export function convertToMarkdown(text: string): string {
  // Process the text in steps
  let markdown = text

  // Step 1: Split into lines for processing
  const lines = markdown.split("\n")
  const processedLines: string[] = []

  // Step 2: Process the first line (Rule 1)
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // Check if first line is short (less than 60 chars) and not already a heading
    if (
      firstLine.length > 0 &&
      firstLine.length < 60 &&
      !firstLine.startsWith("#") &&
      !firstLine.endsWith(":") &&
      !firstLine.endsWith("?")
    ) {
      processedLines.push(`# ${firstLine}`)

      // Rule 2: Add horizontal rule after top heading
      processedLines.push("\n---\n")
    } else {
      processedLines.push(firstLine)
    }
  }

  // Step 3: Process the rest of the lines
  let i = 1
  while (i < lines.length) {
    const line = lines[i].trim()

    // Skip empty lines as we'll add them where needed
    if (line === "") {
      i++
      continue
    }

    // Rule 4: Short lines ending with : or ? become subheadings
    if ((line.endsWith(":") || line.endsWith("?")) && line.length < 60) {
      // Add blank line before subheading if not at the start
      if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== "") {
        processedLines.push("")
      }

      processedLines.push(`### ${line}`)

      // Check for ordered list after subheading
      let j = i + 1
      let hasOrderedList = false

      while (j < lines.length && lines[j].trim().match(/^\d+\.\s+.+/)) {
        hasOrderedList = true
        processedLines.push(lines[j].trim())
        j++
      }

      if (hasOrderedList) {
        processedLines.push("") // Add blank line after list
        i = j - 1 // Skip processed list items
      }
    }
    // Rule 5: Lines with 2+ spaces between words become table rows
    else if (line.includes("  ")) {
      const tableLines = [line]
      let j = i + 1

      // Collect consecutive table rows
      while (j < lines.length && lines[j].trim().includes("  ")) {
        tableLines.push(lines[j].trim())
        j++
      }

      if (tableLines.length >= 2) {
        // Process as table
        const tableRows = tableLines.map((row) => {
          // Split by 2+ spaces
          const cells = row
            .split(/\s{2,}/)
            .map((cell) => cell.trim())
            .filter((cell) => cell)
          return `| ${cells.join(" | ")} |`
        })

        // Insert separator row after first row
        if (tableRows.length > 0) {
          const headerRow = tableRows[0]
          const columnCount = (headerRow.match(/\|/g) || []).length - 1
          const separatorRow = `|${" --- |".repeat(columnCount)}`

          tableRows.splice(1, 0, separatorRow)
        }

        // Add blank line before table
        if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== "") {
          processedLines.push("")
        }

        // Add table rows
        processedLines.push(...tableRows)

        // Add blank line after table
        processedLines.push("")

        i = j - 1 // Skip processed table rows
      } else {
        // Rule 3: Regular text becomes paragraph
        if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== "") {
          processedLines.push("")
        }

        processedLines.push(line)
        processedLines.push("")
      }
    }
    // Rule 3: Regular text becomes paragraph
    else {
      // Add blank line before paragraph if not already there
      if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== "") {
        processedLines.push("")
      }

      // Check if this is the start of a paragraph
      const paragraphLines = [line]
      let j = i + 1

      // Collect consecutive non-empty lines as part of the same paragraph
      while (
        j < lines.length &&
        lines[j].trim() !== "" &&
        !lines[j].trim().endsWith(":") &&
        !lines[j].trim().endsWith("?") &&
        !lines[j].trim().includes("  ") &&
        !lines[j].trim().match(/^\d+\.\s+.+/)
      ) {
        paragraphLines.push(lines[j].trim())
        j++
      }

      // Join paragraph lines and add to processed lines
      processedLines.push(paragraphLines.join(" "))

      // Add blank line after paragraph
      processedLines.push("")

      i = j - 1 // Skip processed paragraph lines
    }

    i++
  }

  // Step 4: Process code blocks
  markdown = processedLines.join("\n")
  //markdown = detectCodeBlocks(markdown)

  // Step 5: Clean up excessive blank lines
  markdown = markdown.replace(/\n{3,}/g, "\n\n")

  // Step 3: Detect and format tables
  markdown = detectTables(markdown)

  // Step 4: Format headings
  function formatHeadings(text: string): string {
    // Detect lines that look like headings
    const lines = text.split("\n")
    const result = lines.map((line, index) => {
      // Skip if line is already a markdown heading
      if (/^#{1,6}\s+.+$/.test(line)) {
        return line
      }

      // Skip if line is part of a code block
      if (isInCodeBlock(lines, index)) {
        return line
      }

      // Check for Setext-style headings (underlined with === or ---)
      if (index > 0 && /^={3,}$/.test(line.trim())) {
        return `# ${lines[index - 1]}`
      }
      if (index > 0 && /^-{3,}$/.test(line.trim()) && !/^-{3,}$/.test(lines[index - 1].trim())) {
        return `## ${lines[index - 1]}`
      }

      // Check for title-like patterns
      if (line.trim().length > 0 && line.trim().length < 100) {
        // Title case or ALL CAPS, standalone line, not part of a paragraph
        const isPreviousLineEmpty = index === 0 || lines[index - 1].trim() === ""
        const isNextLineEmpty = index === lines.length - 1 || lines[index + 1].trim() === ""

        if (isPreviousLineEmpty && (isNextLineEmpty || /^[=-]{3,}$/.test(lines[index + 1].trim()))) {
          // Determine heading level based on characteristics
          if (line.length < 20 && /^[A-Z0-9\s.,!?:;-]+$/.test(line) && line.toUpperCase() === line) {
            return `# ${line}`
          } else if (line.length < 50 && /^[A-Z]/.test(line) && !line.includes(".")) {
            return `## ${line}`
          } else if (line.length < 80 && /^[A-Z]/.test(line)) {
            return `### ${line}`
          }
        }
      }

      return line
    })

    // Clean up Setext-style heading markers
    const cleanedResult = []
    for (let i = 0; i < result.length; i++) {
      if (i > 0 && result[i - 1].startsWith("# ") && /^={3,}$/.test(result[i].trim())) {
        continue
      }
      if (i > 0 && result[i - 1].startsWith("## ") && /^-{3,}$/.test(result[i].trim())) {
        continue
      }
      cleanedResult.push(result[i])
    }

    return cleanedResult.join("\n")
  }
  markdown = formatHeadings(markdown)

  // Step 5: Format lists
  function formatLists(text: string): string {
    const lines = text.split("\n")
    const result: string[] = []
    let inList = false
    let listIndentation = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip if line is part of a code block
      if (isInCodeBlock(lines, i)) {
        result.push(line)
        continue
      }

      // Check for numbered list patterns
      const numberedListMatch = line.match(/^(\s*)(\d+)[.)](\s+)(.+)$/)
      if (numberedListMatch) {
        const [, indent, number, space, content] = numberedListMatch
        inList = true
        listIndentation = indent.length
        result.push(`${indent}${number}. ${content}`)
        continue
      }

      // Check for bullet list patterns
      const bulletListMatch = line.match(/^(\s*)[-•*+](\s+)(.+)$/)
      if (bulletListMatch) {
        const [, indent, space, content] = bulletListMatch
        inList = true
        listIndentation = indent.length
        result.push(`${indent}- ${content}`)
        continue
      }

      // Check for continued list items (indented lines after a list item)
      if (inList && line.trim() !== "") {
        const indentMatch = line.match(/^(\s+)/)
        const currentIndent = indentMatch ? indentMatch[1].length : 0

        if (currentIndent >= listIndentation) {
          // This is a continuation of the previous list item
          result.push(line)
          continue
        }
      }

      // Check for potential list items based on context
      if (i > 0 && i < lines.length - 1) {
        const prevLine = result[result.length - 1]
        const nextLine = lines[i + 1]

        // If previous line is a list item and this line looks like it should be one too
        if (
          (prevLine.match(/^(\s*)[-•*+](\s+)/) || prevLine.match(/^(\s*)(\d+)[.)](\s+)/)) &&
          line.trim().length > 0 &&
          !line.trim().startsWith("- ") &&
          !line.trim().match(/^\d+[.)]\s+/)
        ) {
          // Check if this line follows the pattern of other list items
          const prevIsNumbered = prevLine.match(/^(\s*)(\d+)[.)](\s+)/)
          const prevIndent = prevLine.match(/^(\s*)/)?.[1] || ""

          if (prevIsNumbered) {
            const number = Number.parseInt(prevIsNumbered[2]) + 1
            result.push(`${prevIndent}${number}. ${line.trim()}`)
          } else {
            result.push(`${prevIndent}- ${line.trim()}`)
          }
          continue
        }
      }

      // Not a list item
      if (line.trim() === "") {
        inList = false
      }

      result.push(line)
    }

    return result.join("\n")
  }
  markdown = formatLists(markdown)

  // Step 6: Format task lists (checkboxes)
  function formatTaskLists(text: string): string {
    const lines = text.split("\n")
    const result: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip if line is part of a code block
      if (isInCodeBlock(lines, i)) {
        result.push(line)
        continue
      }

      // Check for task list patterns like "- [ ] Task" or "- [x] Completed task"
      const taskListMatch = line.match(/^(\s*)[-*+](\s+)\[([x ])\](\s+)(.+)$/i)
      if (taskListMatch) {
        const [, indent, space1, check, space2, content] = taskListMatch
        const isChecked = check.toLowerCase() === "x"
        result.push(`${indent}- [${isChecked ? "x" : " "}] ${content}`)
        continue
      }

      // Check for text that looks like it should be a task list
      const todoMatch = line.match(/^(\s*)[-*+](\s+)(TODO|DONE|☐|☑|☒|□|✓|✔|✗|✘):?(\s+)(.+)$/i)
      if (todoMatch) {
        const [, indent, space1, status, space2, content] = todoMatch
        const isChecked = /DONE|☑|☒|✓|✔/i.test(status)
        result.push(`${indent}- [${isChecked ? "x" : " "}] ${content}`)
        continue
      }

      result.push(line)
    }

    return result.join("\n")
  }
  markdown = formatTaskLists(markdown)

  // Step 7: Format emphasis (bold, italic)
  function formatEmphasis(text: string): string {
    const result = text

    // Process line by line to avoid formatting in code blocks
    const lines = result.split("\n")
    const processedLines = lines.map((line, index) => {
      if (isInCodeBlock(lines, index)) {
        return line
      }

      // Bold: text surrounded by double asterisks or underscores
      let processed = line.replace(/(?<!\*)\*\*([^*\n]+)\*\*(?!\*)/g, "**$1**")
      processed = processed.replace(/(?<!_)__([^_\n]+)__(?!_)/g, "**$1**")

      // Bold: text in ALL CAPS that's not a heading (only if it's a word or short phrase)
      processed = processed.replace(/\b([A-Z][A-Z0-9]{2,})\b(?!\*\*)/g, "**$1**")

      // Italic: text surrounded by single asterisks or underscores
      processed = processed.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "*$1*")
      processed = processed.replace(/(?<!_)_([^_\n]+)_(?!_)/g, "*$1*")

      // Bold and italic
      processed = processed.replace(/(?<!\*)\*\*\*([^*\n]+)\*\*\*(?!\*)/g, "***$1***")
      processed = processed.replace(/(?<!_)___([^_\n]+)___(?!_)/g, "***$1***")

      return processed
    })

    return processedLines.join("\n")
  }
  markdown = formatEmphasis(markdown)

  // Step 8: Format links and images
  function formatLinks(text: string): string {
    const result = text

    // Process line by line to avoid formatting in code blocks
    const lines = result.split("\n")
    const processedLines = lines.map((line, index) => {
      if (isInCodeBlock(lines, index)) {
        return line
      }

      // Already formatted markdown links: [text](url)
      if (line.match(/\[([^\]]+)\]$([^)]+)$/)) {
        return line
      }

      // URL pattern
      let processed = line.replace(/(^|\s)(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, "$1[$2]($2)")

      // Email pattern
      processed = processed.replace(/(^|\s)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1[$2](mailto:$2)")

      // Text that looks like "Link text: http://example.com"
      processed = processed.replace(/([^:]+):\s+(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, "[$1]($2)")

      return processed
    })

    return processedLines.join("\n")
  }
  markdown = formatLinks(markdown)
  function formatImages(text: string): string {
    const result = text

    // Process line by line to avoid formatting in code blocks
    const lines = result.split("\n")
    const processedLines = lines.map((line, index) => {
      if (isInCodeBlock(lines, index)) {
        return line
      }

      // Already formatted markdown images: ![alt](url)
      if (line.match(/!\[([^\]]*)\]$([^)]+)$/)) {
        return line
      }

      // Lines that contain only image URLs
      let processed = line.replace(/^(https?:\/\/[^\s<]+\.(jpg|jpeg|png|gif|webp|svg))$/i, "![]($1)")

      // Lines that contain "Image: URL" or "Figure: URL"
      processed = processed.replace(
        /^(Image|Figure|Photo|Picture):\s+(https?:\/\/[^\s<]+\.(jpg|jpeg|png|gif|webp|svg))$/i,
        "![$1]($2)",
      )

      return processed
    })

    return processedLines.join("\n")
  }
  markdown = formatImages(markdown)

  // Step 9: Format blockquotes
  function formatBlockquotes(text: string): string {
    const lines = text.split("\n")
    const result: string[] = []
    let inBlockquote = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip if line is part of a code block
      if (isInCodeBlock(lines, i)) {
        result.push(line)
        continue
      }

      // Check for lines that already start with >
      if (/^\s*>\s*/.test(line)) {
        inBlockquote = true
        result.push(line)
        continue
      }

      // Check for lines that look like quotes
      if (/^\s*["'](.+)["']\s*$/.test(line)) {
        const match = line.match(/^\s*["'](.+)["']\s*$/)
        if (match) {
          inBlockquote = true
          result.push(`> ${match[1]}`)
          continue
        }
      }

      // Check for lines that start with common quote indicators
      if (/^\s*(Quote|Quoted|Q:|Citation):/.test(line)) {
        const content = line.replace(/^\s*(Quote|Quoted|Q:|Citation):\s*/, "")
        inBlockquote = true
        result.push(`> ${content}`)
        continue
      }

      // Check for continued blockquote
      if (inBlockquote && line.trim() !== "") {
        // If this line doesn't look like the start of a new section, continue the blockquote
        if (!/^#{1,6}\s+/.test(line) && !/^[-*+]\s+/.test(line) && !/^\d+\.\s+/.test(line)) {
          result.push(`> ${line}`)
          continue
        }
      }

      // Not a blockquote
      if (line.trim() === "") {
        inBlockquote = false
      }

      result.push(line)
    }

    return result.join("\n")
  }
  markdown = formatBlockquotes(markdown)

  // Step 10: Format horizontal rules
  function formatHorizontalRules(text: string): string {
    const lines = text.split("\n")
    const result: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip if line is part of a code block
      if (isInCodeBlock(lines, i)) {
        result.push(lines[i])
        continue
      }

      // Check for horizontal rule patterns
      if (/^[-*_]{3,}$/.test(line)) {
        result.push("---")
        continue
      }

      // Check for lines that are just separators like "=======" or "-------"
      if (/^[=]{3,}$/.test(line) || /^[-]{3,}$/.test(line)) {
        // Only convert to horizontal rule if not preceded by text (which would make it a heading)
        const prevLine = i > 0 ? lines[i - 1].trim() : ""
        if (prevLine === "") {
          result.push("---")
          continue
        }
      }

      result.push(lines[i])
    }

    return result.join("\n")
  }
  markdown = formatHorizontalRules(markdown)

  // Step 11: Format inline code - UPDATED to only add backticks for quoted text
  function formatInlineCode(text: string): string {
    const result = text

    // Process line by line to avoid formatting in code blocks
    const lines = result.split("\n")
    const processedLines = lines.map((line, index) => {
      if (isInCodeBlock(lines, index)) {
        return line
      }

      // Skip if line already contains backticks
      if (line.includes("`")) {
        return line
      }

      // ONLY add backticks around text in quotes
      // Match text in double quotes that doesn't span multiple lines
      let processed = line.replace(/\s"([^"\n]+)"\s/g, " `$1` ")

      // Match text in single quotes that doesn't span multiple lines
      processed = processed.replace(/\s'([^'\n]+)'\s/g, " `$1` ")

      return processed
    })

    return processedLines.join("\n")
  }
  markdown = formatInlineCode(markdown)

  return markdown
}

// Helper function to check if a line is within a code block
function isInCodeBlock(lines: string[], index: number): boolean {
  // Count the number of code block delimiters (```) before this line
  let codeBlockCount = 0
  for (let i = 0; i < index; i++) {
    if (lines[i].trim().startsWith("```")) {
      codeBlockCount++
    }
  }

  // If the count is odd, we're inside a code block
  return codeBlockCount % 2 === 1
}
