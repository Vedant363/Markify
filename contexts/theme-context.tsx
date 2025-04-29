"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// VIBGYOR color themes
export const colorThemes = {
  violet: {
    primary: "hsl(270, 70%, 60%)",
    secondary: "hsl(280, 70%, 70%)",
    accent: "hsl(260, 70%, 50%)",
    muted: "hsl(270, 20%, 90%)",
    mutedForeground: "hsl(270, 30%, 40%)",
    gradient: "from-violet-600 to-purple-600",
    hoverGradient: "from-violet-700 to-purple-700",
    lightBg: "from-violet-50 to-purple-100",
    darkBg: "from-violet-900/20 to-purple-900/30",
    border: "border-violet-200 dark:border-violet-800",
    hover: "hover:bg-violet-100 dark:hover:bg-violet-900/30",
    icon: "text-violet-600 dark:text-violet-400",
    name: "violet",
  },
  indigo: {
    primary: "hsl(240, 70%, 60%)",
    secondary: "hsl(250, 70%, 70%)",
    accent: "hsl(230, 70%, 50%)",
    muted: "hsl(240, 20%, 90%)",
    mutedForeground: "hsl(240, 30%, 40%)",
    gradient: "from-indigo-600 to-blue-600",
    hoverGradient: "from-indigo-700 to-blue-700",
    lightBg: "from-indigo-50 to-blue-100",
    darkBg: "from-indigo-900/20 to-blue-900/30",
    border: "border-indigo-200 dark:border-indigo-800",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
    icon: "text-indigo-600 dark:text-indigo-400",
    name: "indigo",
  },
  blue: {
    primary: "hsl(210, 70%, 60%)",
    secondary: "hsl(220, 70%, 70%)",
    accent: "hsl(200, 70%, 50%)",
    muted: "hsl(210, 20%, 90%)",
    mutedForeground: "hsl(210, 30%, 40%)",
    gradient: "from-blue-600 to-cyan-600",
    hoverGradient: "from-blue-700 to-cyan-700",
    lightBg: "from-blue-50 to-cyan-100",
    darkBg: "from-blue-900/20 to-cyan-900/30",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    name: "blue",
  },
  green: {
    primary: "hsl(150, 70%, 50%)",
    secondary: "hsl(160, 70%, 60%)",
    accent: "hsl(140, 70%, 40%)",
    muted: "hsl(150, 20%, 90%)",
    mutedForeground: "hsl(150, 30%, 40%)",
    gradient: "from-green-600 to-emerald-600",
    hoverGradient: "from-green-700 to-emerald-700",
    lightBg: "from-green-50 to-emerald-100",
    darkBg: "from-green-900/20 to-emerald-900/30",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400",
    name: "green",
  },
  yellow: {
    primary: "hsl(45, 90%, 50%)",
    secondary: "hsl(40, 90%, 60%)",
    accent: "hsl(50, 90%, 45%)",
    muted: "hsl(45, 30%, 90%)",
    mutedForeground: "hsl(45, 30%, 40%)",
    gradient: "from-yellow-500 to-amber-500",
    hoverGradient: "from-yellow-600 to-amber-600",
    lightBg: "from-yellow-50 to-amber-100",
    darkBg: "from-yellow-900/20 to-amber-900/30",
    border: "border-yellow-200 dark:border-yellow-800",
    hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
    icon: "text-yellow-600 dark:text-yellow-400",
    name: "yellow",
  },
  orange: {
    primary: "hsl(25, 90%, 55%)",
    secondary: "hsl(30, 90%, 65%)",
    accent: "hsl(20, 90%, 50%)",
    muted: "hsl(25, 30%, 90%)",
    mutedForeground: "hsl(25, 30%, 40%)",
    gradient: "from-orange-500 to-amber-500",
    hoverGradient: "from-orange-600 to-amber-600",
    lightBg: "from-orange-50 to-amber-100",
    darkBg: "from-orange-900/20 to-amber-900/30",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
    icon: "text-orange-600 dark:text-orange-400",
    name: "orange",
  },
  red: {
    primary: "hsl(0, 80%, 60%)",
    secondary: "hsl(10, 80%, 70%)",
    accent: "hsl(350, 80%, 50%)",
    muted: "hsl(0, 20%, 90%)",
    mutedForeground: "hsl(0, 30%, 40%)",
    gradient: "from-red-600 to-rose-600",
    hoverGradient: "from-red-700 to-rose-700",
    lightBg: "from-red-50 to-rose-100",
    darkBg: "from-red-900/20 to-rose-900/30",
    border: "border-red-200 dark:border-red-800",
    hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
    icon: "text-red-600 dark:text-red-400",
    name: "red",
  },
}

export type ColorTheme = keyof typeof colorThemes
export type ThemeContextType = {
  currentColorTheme: (typeof colorThemes)[ColorTheme]
  changeColorTheme: (theme?: ColorTheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>("violet")

  // Function to randomly select a theme
  const getRandomTheme = (): ColorTheme => {
    const themes = Object.keys(colorThemes) as ColorTheme[]
    const randomIndex = Math.floor(Math.random() * themes.length)
    return themes[randomIndex]
  }

  // Change theme function
  const changeColorTheme = (theme?: ColorTheme) => {
    const newTheme = theme || getRandomTheme()
    setCurrentTheme(newTheme)

    // Update CSS variables
    const root = document.documentElement
    const themeColors = colorThemes[newTheme]

    root.style.setProperty("--theme-primary", themeColors.primary)
    root.style.setProperty("--theme-secondary", themeColors.secondary)
    root.style.setProperty("--theme-accent", themeColors.accent)
    root.style.setProperty("--theme-muted", themeColors.muted)
    root.style.setProperty("--theme-muted-foreground", themeColors.mutedForeground)
  }

  // Set random theme on initial load
  useEffect(() => {
    changeColorTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ currentColorTheme: colorThemes[currentTheme], changeColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useColorTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider")
  }
  return context
}
