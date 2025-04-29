"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownPreviewProps {
  markdown: string
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-primary/20 rounded mb-4"></div>
          <div className="h-4 w-64 bg-primary/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="markdown-preview prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            // For code blocks (not inline)
            if (!inline && match) {
              return (
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <pre className="relative rounded-md p-4 bg-gray-800 text-white overflow-x-auto">
                    <code className={className} {...props}>
                      {String(children).replace(/\n$/, "")}
                    </code>
                  </pre>
                </div>
              )
            }

            // For inline code - strip backticks
            const content = String(children).replace(/`/g, "")
            return (
              <code className={`${className} bg-primary/10 text-primary px-1 py-0.5 rounded`} {...props}>
                {content}
              </code>
            )
          },
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-auto min-w-[50%] border-collapse" {...props} />
              </div>
            )
          },
          th({ node, ...props }) {
            return (
              <th
                className="px-4 py-2 text-left font-medium bg-primary/20 text-foreground border border-primary/30"
                {...props}
              />
            )
          },
          td({ node, ...props }) {
            return <td className="border border-gray-200 dark:border-gray-700 px-4 py-2" {...props} />
          },
          h1({ node, ...props }) {
            return (
              <h1
                className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient"
                {...props}
              />
            )
          },
          h2({ node, ...props }) {
            return <h2 className="border-b border-primary/20 pb-1" {...props} />
          },
          a({ node, ...props }) {
            return (
              <a
                className="text-primary hover:text-primary/80 transition-colors hover:scale-105 transform inline-block"
                {...props}
              />
            )
          },
          blockquote({ node, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-primary pl-4 py-1 my-3 italic bg-primary/5 rounded-r-md hover:bg-primary/10 transition-colors"
                {...props}
              />
            )
          },
          hr({ node, ...props }) {
            return <hr className="my-6 border-t-2 border-primary/20" {...props} />
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
