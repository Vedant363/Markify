"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useColorTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { currentColorTheme } = useColorTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex items-center space-x-2 bg-background/80 dark:bg-gray-800 backdrop-blur-sm rounded-full px-3 py-1.5 border dark:border-gray-600 shadow-sm">
      <Sun className={`h-[1.2rem] w-[1.2rem] ${isDark ? "text-yellow-500" : currentColorTheme.icon}`} />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        className={`data-[state=checked]:bg-${currentColorTheme.name}-600`}
      />
      <Moon className={`h-[1.2rem] w-[1.2rem] ${isDark ? currentColorTheme.icon : "text-gray-400"}`} />
    </div>
  )
}
