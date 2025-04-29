/**
 * Applies markdown formatting to the selected text or at the cursor position
 */
export function applyMarkdownFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  action: string,
  options?: any,
): { text: string; newCursorPos: number } {
  const selectedText = text.substring(selectionStart, selectionEnd)
  const beforeText = text.substring(0, selectionStart)
  const afterText = text.substring(selectionEnd)

  let newText = text
  let newCursorPos = selectionEnd

  switch (action) {
    case "heading": {
      const level = options?.level || 1
      const prefix = "#".repeat(level) + " "

      // Check if we're at the start of a line
      const isStartOfLine = selectionStart === 0 || text.charAt(selectionStart - 1) === "\n"
      const lineStart = isStartOfLine ? selectionStart : beforeText.lastIndexOf("\n") + 1

      // Check if the line already has a heading
      const currentLine = text.substring(
        lineStart,
        selectionEnd === lineStart ? text.indexOf("\n", lineStart) : selectionEnd,
      )
      const hasHeading = /^#{1,6}\s/.test(currentLine)

      if (hasHeading) {
        // Replace existing heading
        const lineEnd = text.indexOf("\n", lineStart) === -1 ? text.length : text.indexOf("\n", lineStart)
        const lineWithoutHeading = currentLine.replace(/^#{1,6}\s/, "")
        newText = text.substring(0, lineStart) + prefix + lineWithoutHeading + text.substring(lineEnd)
        newCursorPos = lineStart + prefix.length + lineWithoutHeading.length
      } else if (isStartOfLine) {
        // Add heading at the start of the line
        newText = beforeText + prefix + selectedText + afterText
        newCursorPos = selectionStart + prefix.length + selectedText.length
      } else {
        // Insert a new line before adding the heading
        const lineContent =
          selectedText ||
          text.substring(lineStart, text.indexOf("\n", lineStart) === -1 ? text.length : text.indexOf("\n", lineStart))
        newText = text.substring(0, lineStart) + prefix + lineContent + text.substring(lineStart + lineContent.length)
        newCursorPos = lineStart + prefix.length + lineContent.length
      }
      break
    }

    case "bold":
      if (selectedText) {
        // Check if the selected text is already bold
        if (selectedText.startsWith("**") && selectedText.endsWith("**")) {
          // Remove bold formatting
          const unformattedText = selectedText.substring(2, selectedText.length - 2)
          newText = beforeText + unformattedText + afterText
          newCursorPos = selectionStart + unformattedText.length
        } else {
          // Add bold formatting
          newText = beforeText + "**" + selectedText + "**" + afterText
          newCursorPos = selectionEnd + 4
        }
      } else {
        newText = beforeText + "**bold text**" + afterText
        newCursorPos = selectionStart + 2
      }
      break

    case "italic":
      if (selectedText) {
        // Check if the selected text is already italic
        if (selectedText.startsWith("*") && selectedText.endsWith("*") && !selectedText.startsWith("**")) {
          // Remove italic formatting
          const unformattedText = selectedText.substring(1, selectedText.length - 1)
          newText = beforeText + unformattedText + afterText
          newCursorPos = selectionStart + unformattedText.length
        } else {
          // Add italic formatting
          newText = beforeText + "*" + selectedText + "*" + afterText
          newCursorPos = selectionEnd + 2
        }
      } else {
        newText = beforeText + "*italic text*" + afterText
        newCursorPos = selectionStart + 1
      }
      break

    case "code":
      if (selectedText) {
        // Check if the selected text is already code
        if (selectedText.startsWith("`") && selectedText.endsWith("`")) {
          // Remove code formatting
          const unformattedText = selectedText.substring(1, selectedText.length - 1)
          newText = beforeText + unformattedText + afterText
          newCursorPos = selectionStart + unformattedText.length
        } else {
          // Add code formatting
          newText = beforeText + "`" + selectedText + "`" + afterText
          newCursorPos = selectionEnd + 2
        }
      } else {
        newText = beforeText + "`code`" + afterText
        newCursorPos = selectionStart + 1
      }
      break

    case "link":
      if (selectedText) {
        // Check if the selected text is already a link
        const linkRegex = /^\[(.+)\]$$(.+)$$$/
        const match = selectedText.match(linkRegex)

        if (match) {
          // Already a link, extract the text and URL
          const linkText = match[1]
          const url = match[2]
          // Ask for a new URL
          const newUrl = prompt("Enter URL:", url) || url
          newText = beforeText + `[${linkText}](${newUrl})` + afterText
          newCursorPos = selectionStart + linkText.length + newUrl.length + 4
        } else {
          // Not a link yet, convert to link
          newText = beforeText + `[${selectedText}](url)` + afterText
          newCursorPos = selectionEnd + 6
        }
      } else {
        newText = beforeText + "[link text](url)" + afterText
        newCursorPos = selectionStart + 1
      }
      break

    case "image":
      if (selectedText) {
        // Check if the selected text is already an image
        const imageRegex = /^!\[(.+)\]$$(.+)$$$/
        const match = selectedText.match(imageRegex)

        if (match) {
          // Already an image, extract the alt text and URL
          const altText = match[1]
          const url = match[2]
          // Ask for a new URL
          const newUrl = prompt("Enter image URL:", url) || url
          newText = beforeText + `![${altText}](${newUrl})` + afterText
          newCursorPos = selectionStart + altText.length + newUrl.length + 5
        } else {
          // Not an image yet, convert to image
          newText = beforeText + `![${selectedText}](image-url)` + afterText
          newCursorPos = selectionEnd + 12
        }
      } else {
        newText = beforeText + "![alt text](image-url)" + afterText
        newCursorPos = selectionStart + 2
      }
      break

    case "unorderedList": {
      // Check if we're working with multiple lines
      if (selectedText.includes("\n")) {
        // Convert each line to a list item
        const lines = selectedText.split("\n")
        const listItems = lines
          .map((line) => {
            // Check if line is already a list item
            if (line.trim().match(/^[-*+]\s/)) {
              return line
            }
            return `- ${line}`
          })
          .join("\n")

        newText = beforeText + listItems + afterText
        newCursorPos = selectionStart + listItems.length
      } else {
        // Get the current line
        const lineStart = selectionStart === 0 ? 0 : beforeText.lastIndexOf("\n") + 1
        const lineEnd = afterText.indexOf("\n") === -1 ? text.length : selectionEnd + afterText.indexOf("\n")
        const currentLine = text.substring(lineStart, lineEnd)

        // Check if the line is already a list item
        if (currentLine.trim().match(/^[-*+]\s/)) {
          // Remove the list marker
          const newLine = currentLine.replace(/^(\s*)[-*+]\s/, "$1")
          newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd)
          newCursorPos = lineStart + newLine.length
        } else {
          // Add list marker
          newText = text.substring(0, lineStart) + "- " + currentLine + text.substring(lineEnd)
          newCursorPos = lineStart + currentLine.length + 2
        }
      }
      break
    }

    case "orderedList": {
      // Check if we're working with multiple lines
      if (selectedText.includes("\n")) {
        // Convert each line to a numbered list item
        const lines = selectedText.split("\n")
        const listItems = lines
          .map((line, i) => {
            // Check if line is already a numbered list item
            if (line.trim().match(/^\d+\.\s/)) {
              return line
            }
            return `${i + 1}. ${line}`
          })
          .join("\n")

        newText = beforeText + listItems + afterText
        newCursorPos = selectionStart + listItems.length
      } else {
        // Get the current line
        const lineStart = selectionStart === 0 ? 0 : beforeText.lastIndexOf("\n") + 1
        const lineEnd = afterText.indexOf("\n") === -1 ? text.length : selectionEnd + afterText.indexOf("\n")
        const currentLine = text.substring(lineStart, lineEnd)

        // Check if the line is already a numbered list item
        if (currentLine.trim().match(/^\d+\.\s/)) {
          // Remove the list marker
          const newLine = currentLine.replace(/^(\s*)\d+\.\s/, "$1")
          newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd)
          newCursorPos = lineStart + newLine.length
        } else {
          // Add list marker
          newText = text.substring(0, lineStart) + "1. " + currentLine + text.substring(lineEnd)
          newCursorPos = lineStart + currentLine.length + 3
        }
      }
      break
    }

    case "taskList": {
      // Check if we're working with multiple lines
      if (selectedText.includes("\n")) {
        // Convert each line to a task list item
        const lines = selectedText.split("\n")
        const listItems = lines
          .map((line) => {
            // Check if line is already a task list item
            if (line.trim().match(/^[-*+]\s\[[x ]\]\s/)) {
              return line
            }
            return `- [ ] ${line}`
          })
          .join("\n")

        newText = beforeText + listItems + afterText
        newCursorPos = selectionStart + listItems.length
      } else {
        // Get the current line
        const lineStart = selectionStart === 0 ? 0 : beforeText.lastIndexOf("\n") + 1
        const lineEnd = afterText.indexOf("\n") === -1 ? text.length : selectionEnd + afterText.indexOf("\n")
        const currentLine = text.substring(lineStart, lineEnd)

        // Check if the line is already a task list item
        if (currentLine.trim().match(/^[-*+]\s\[[x ]\]\s/)) {
          // Remove the task list marker
          const newLine = currentLine.replace(/^(\s*)[-*+]\s\[[x ]\]\s/, "$1")
          newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd)
          newCursorPos = lineStart + newLine.length
        } else {
          // Add task list marker
          newText = text.substring(0, lineStart) + "- [ ] " + currentLine + text.substring(lineEnd)
          newCursorPos = lineStart + currentLine.length + 6
        }
      }
      break
    }

    case "quote": {
      // Check if we're working with multiple lines
      if (selectedText.includes("\n")) {
        // Convert each line to a blockquote
        const lines = selectedText.split("\n")
        const quoteLines = lines
          .map((line) => {
            // Check if line is already a blockquote
            if (line.trim().startsWith(">")) {
              return line
            }
            return `> ${line}`
          })
          .join("\n")

        newText = beforeText + quoteLines + afterText
        newCursorPos = selectionStart + quoteLines.length
      } else {
        // Get the current line
        const lineStart = selectionStart === 0 ? 0 : beforeText.lastIndexOf("\n") + 1
        const lineEnd = afterText.indexOf("\n") === -1 ? text.length : selectionEnd + afterText.indexOf("\n")
        const currentLine = text.substring(lineStart, lineEnd)

        // Check if the line is already a blockquote
        if (currentLine.trim().startsWith(">")) {
          // Remove the blockquote marker
          const newLine = currentLine.replace(/^(\s*)>\s?/, "$1")
          newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd)
          newCursorPos = lineStart + newLine.length
        } else {
          // Add blockquote marker
          newText = text.substring(0, lineStart) + "> " + currentLine + text.substring(lineEnd)
          newCursorPos = lineStart + currentLine.length + 2
        }
      }
      break
    }

    case "codeBlock": {
      if (selectedText) {
        // Check if the selected text is already a code block
        if (selectedText.startsWith("```") && selectedText.endsWith("```")) {
          // Remove code block formatting
          const unformattedText = selectedText.substring(3, selectedText.length - 3).trim()
          newText = beforeText + unformattedText + afterText
          newCursorPos = selectionStart + unformattedText.length
        } else {
          // Add code block formatting
          newText = beforeText + "```\n" + selectedText + "\n```" + afterText
          newCursorPos = selectionEnd + 6
        }
      } else {
        newText = beforeText + "```\ncode block\n```" + afterText
        newCursorPos = selectionStart + 4
      }
      break
    }

    case "table": {
      const tableTemplate =
        "\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |\n"

      if (selectedText) {
        // Try to convert selected text to a table
        const lines = selectedText.split("\n").filter((line) => line.trim() !== "")

        if (lines.length >= 2) {
          // Determine the number of columns based on the first line
          const firstLineItems = lines[0].split(/\s{2,}|\t/).filter((item) => item.trim() !== "")
          const numCols = firstLineItems.length

          if (numCols >= 2) {
            // Build the table
            let tableText = "\n"

            // Header row
            tableText += "| " + firstLineItems.join(" | ") + " |\n"

            // Separator row
            tableText += "| " + Array(numCols).fill("---").join(" | ") + " |\n"

            // Data rows
            for (let i = 1; i < lines.length; i++) {
              const rowItems = lines[i].split(/\s{2,}|\t/).filter((item) => item.trim() !== "")
              // Ensure we have the right number of columns
              while (rowItems.length < numCols) rowItems.push("")
              tableText += "| " + rowItems.slice(0, numCols).join(" | ") + " |\n"
            }

            newText = beforeText + tableText + afterText
            newCursorPos = selectionStart + tableText.length
          } else {
            // Not enough columns, insert template
            newText = beforeText + tableTemplate + afterText
            newCursorPos = selectionStart + 12 // Position cursor at first header
          }
        } else {
          // Not enough rows, insert template
          newText = beforeText + tableTemplate + afterText
          newCursorPos = selectionStart + 12 // Position cursor at first header
        }
      } else {
        // No selection, insert template
        newText = beforeText + tableTemplate + afterText
        newCursorPos = selectionStart + 12 // Position cursor at first header
      }
      break
    }

    case "horizontalRule": {
      const isStartOfLine = selectionStart === 0 || text.charAt(selectionStart - 1) === "\n"
      const prefix = isStartOfLine ? "---" : "\n---"

      newText = beforeText + prefix + afterText
      newCursorPos = selectionStart + prefix.length
      break
    }
  }

  return { text: newText, newCursorPos }
}
