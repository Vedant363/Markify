"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ToolbarHelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colorTheme?: any
}

export function ToolbarHelpDialog({ open, onOpenChange, colorTheme }: ToolbarHelpDialogProps) {
  const iconClass = colorTheme ? colorTheme.icon : "text-primary"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Markdown Editor Help</DialogTitle>
          <DialogDescription>Learn how to use the markdown editor and toolbar features</DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className={`text-lg font-semibold ${iconClass}`}>Text Formatting</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Headings (H1, H2, H3):</span>
                  <span>Create section headers of different sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Bold:</span>
                  <span>Make text bold using **text** syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Italic:</span>
                  <span>Italicize text using *text* syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Inline Code:</span>
                  <span>Format text as code using `code` syntax</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold ${iconClass}`}>Lists</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Bullet List:</span>
                  <span>Create unordered lists with * or - symbols</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Numbered List:</span>
                  <span>Create ordered lists with numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Task List:</span>
                  <span>Create checkable task lists with - [ ] syntax</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold ${iconClass}`}>Content Elements</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Link:</span>
                  <span>Insert hyperlinks with [text](url) syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Image:</span>
                  <span>Insert images with ![alt text](image-url) syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Blockquote:</span>
                  <span>Create quoted text with &gt; symbol</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Code Block:</span>
                  <span>Create multi-line code blocks with ``` syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Table:</span>
                  <span>Insert formatted tables with | and - symbols</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Horizontal Rule:</span>
                  <span>Insert a dividing line with --- syntax</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold ${iconClass}`}>Editor Features</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Edit from Scratch:</span>
                  <span>Start editing with your input text as a base instead of the converted markdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Split View:</span>
                  <span>Edit markdown and see the preview side-by-side</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Undo/Redo:</span>
                  <span>Navigate through your editing history</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`text-lg font-semibold ${iconClass}`}>Tips</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Select text before clicking a formatting button to apply formatting to that text</li>
                <li>Use the preview tab to see how your markdown will look when rendered</li>
                <li>Split view is helpful when making many edits and wanting to see results immediately</li>
                <li>Click anywhere on the app to change the color theme</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
