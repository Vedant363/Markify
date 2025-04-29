"use client"

import { Button } from "@/components/ui/button"
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Table,
  Minus,
  Undo,
  Redo,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface MarkdownToolbarProps {
  onAction: (action: string, options?: any) => void
  onUndo?: () => void
  onRedo?: () => void
  colorTheme?: any
}

export function MarkdownToolbar({ onAction, onUndo, onRedo, colorTheme }: MarkdownToolbarProps) {
  const handleAction = (action: string, options?: any) => {
    onAction(action, options)
  }

  const iconClass = colorTheme ? colorTheme.icon : "text-primary"
  const hoverClass = colorTheme ? colorTheme.hover : "hover:bg-muted"
  const bgClass = colorTheme ? `bg-gradient-to-r ${colorTheme.lightBg} dark:${colorTheme.darkBg}` : "bg-muted/50"

  return (
    <div className={`flex items-center gap-1 p-1 ${bgClass} border-b overflow-x-auto`}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={onUndo}
          disabled={!onUndo}
          title="Undo"
        >
          <Undo className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={onRedo}
          disabled={!onRedo}
          title="Redo"
        >
          <Redo className={`h-4 w-4 ${iconClass}`} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className={`h-4 w-4 ${iconClass}`} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("bold")}
          title="Bold"
        >
          <Bold className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("italic")}
          title="Italic"
        >
          <Italic className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("code")}
          title="Inline Code"
        >
          <Code className={`h-4 w-4 ${iconClass}`} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("link")}
          title="Link"
        >
          <Link className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("image")}
          title="Image"
        >
          <ImageIcon className={`h-4 w-4 ${iconClass}`} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("unorderedList")}
          title="Bullet List"
        >
          <List className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("taskList")}
          title="Task List"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 ${iconClass}`}
          >
            <rect x="3" y="5" width="6" height="6" rx="1" />
            <path d="m3 17 2 2 4-4" />
            <path d="M13 6h8" />
            <path d="M13 12h8" />
            <path d="M13 18h8" />
          </svg>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("quote")}
          title="Blockquote"
        >
          <Quote className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("codeBlock")}
          title="Code Block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 ${iconClass}`}
          >
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h10" />
            <path d="M3 8h1" />
            <path d="M3 12h1" />
            <path d="M3 16h1" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("table")}
          title="Table"
        >
          <Table className={`h-4 w-4 ${iconClass}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hoverClass}`}
          onClick={() => handleAction("horizontalRule")}
          title="Horizontal Rule"
        >
          <Minus className={`h-4 w-4 ${iconClass}`} />
        </Button>
      </div>
    </div>
  )
}
