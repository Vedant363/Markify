import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ColorThemeProvider } from "@/contexts/theme-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Markify - Text & Markdown Processor",
  description: "Transform plain text into beautiful markdown or process existing markdown with intelligent formatting.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ColorThemeProvider>
            {children}
            <footer className="bg-muted/30 border-t py-4 mt-8">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Markify - Transform plain text into beautiful markdown
                </p>
              </div>
            </footer>
            <Toaster />
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
