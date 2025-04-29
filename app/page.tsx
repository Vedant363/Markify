import { Markify } from "@/components/markify"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="hero-gradient py-16 px-4 mb-8">
        <div className="container mx-auto text-center relative">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  <path d="M9 9h1" />
                  <path d="M9 13h6" />
                  <path d="M9 17h6" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 drop-shadow-md">Markify</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Smart text & markdown processor with intelligent format detection
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-16">
        <Markify />
      </div>
    </main>
  )
}
