"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface GlitchTextProps {
  children: React.ReactNode
  className?: string
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    // Randomly trigger glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 200)
      }
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className={`relative ${isGlitching ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-0 left-0 w-full h-full text-red-500 transform -translate-x-1 translate-y-1">
          {children}
        </div>
        <div className="absolute top-0 left-0 w-full h-full text-blue-500 transform translate-x-1 -translate-y-1">
          {children}
        </div>
      </div>
      <div className={`relative ${isGlitching ? "opacity-80" : "opacity-100"}`}>{children}</div>
    </div>
  )
}

