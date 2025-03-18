"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ConnectWallet } from "@/components/connect-wallet"
import { MatrixBackground } from "@/components/matrix-background"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const walletAddress = localStorage.getItem("walletAddress")
    if (walletAddress) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 mb-4">
            CYBERTREK
          </div>
          <p className="text-cyan-400 text-xl md:text-2xl font-mono">Master Cybersecurity & Blockchain</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white font-mono">
                <span className="text-green-400">{">"}</span> Connect Wallet to Access
              </h2>
              <p className="mt-2 text-gray-400 font-mono text-sm">
                Authenticate with your crypto wallet to begin your journey
              </p>
            </div>

            <ConnectWallet onAuthenticated={() => setIsAuthenticated(true)} />

            <div className="pt-4 text-center">
              <p className="text-gray-500 text-xs font-mono">
                No blockchain transactions required. <br />
                Your wallet is used for authentication only.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="text-purple-400 mb-2">{feature.icon}</div>
              <h3 className="text-cyan-300 font-bold mb-1 font-mono">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: "🔐",
    title: "Cybersecurity Mastery",
    description: "Interactive courses on ethical hacking, cryptography, and network security",
  },
  {
    icon: "⛓️",
    title: "Blockchain Expertise",
    description: "Learn blockchain fundamentals, smart contracts, and decentralized applications",
  },
  {
    icon: "🏆",
    title: "Gamified Learning",
    description: "Earn XP, unlock achievements, and compete on leaderboards as you learn",
  },
]

