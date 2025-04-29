"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { convertToMarkdown } from "@/lib/markdown-converter"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ExportOptions } from "@/components/export-options"
import { useToast } from "@/hooks/use-toast"
import { isMarkdown } from "@/lib/detect-markdown"
import { Sparkles, FileText, Eye, Code, Wand2, HelpCircle, AlertCircle, SplitSquareVertical, Edit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MarkdownToolbar } from "@/components/markdown-toolbar"
import { applyMarkdownFormatting } from "@/lib/markdown-editor-utils"
import { useColorTheme } from "@/contexts/theme-context"
import { ToolbarHelpDialog } from "@/components/toolbar-help-dialog"

const SAMPLE_TEXT = `Markdown Syntax Guide

Headings
========

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Alternatively, for H1 and H2, an underline-ish style:

Alt-H1
======

Alt-H2
------

Emphasis

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

Lists

1. First ordered list item
2. Another item
  * Unordered sub-list.
1. Actual numbers don't matter, just that it's a number
  1. Ordered sub-list
4. And another item.

* Unordered list can use asterisks
- Or minuses
+ Or pluses

Task Lists

- [x] Complete task
- [ ] Incomplete task
- [ ] Another task

Links

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

URLs and URLs in angle brackets will automatically get turned into links. 
http://www.example.com or <http://www.example.com>

Images

Here's our logo (hover to see the title text):

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Code and Syntax Highlighting

Inline \`code\` has \`back-ticks around\` it.

\`\`\`javascript
var s = "JavaScript syntax highlighting";
alert(s);
\`\`\`

\`\`\`python
s = "Python syntax highlighting"
print(s)
\`\`\`

Tables

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

Blockquotes

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

Horizontal Rule

Three or more...

---

Hyphens

***

Asterisks

___

Underscores
`

const PLAIN_TEXT_SAMPLE = `Quarterly Business Report

This document provides an overview of our business performance for Q2 2023.

Financial Highlights:
1. Revenue increased by 15% compared to Q1
2. Operating expenses decreased by 7%
3. Net profit margin improved to 22%

Key Metrics  Q1 2023  Q2 2023  Change
Revenue      $1.2M    $1.38M   +15%
Expenses     $800K    $744K    -7%
Profit       $400K    $636K    +59%

The team has performed exceptionally well this quarter. We've seen significant improvements across all departments, with the sales team exceeding their targets by 20%.

Next Steps?
1. Expand marketing efforts in the APAC region
2. Hire additional engineering talent
3. Launch the new product line by end of Q3

Department  Budget Allocation  Utilization
Sales       $300,000          85%
Marketing   $250,000          92%
Engineering  $500,000          78%
Operations  $200,000          95%

Please review this report and provide feedback by the end of the week.`

export function Markify() {
  const [inputText, setInputText] = useState("")
  const [markdownOutput, setMarkdownOutput] = useState("")
  const [activeTab, setActiveTab] = useState("input")
  const [isMarkdownInput, setIsMarkdownInput] = useState(false)
  const [splitView, setSplitView] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { currentColorTheme, changeColorTheme } = useColorTheme()

  // History for undo/redo functionality
  const [markdownHistory, setMarkdownHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Add a new state for the glowing effect
  const [isEditTabGlowing, setIsEditTabGlowing] = useState(false)

  // Add state for toolbar help dialog
  const [showToolbarHelp, setShowToolbarHelp] = useState(false)

  // Detect if input is markdown whenever it changes
  useEffect(() => {
    if (inputText.trim()) {
      setIsMarkdownInput(isMarkdown(inputText))
    } else {
      setIsMarkdownInput(false)
    }
  }, [inputText])

  // Add to history when markdown changes
  useEffect(() => {
    if (markdownOutput && (markdownHistory.length === 0 || markdownOutput !== markdownHistory[historyIndex])) {
      // Add to history
      const newHistory =
        historyIndex >= 0 ? markdownHistory.slice(0, historyIndex + 1).concat(markdownOutput) : [markdownOutput]
      setMarkdownHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [markdownOutput])

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setMarkdownOutput(markdownHistory[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < markdownHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setMarkdownOutput(markdownHistory[newIndex])
    }
  }

  // Modify the handleConvert function to trigger the glowing effect
  const handleConvert = () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some text to convert.",
        variant: "destructive",
        duration: 2500,
      })
      return
    }

    try {
      // If it's already markdown, use it directly
      const result = isMarkdownInput ? inputText : convertToMarkdown(inputText)
      setMarkdownOutput(result)
      setActiveTab("preview")

      // Set the glowing effect for the Edit Markdown tab
      setIsEditTabGlowing(true)

      // Remove the glowing effect after 10 seconds
      setTimeout(() => {
        setIsEditTabGlowing(false)
      }, 10000)

      toast({
        title: isMarkdownInput ? "Markdown detected" : "Conversion successful",
        description: isMarkdownInput
          ? "Your input was detected as markdown and preserved."
          : "Your text has been converted to markdown. Switch to 'Edit Markdown' tab to make changes.",
        duration: 2500,
      })
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "An error occurred during processing.",
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleClear = () => {
    setInputText("")
    setMarkdownOutput("")
    setActiveTab("input")
    setIsMarkdownInput(false)
    setMarkdownHistory([])
    setHistoryIndex(-1)
  }

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT)
    setIsMarkdownInput(true)
    toast({
      title: "Sample markdown loaded",
      description: "Sample markdown syntax guide has been loaded.",
      icon: <HelpCircle className="h-4 w-4" />,
      duration: 2500,
    })
  }

  const handleLoadPlainTextSample = () => {
    setInputText(PLAIN_TEXT_SAMPLE)
    setIsMarkdownInput(false)
    toast({
      title: "Sample plain text loaded",
      description: "Sample plain text has been loaded for conversion.",
      icon: <FileText className="h-4 w-4" />,
      duration: 2500,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setInputText(newText)
  }

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value
    setMarkdownOutput(newMarkdown)
  }

  const handleToolbarAction = (action: string, options?: any) => {
    if (activeTab === "markdown" && markdownTextareaRef.current) {
      const textarea = markdownTextareaRef.current
      const selectionStart = textarea.selectionStart
      const selectionEnd = textarea.selectionEnd

      const { text: newText, newCursorPos } = applyMarkdownFormatting(
        markdownOutput,
        selectionStart,
        selectionEnd,
        action,
        options,
      )

      setMarkdownOutput(newText)

      // Set focus back to textarea and restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const toggleSplitView = () => {
    setSplitView(!splitView)
  }

  const handleEditFromScratch = () => {
    // Use the content from the input text area instead of a template
    setMarkdownOutput(inputText || "")
    toast({
      title: "Edit from scratch",
      description: "You can now edit the content from scratch.",
      icon: <Edit className="h-4 w-4" />,
      duration: 2500,
    })
  }

  // Handle click to change theme
  const handleAppClick = () => {
    changeColorTheme()
  }

  return (
    <div className="grid gap-8" onClick={handleAppClick}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`p-6 shadow-md border-0 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} h-full`}
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`bg-${currentColorTheme.name}-500/20 p-3 rounded-full mb-3 animate-pulse`}>
              <FileText className={`h-6 w-6 ${currentColorTheme.icon}`} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Paste Text or Markdown</h3>
            <p className="text-sm text-muted-foreground">Paste your content and we'll detect the format</p>
          </div>
        </Card>
        <Card
          className={`p-6 shadow-md border-0 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} h-full`}
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`bg-${currentColorTheme.name}-500/20 p-3 rounded-full mb-3`}>
              <Wand2 className={`h-6 w-6 ${currentColorTheme.icon} animate-spin-slow`} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Processing</h3>
            <p className="text-sm text-muted-foreground">We'll preserve markdown or format plain text</p>
          </div>
        </Card>
        <Card
          className={`p-6 shadow-md border-0 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} h-full`}
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`bg-${currentColorTheme.name}-500/20 p-3 rounded-full mb-3`}>
              <Sparkles className={`h-6 w-6 ${currentColorTheme.icon} animate-sparkle`} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Beautiful Markdown</h3>
            <p className="text-sm text-muted-foreground">Get perfectly formatted markdown ready to use</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className={`bg-gradient-to-r ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} p-2`}>
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger
                value="input"
                className={`data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all`}
              >
                <FileText className={`h-4 w-4 mr-2 ${currentColorTheme.icon}`} />
                Input
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={!markdownOutput}
                className={`data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all`}
              >
                <Eye className={`h-4 w-4 mr-2 ${currentColorTheme.icon}`} />
                Preview
              </TabsTrigger>
              {/* Modify the TabsTrigger for the "markdown" tab to include the glowing effect */}
              <TabsTrigger
                value="markdown"
                disabled={!markdownOutput}
                className={`data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md transition-all ${
                  isEditTabGlowing ? "edit-tab-glowing" : ""
                }`}
                onClick={() => setIsEditTabGlowing(false)}
              >
                <Code className={`h-4 w-4 mr-2 ${currentColorTheme.icon}`} />
                Edit Markdown
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="input" className="m-0">
            <CardContent className="p-0">
              {isMarkdownInput && inputText.trim() && (
                <Alert
                  className={`m-4 bg-${currentColorTheme.name}-50 dark:bg-${currentColorTheme.name}-900/20 ${currentColorTheme.border}`}
                >
                  <AlertCircle className={`h-4 w-4 ${currentColorTheme.icon}`} />
                  <AlertTitle>Markdown Detected</AlertTitle>
                  <AlertDescription>
                    Your input appears to be markdown. It will be preserved as-is when processed.
                  </AlertDescription>
                </Alert>
              )}
              <Textarea
                ref={textareaRef}
                placeholder="Paste your text or markdown here..."
                className="min-h-[400px] font-mono text-sm border focus:border-primary/50 transition-all p-4 resize-none w-[calc(100%-20px)] mx-auto"
                value={inputText}
                onChange={handleInputChange}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="preview" className="m-0">
            <CardContent className="p-6 min-h-[400px]">
              <MarkdownPreview markdown={markdownOutput} />
            </CardContent>
          </TabsContent>
          <TabsContent value="markdown" className="m-0">
            <CardContent className="p-0">
              <div
                className={`bg-gradient-to-r ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} px-4 py-2 text-sm text-muted-foreground border-b flex justify-between items-center`}
              >
                <span>Use the toolbar below to format your markdown.</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditFromScratch}
                    className={`flex items-center gap-1 ${currentColorTheme.hover} transition-colors btn-shine`}
                  >
                    <Edit className={`h-4 w-4 ${currentColorTheme.icon}`} />
                    Edit from Scratch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSplitView}
                    className={`flex items-center gap-1 ${currentColorTheme.hover} transition-colors btn-shine`}
                  >
                    <SplitSquareVertical className={`h-4 w-4 ${currentColorTheme.icon}`} />
                    {splitView ? "Exit Split View" : "Split View"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowToolbarHelp(true)}
                    className={`flex items-center gap-1 ${currentColorTheme.hover} transition-colors btn-shine`}
                  >
                    <HelpCircle className={`h-4 w-4 ${currentColorTheme.icon}`} />
                  </Button>
                </div>
              </div>
              <MarkdownToolbar
                onAction={handleToolbarAction}
                onUndo={historyIndex > 0 ? handleUndo : undefined}
                onRedo={historyIndex < markdownHistory.length - 1 ? handleRedo : undefined}
                colorTheme={currentColorTheme}
              />

              {splitView ? (
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 border-r">
                    {/* For the split view textarea */}
                    <Textarea
                      ref={markdownTextareaRef}
                      className="min-h-[400px] font-mono text-sm border-0 rounded-none focus:border-primary/50 transition-all h-full resize-none"
                      value={markdownOutput}
                      onChange={handleMarkdownChange}
                    />
                  </div>
                  <div className="md:w-1/2 p-4 overflow-auto max-h-[400px]">
                    <MarkdownPreview markdown={markdownOutput} />
                  </div>
                </div>
              ) : (
                /* For the regular textarea */
                <Textarea
                  ref={markdownTextareaRef}
                  className="min-h-[400px] font-mono text-sm border-0 rounded-none focus:border-primary/50 transition-all resize-none"
                  value={markdownOutput}
                  onChange={handleMarkdownChange}
                />
              )}
            </CardContent>
          </TabsContent>
        </Tabs>

        <div
          className={`flex flex-wrap gap-4 justify-between p-4 bg-gradient-to-r ${currentColorTheme.lightBg} dark:${currentColorTheme.darkBg} border-t m-[10px]`}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleConvert}
              disabled={!inputText.trim()}
              className={`relative overflow-hidden group animate-pulse-slow glow-effect bg-gradient-to-r ${currentColorTheme.gradient} hover:${currentColorTheme.hoverGradient}`}
            >
              <span className="relative flex items-center text-white">
                <Wand2 className="mr-2 h-4 w-4" />
                {isMarkdownInput ? "Process Markdown" : "Convert to Markdown"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors btn-shine"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={handleLoadSample}
              className={`${currentColorTheme.border} ${currentColorTheme.hover} transition-colors btn-shine`}
            >
              <HelpCircle className={`mr-2 h-4 w-4 ${currentColorTheme.icon}`} />
              Load Markdown
            </Button>
            <Button
              variant="outline"
              onClick={handleLoadPlainTextSample}
              className={`${currentColorTheme.border} ${currentColorTheme.hover} transition-colors btn-shine`}
            >
              <FileText className={`mr-2 h-4 w-4 ${currentColorTheme.icon}`} />
              Load Plain Text
            </Button>
          </div>
          {markdownOutput && <ExportOptions markdown={markdownOutput} colorTheme={currentColorTheme} />}
        </div>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground animate-pulse"></p>
      </div>
      {/* Add the toolbar help dialog */}
      <ToolbarHelpDialog open={showToolbarHelp} onOpenChange={setShowToolbarHelp} colorTheme={currentColorTheme} />
    </div>
  )
}
