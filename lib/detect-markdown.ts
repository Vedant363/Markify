/**
 * Detects if the input text is likely already formatted as markdown
 * @param text The input text to analyze
 * @returns Boolean indicating if the text appears to be markdown
 */
export function isMarkdown(text: string): boolean {
  if (!text || text.trim().length === 0) return false

  // Common markdown patterns to check for
  const markdownPatterns = [
    /^#+\s+.+$/m, // Headers
    /^(?:\*|-|\+|\d+\.)\s+.+$/m, // List items
    /^>\s+.+$/m, // Blockquotes
    /\[.+\]$$.+$$/, // Links
    /!\[.+\]$$.+$$/, // Images
    /^```[\s\S]*?```$/m, // Code blocks
    /^~~~[\s\S]*?~~~$/m, // Alternative code blocks
    /\*\*.+\*\*/, // Bold
    /\*.+\*/, // Italic
    /^(?:\s*\|.+\|)+\s*$/m, // Tables
    /^(?:\s*\|[-:]+\|)+\s*$/m, // Table separators
    /^(?:---|\*\*\*|___)\s*$/m, // Horizontal rules
    /`[^`]+`/, // Inline code
    /^- \[[x ]\]/im, // Task lists
  ]

  // Count how many markdown patterns are found
  const matchCount = markdownPatterns.reduce((count, pattern) => {
    return count + (pattern.test(text) ? 1 : 0)
  }, 0)

  // If we find at least 2 different markdown patterns, it's likely markdown
  // Or if it contains code blocks, which are very specific to markdown
  return matchCount >= 2 || /^```[\s\S]*?```$/m.test(text)
}
