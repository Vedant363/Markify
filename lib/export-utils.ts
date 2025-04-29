import { jsPDF } from "jspdf"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  type HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  UnderlineType,
  ExternalHyperlink,
  HeadingLevel as DocxHeadingLevel,
} from "docx"
import { marked } from "marked"
import html2canvas from "html2canvas"

/**export async function exportToPdf(markdown: string): Promise<void> {
  try {
    // Convert markdown to HTML
    const html = marked(markdown)

    // Create a temporary container to render the HTML
    const container = document.createElement("div")
    container.className = "markdown-preview prose prose-slate max-w-none"
    container.innerHTML = html
    container.style.width = "800px"
    container.style.padding = "40px"
    container.style.backgroundColor = "white"
    container.style.color = "black"
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "-9999px"

    // Add custom styles for PDF rendering
    const style = document.createElement("style")
    style.textContent = `
      .markdown-preview h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #7c3aed; }
      .markdown-preview h2 { font-size: 20px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
      .markdown-preview h3 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
      .markdown-preview p { margin-bottom: 16px; }
      .markdown-preview ul, .markdown-preview ol { padding-left: 24px; margin-bottom: 16px; }
      .markdown-preview li { margin-bottom: 4px; }
      .markdown-preview code { font-family: monospace; background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
      .markdown-preview pre { background-color: #1e293b; color: white; padding: 16px; border-radius: 4px; overflow-x: auto; margin-bottom: 16px; }
      .markdown-preview pre code { background-color: transparent; color: white; padding: 0; }
      .markdown-preview blockquote { border-left: 4px solid #7c3aed; padding-left: 16px; margin-left: 0; color: #6b7280; background-color: #f9fafb; }
      .markdown-preview table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      .markdown-preview table th { background-color: #f3f4f6; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #e5e7eb; }
      .markdown-preview table td { padding: 8px; border: 1px solid #e5e7eb; }
      .markdown-preview img { max-width: 100%; }
      .markdown-preview hr { border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    `
    container.appendChild(style)

    document.body.appendChild(container)

    // Use html2canvas to render the HTML to a canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    })

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Calculate the PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate the aspect ratio of the canvas
    const canvasAspectRatio = canvas.height / canvas.width

    // Calculate the width and height of the image in the PDF
    const imgWidth = pdfWidth - 20 // 10mm margin on each side
    const imgHeight = imgWidth * canvasAspectRatio

    // If the image is taller than the page, we need to split it across multiple pages
    const totalHeight = canvas.height
    const pageHeight = (pdfHeight - 20) * (canvas.width / imgWidth) // Convert PDF height to canvas height
    const pageCount = Math.ceil(totalHeight / pageHeight)

    // For each page
    for (let i = 0; i < pageCount; i++) {
      // Add a new page if we're not on the first page
      if (i > 0) {
        pdf.addPage()
      }

      // Calculate the portion of the canvas to use for this page
      const sourceY = i * pageHeight
      const sourceHeight = Math.min(pageHeight, totalHeight - sourceY)

      // Add the canvas image to the PDF
      pdf.addImage(
        canvas,
        "PNG",
        10, // x position (10mm from left)
        10, // y position (10mm from top)
        imgWidth,
        (sourceHeight * imgWidth) / canvas.width,
        "",
        "FAST",
        0,
        -sourceY * (imgWidth / canvas.width),
      )
    }

    // Clean up
    document.body.removeChild(container)

    // Save the PDF
    pdf.save("markify-export.pdf")
  } catch (error) {
    console.error("Error exporting to PDF:", error)

    // Fallback to the original method if the HTML approach fails
    exportToPdfFallback(markdown)
  }
}**/

//New function
export async function exportToPdf(markdown: string): Promise<void> {
  try {
    // 1. Render Markdown → HTML
    const html = marked(markdown)

    // 2. Build off-screen container
    const container = document.createElement("div")
    container.className = "markdown-preview prose prose-slate max-w-none"
    container.innerHTML = html
    Object.assign(container.style, {
      width: "800px",
      padding: "40px",
      backgroundColor: "white",
      color: "black",
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
    })
    // your existing CSS…
    const style = document.createElement("style")
    style.textContent = `
      .markdown-preview h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #7c3aed; }
      /* … all the rest of your styles … */
    `
    container.appendChild(style)
    document.body.appendChild(container)

    // 3. Grab it as one big high-res canvas
    const fullCanvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    // 4. Clean up
    document.body.removeChild(container)

    // 5. Set up jsPDF
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const margin = 10 // mm
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const availW = pageW - margin * 2
    const availH = pageH - margin * 2

    // 6. Figure out how many pixels tall each PDF‐page slice is
    //    (we scale widths to availW, so scaleX = mm-per-px)
    const scaleX = availW / fullCanvas.width
    const sliceHpx = Math.floor(availH / scaleX)
    const totalPages = Math.ceil(fullCanvas.height / sliceHpx)

    // 7. For each page, copy the right slice into a tiny canvas and add it
    for (let page = 0; page < totalPages; page++) {
      const srcY = page * sliceHpx
      const thisHpx = Math.min(sliceHpx, fullCanvas.height - srcY)
      if (thisHpx <= 0) break

      // 7a. Make slice‐canvas
      const pageCanvas = document.createElement("canvas")
      pageCanvas.width = fullCanvas.width
      pageCanvas.height = thisHpx
      const ctx = pageCanvas.getContext("2d")!
      ctx.drawImage(
        fullCanvas,
        0,
        srcY,
        fullCanvas.width,
        thisHpx, // source rect
        0,
        0,
        fullCanvas.width,
        thisHpx, // dest rect
      )

      // 7b. Compute its mm height on the PDF
      const destHmm = thisHpx * scaleX

      // 7c. New page if needed
      if (page > 0) pdf.addPage()

      // 7d. Draw it
      pdf.addImage(
        pageCanvas,
        "PNG",
        margin, // x mm
        margin, // y mm
        availW, // width mm
        destHmm, // height mm
      )
    }

    // 8. Done
    pdf.save("markify-export.pdf")
  } catch (err) {
    console.error("PDF export failed:", err)
    exportToPdfFallback(markdown)
  }
}

// Fallback method using the original approach
export async function exportToPdfFallback(markdown: string): Promise<void> {
  // Create a new PDF document
  const doc = new jsPDF()

  // Convert markdown to a format suitable for PDF
  const { text, structure } = parseMarkdownForExport(markdown)

  // Add text to the PDF with formatting
  let y = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const textWidth = pageWidth - margin * 2

  structure.forEach((block) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    switch (block.type) {
      case "heading":
        // Set font size based on heading level
        const fontSize = 22 - (block.level || 1) * 2
        doc.setFontSize(fontSize)
        doc.setFont("helvetica", "bold")
        doc.text(block.content, margin, y)
        y += fontSize / 2 + 10
        break

      case "paragraph":
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")

        // Handle text wrapping
        const lines = doc.splitTextToSize(block.content, textWidth)
        doc.text(lines, margin, y)
        y += lines.length * 7
        break

      case "list":
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        block.items.forEach((item, index) => {
          const prefix = block.ordered ? `${index + 1}. ` : "• "
          const itemText = prefix + item
          const lines = doc.splitTextToSize(itemText, textWidth - 5)
          doc.text(lines, margin, y)
          y += lines.length * 7
        })
        break

      case "code":
        doc.setFontSize(10)
        doc.setFont("courier", "normal")
        doc.setDrawColor(200, 200, 200)
        doc.setFillColor(245, 245, 245)

        const codeLines = block.content.split("\n")
        const codeHeight = codeLines.length * 6 + 10

        // Draw code block background
        doc.rect(margin - 5, y - 5, textWidth + 10, codeHeight, "FD")

        // Add code text
        codeLines.forEach((line, index) => {
          doc.text(line, margin, y + index * 6)
        })

        y += codeHeight + 5
        break

      case "hr":
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10
        break

      case "table":
        // Simple table rendering
        const tableRows = block.rows
        const cellPadding = 5
        const cellHeight = 10
        const colWidths = Array(tableRows[0].length).fill(textWidth / tableRows[0].length)

        tableRows.forEach((row, rowIndex) => {
          // Header row gets a different style
          if (rowIndex === 0) {
            doc.setFillColor(240, 240, 240)
            doc.setFont("helvetica", "bold")
          } else {
            doc.setFillColor(255, 255, 255)
            doc.setFont("helvetica", "normal")
          }

          // Draw cells
          row.forEach((cell, colIndex) => {
            const x = margin + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0)

            // Cell background
            doc.rect(x, y, colWidths[colIndex], cellHeight, "FD")

            // Cell text
            doc.text(cell, x + cellPadding, y + cellHeight - cellPadding)
          })

          y += cellHeight
        })

        y += 10
        break
    }

    // Add some spacing between blocks
    y += 5
  })

  // Save the PDF
  doc.save("markify-export.pdf")
}

export async function exportToDocx(markdown: string): Promise<void> {
  try {
    // Convert markdown to HTML
    const html = marked(markdown)

    // Parse the HTML to create structured content for DOCX
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // Create document sections
    const children = []

    // Process each element in the HTML
    Array.from(doc.body.children).forEach((element) => {
      switch (element.tagName.toLowerCase()) {
        case "h1":
          children.push(
            new Paragraph({
              text: element.textContent,
              heading: DocxHeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
          )
          break

        case "h2":
          children.push(
            new Paragraph({
              text: element.textContent,
              heading: DocxHeadingLevel.HEADING_2,
              spacing: { after: 200 },
            }),
          )
          break

        case "h3":
          children.push(
            new Paragraph({
              text: element.textContent,
              heading: DocxHeadingLevel.HEADING_3,
              spacing: { after: 200 },
            }),
          )
          break

        case "p":
          children.push(
            new Paragraph({
              children: [new TextRun(element.textContent)],
              spacing: { after: 200 },
            }),
          )
          break

        case "ul":
        case "ol":
          Array.from(element.children).forEach((li, index) => {
            children.push(
              new Paragraph({
                text: li.textContent,
                bullet: {
                  level: 0,
                },
                spacing: { after: 120 },
              }),
            )
          })
          break

        case "pre":
          const codeElement = element.querySelector("code")
          if (codeElement) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeElement.textContent,
                    font: "Courier New",
                    size: 20,
                  }),
                ],
                spacing: { before: 240, after: 240 },
                shading: {
                  type: "clear",
                  fill: "F0F0F0",
                },
              }),
            )
          }
          break

        case "blockquote":
          children.push(
            new Paragraph({
              text: element.textContent,
              border: {
                left: {
                  color: "7C3AED",
                  space: 12,
                  style: BorderStyle.SINGLE,
                  size: 8,
                },
              },
              spacing: { before: 240, after: 240 },
              indent: { left: 240 },
            }),
          )
          break

        case "table":
          const tableRows = []
          const tableHeader = element.querySelector("thead")
          const tableBody = element.querySelector("tbody")

          if (tableHeader) {
            const headerRow = tableHeader.querySelector("tr")
            if (headerRow) {
              const cells = Array.from(headerRow.querySelectorAll("th")).map((th) => {
                return new TableCell({
                  children: [new Paragraph(th.textContent)],
                  shading: {
                    type: "clear",
                    fill: "F3F4F6",
                  },
                })
              })

              tableRows.push(new TableRow({ children: cells }))
            }
          }

          if (tableBody) {
            Array.from(tableBody.querySelectorAll("tr")).forEach((tr) => {
              const cells = Array.from(tr.querySelectorAll("td")).map((td) => {
                return new TableCell({
                  children: [new Paragraph(td.textContent)],
                })
              })

              tableRows.push(new TableRow({ children: cells }))
            })
          }

          if (tableRows.length > 0) {
            children.push(
              new Table({
                rows: tableRows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              }),
            )
          }
          break

        case "hr":
          children.push(
            new Paragraph({
              text: "",
              border: {
                bottom: {
                  color: "E5E7EB",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: { before: 240, after: 240 },
            }),
          )
          break
      }
    })

    // Create a new DOCX document
    const docx = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })

    // Generate the DOCX file
    const blob = await Packer.toBlob(docx)

    // Create a download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "markify-export.docx"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting to DOCX:", error)

    // Fallback to the original method if the HTML approach fails
    exportToDocxFallback(markdown)
  }
}

// Fallback method using the original approach
export async function exportToDocxFallback(markdown: string): Promise<void> {
  // Parse markdown for structured content
  const { structure } = parseMarkdownForExport(markdown)

  // Create document sections
  const children = []

  // Process each block
  structure.forEach((block) => {
    switch (block.type) {
      case "heading":
        children.push(
          new Paragraph({
            text: block.content,
            heading: `Heading${block.level}` as keyof typeof HeadingLevel,
            spacing: { after: 120 },
          }),
        )
        break

      case "paragraph":
        children.push(
          new Paragraph({
            children: parseInlineFormatting(block.content),
            spacing: { after: 200 },
          }),
        )
        break

      case "list":
        block.items.forEach((item, i) => {
          children.push(
            new Paragraph({
              text: item,
              bullet: {
                level: 0,
              },
              spacing: { after: 120 },
            }),
          )
        })
        break

      case "code":
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                font: "Courier New",
                size: 20,
              }),
            ],
            spacing: { before: 240, after: 240 },
            shading: {
              type: "clear",
              fill: "F0F0F0",
            },
          }),
        )
        break

      case "hr":
        children.push(
          new Paragraph({
            text: "",
            border: {
              bottom: {
                color: "999999",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 240, after: 240 },
          }),
        )
        break

      case "table":
        const rows = block.rows.map((row) => {
          return new TableRow({
            children: row.map((cell) => {
              return new TableCell({
                children: [new Paragraph(cell)],
                width: {
                  size: 100 / row.length,
                  type: WidthType.PERCENTAGE,
                },
              })
            }),
          })
        })

        children.push(
          new Table({
            rows: rows,
          }),
        )
        break
    }
  })

  // Create a new DOCX document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  })

  // Generate the DOCX file
  const blob = await Packer.toBlob(doc)

  // Create a download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "markify-export.docx"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// New function to export as markdown
export async function exportToMarkdown(markdown: string): Promise<void> {
  // Create a blob with the markdown content
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })

  // Create a download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "markify-export.md"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// New function to export as HTML
export async function exportToHtml(markdown: string): Promise<void> {
  // Convert markdown to HTML using marked
  const html = marked(markdown)

  // Add basic styling
  const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markify Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    code {
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
      background-color: rgba(124, 58, 237, 0.1);
      color: #7c3aed;
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
      color: #f8fafc;
    }
    
    /* Language-specific syntax highlighting */
    .language-javascript, .language-js {
      color: #fde047;
    }
    
    .language-typescript, .language-ts {
      color: #93c5fd;
    }
    
    .language-html {
      color: #fdba74;
    }
    
    .language-css {
      color: #f9a8d4;
    }
    
    .language-python {
      color: #86efac;
    }
    
    .language-json {
      color: #fef08a;
    }
    
    .language-markdown, .language-md {
      color: #d8b4fe;
    }
    
    blockquote {
      border-left: 4px solid #7c3aed;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
      background-color: rgba(124, 58, 237, 0.05);
      border-radius: 0 4px 4px 0;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    
    table, th, td {
      border: 1px solid #ddd;
    }
    
    th, td {
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: rgba(124, 58, 237, 0.1);
    }
    
    img {
      max-width: 100%;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 {
      font-size: 2em;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.3em;
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid rgba(124, 58, 237, 0.2);
      padding-bottom: 0.3em;
    }
    
    h3 {
      font-size: 1.25em;
    }
    
    h4 {
      font-size: 1em;
    }
    
    h5 {
      font-size: 0.875em;
    }
    
    h6 {
      font-size: 0.85em;
      color: #777;
    }
    
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: rgba(124, 58, 237, 0.2);
      border: 0;
    }
    
    input[type="checkbox"] {
      margin-right: 0.5em;
    }
    
    a {
      color: #7c3aed;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a;
        color: #f0f0f0;
      }
      
      code {
        background-color: rgba(124, 58, 237, 0.2);
      }
      
      blockquote {
        color: #a0a0a0;
        background-color: rgba(124, 58, 237, 0.1);
      }
      
      table, th, td {
        border-color: #444;
      }
      
      th {
        background-color: rgba(124, 58, 237, 0.2);
      }
      
      h1 {
        border-bottom-color: #444;
      }
      
      h2 {
        border-bottom-color: rgba(124, 58, 237, 0.3);
      }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `

  // Create a blob with the HTML content
  const blob = new Blob([styledHtml], { type: "text/html;charset=utf-8" })

  // Create a download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "markify-export.html"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper function to parse markdown into structured content for export
function parseMarkdownForExport(markdown: string) {
  const lines = markdown.split("\n")
  const structure = []
  let currentBlock = null
  let plainText = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    plainText += line + "\n"

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      if (currentBlock) structure.push(currentBlock)
      currentBlock = {
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      }
      structure.push(currentBlock)
      currentBlock = null
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (currentBlock) structure.push(currentBlock)
      structure.push({ type: "hr" })
      currentBlock = null
      continue
    }

    // Code block start/end
    if (line.trim().startsWith("```")) {
      if (currentBlock && currentBlock.type === "code") {
        // End of code block
        structure.push(currentBlock)
        currentBlock = null
      } else {
        // Start of code block
        if (currentBlock) structure.push(currentBlock)
        currentBlock = {
          type: "code",
          content: "",
        }
      }
      continue
    }

    // Inside code block
    if (currentBlock && currentBlock.type === "code") {
      currentBlock.content += line + "\n"
      continue
    }

    // Table row
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .filter((cell, index, array) => index !== 0 || cell !== "")
        .filter((cell, index, array) => index !== array.length - 1 || cell !== "")
        .map((cell) => cell.trim())

      if (cells.length > 1) {
        // Check if this is a table separator row
        if (cells.every((cell) => /^[-:]+$/.test(cell))) {
          continue // Skip separator rows
        }

        // If we're not already in a table, start one
        if (!currentBlock || currentBlock.type !== "table") {
          if (currentBlock) structure.push(currentBlock)
          currentBlock = {
            type: "table",
            rows: [],
          }
        }

        currentBlock.rows.push(cells)
        continue
      }
    }

    // List item
    const listMatch = line.match(/^(\s*)([*+-]|\d+\.)\s+(.+)$/)
    if (listMatch) {
      const [, indent, marker, content] = listMatch
      const isOrdered = /\d+\./.test(marker)

      if (!currentBlock || currentBlock.type !== "list" || currentBlock.ordered !== isOrdered) {
        if (currentBlock) structure.push(currentBlock)
        currentBlock = {
          type: "list",
          ordered: isOrdered,
          items: [content],
        }
      } else {
        currentBlock.items.push(content)
      }
      continue
    }

    // Empty line - end current block
    if (line.trim() === "") {
      if (currentBlock) {
        structure.push(currentBlock)
        currentBlock = null
      }
      continue
    }

    // Paragraph
    if (!currentBlock) {
      currentBlock = {
        type: "paragraph",
        content: line,
      }
    } else if (currentBlock.type === "paragraph") {
      currentBlock.content += " " + line
    } else {
      structure.push(currentBlock)
      currentBlock = {
        type: "paragraph",
        content: line,
      }
    }
  }

  // Add the last block if there is one
  if (currentBlock) {
    structure.push(currentBlock)
  }

  return { text: plainText, structure }
}

// Helper function to parse inline formatting for DOCX
function parseInlineFormatting(text: string) {
  const runs = []
  let currentText = ""
  let isBold = false
  let isItalic = false
  let isCode = false

  // Simple parser for basic formatting
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "*" || text[i] === "_") {
      // Check for bold
      if (i + 1 < text.length && (text[i + 1] === "*" || text[i + 1] === "_")) {
        if (currentText) {
          runs.push(
            new TextRun({
              text: currentText,
              bold: isBold,
              italics: isItalic,
            }),
          )
          currentText = ""
        }
        isBold = !isBold
        i++ // Skip the second * or _
      } else {
        // Italic
        if (currentText) {
          runs.push(
            new TextRun({
              text: currentText,
              bold: isBold,
              italics: isItalic,
            }),
          )
          currentText = ""
        }
        isItalic = !isItalic
      }
    } else if (text[i] === "`") {
      // Code
      if (currentText) {
        runs.push(
          new TextRun({
            text: currentText,
            bold: isBold,
            italics: isItalic,
          }),
        )
        currentText = ""
      }
      isCode = !isCode

      // If we're starting code, collect until the next backtick
      if (isCode) {
        const codeEnd = text.indexOf("`", i + 1)
        if (codeEnd !== -1) {
          const code = text.substring(i + 1, codeEnd)
          runs.push(
            new TextRun({
              text: code,
              font: "Courier New",
              size: 20,
            }),
          )
          i = codeEnd
          isCode = false
        }
      }
    } else if (text.substring(i, i + 2) === "](") {
      // Link - find the closing parenthesis
      const linkTextStart = text.lastIndexOf("[", i)
      if (linkTextStart !== -1) {
        const linkText = text.substring(linkTextStart + 1, i)
        const linkEnd = text.indexOf(")", i)
        if (linkEnd !== -1) {
          const url = text.substring(i + 2, linkEnd)

          // Add text before the link
          if (currentText) {
            runs.push(
              new TextRun({
                text: currentText,
                bold: isBold,
                italics: isItalic,
              }),
            )
            currentText = ""
          }

          // Add the link
          runs.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: linkText,
                  style: "Hyperlink",
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                }),
              ],
              link: url,
            }),
          )

          i = linkEnd
        }
      } else {
        currentText += text[i]
      }
    } else {
      currentText += text[i]
    }
  }

  // Add any remaining text
  if (currentText) {
    runs.push(
      new TextRun({
        text: currentText,
        bold: isBold,
        italics: isItalic,
      }),
    )
  }

  return runs
}
