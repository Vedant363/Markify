"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Copy, FileText, FileType, Code, FileCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportToPdf, exportToDocx, exportToMarkdown, exportToHtml } from "@/lib/export-utils"

interface ExportOptionsProps {
  markdown: string
  colorTheme?: any
}

export function ExportOptions({ markdown, colorTheme }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      toast({
        title: "Copied to clipboard",
        description: "Markdown has been copied to your clipboard.",
        icon: <Copy className="h-4 w-4" />,
        duration: 2500,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleExport = async (format: "pdf" | "docx" | "markdown" | "html") => {
    setIsExporting(true)
    try {
      switch (format) {
        case "pdf":
          await exportToPdf(markdown)
          break
        case "docx":
          await exportToDocx(markdown)
          break
        case "markdown":
          await exportToMarkdown(markdown)
          break
        case "html":
          await exportToHtml(markdown)
          break
      }

      toast({
        title: `Exported as ${format.toUpperCase()}`,
        description: `Your markdown has been exported as a ${format.toUpperCase()} file.`,
        icon: getFormatIcon(format),
        duration: 2500,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Failed to export as ${format.toUpperCase()}.`,
        variant: "destructive",
        duration: 2500,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    const iconClass = colorTheme ? colorTheme.icon : ""

    switch (format) {
      case "pdf":
        return <FileText className={`h-4 w-4 ${iconClass || "text-red-500"}`} />
      case "docx":
        return <FileType className={`h-4 w-4 ${iconClass || "text-blue-500"}`} />
      case "markdown":
        return <FileCode className={`h-4 w-4 ${iconClass || "text-purple-500"}`} />
      case "html":
        return <Code className={`h-4 w-4 ${iconClass || "text-orange-500"}`} />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const buttonClass = colorTheme ? `${colorTheme.border} ${colorTheme.hover}` : "border-primary/20 hover:bg-primary/5"
  const gradientClass = colorTheme
    ? `bg-gradient-to-r ${colorTheme.gradient} hover:${colorTheme.hoverGradient}`
    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
  const dropdownBgClass = colorTheme
    ? `bg-gradient-to-br ${colorTheme.lightBg} dark:${colorTheme.darkBg} ${colorTheme.border}`
    : ""

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleCopyToClipboard}
        className={`${buttonClass} transition-colors btn-shine`}
      >
        <Copy className={`mr-2 h-4 w-4 ${colorTheme?.icon || ""}`} />
        Copy
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isExporting}
            className={`${gradientClass} relative overflow-hidden group animate-pulse-slow glow-effect`}
          >
            <span className="relative flex items-center text-white">
              <Download className="mr-2 h-4 w-4 group-hover:animate-bounce-slow" />
              Export
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-40 ${dropdownBgClass}`}>
          <DropdownMenuItem
            onClick={() => handleExport("markdown")}
            className={`cursor-pointer ${colorTheme?.hover || ""}`}
          >
            <FileCode className={`mr-2 h-4 w-4 ${colorTheme?.icon || "text-purple-500"}`} />
            <span>Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("html")}
            className={`cursor-pointer ${colorTheme?.hover || ""}`}
          >
            <Code className={`mr-2 h-4 w-4 ${colorTheme?.icon || "text-orange-500"}`} />
            <span>HTML</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")} className={`cursor-pointer ${colorTheme?.hover || ""}`}>
            <FileText className={`mr-2 h-4 w-4 ${colorTheme?.icon || "text-red-500"}`} />
            <span>PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("docx")}
            className={`cursor-pointer ${colorTheme?.hover || ""}`}
          >
            <FileType className={`mr-2 h-4 w-4 ${colorTheme?.icon || "text-blue-500"}`} />
            <span>DOCX</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
