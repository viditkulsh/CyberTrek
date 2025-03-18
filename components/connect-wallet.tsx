"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserStore } from "@/lib/user-store"
import { useRouter } from "next/navigation"

interface ConnectWalletProps {
  onAuthenticated?: () => void
}

export function ConnectWallet({ onAuthenticated }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<"metamask" | "phantom" | null>(null)

  const { setAuthenticated, setUserData } = useUserStore()
  const router = useRouter()

  const connectMetaMask = async () => {
    setWalletType("metamask")
    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your MetaMask and try again.")
      }

      const address = accounts[0]

      // Generate a random nonce for signing
      const nonce = Math.floor(Math.random() * 1000000).toString()
      const message = `Sign this message to authenticate with CyberTrek: ${nonce}`

      // Request signature from user
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(message)

      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Signature verification failed. Please try again.")
      }

      // Store wallet address and authentication data in local storage
      localStorage.setItem("walletAddress", address)
      localStorage.setItem("authNonce", nonce)
      localStorage.setItem("walletType", "metamask")

      // Initialize user data if first time
      initializeUserData(address)

      // Update authentication state
      setAuthenticated(true, "metamask")

      if (onAuthenticated) {
        onAuthenticated()
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("MetaMask connection error:", err)
      setError(err.message || "Failed to connect to MetaMask. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const connectPhantom = async () => {
    setWalletType("phantom")
    setIsConnecting(true)
    setError(null)

    try {
      // Check if Phantom is installed
      const phantom = (window as any).solana

      if (!phantom) {
        throw new Error("Phantom wallet is not installed. Please install Phantom to continue.")
      }

      // Connect to Phantom
      const response = await phantom.connect()
      const address = response.publicKey.toString()

      // Generate a random nonce for signing
      const nonce = Math.floor(Math.random() * 1000000).toString()
      const message = `Sign this message to authenticate with CyberTrek: ${nonce}`
      const encodedMessage = new TextEncoder().encode(message)

      // Request signature from user
      const signatureBytes = await phantom.signMessage(encodedMessage, "utf8")
      const signature = Buffer.from(signatureBytes.signature).toString("hex")

      // Store wallet address and authentication data in local storage
      localStorage.setItem("walletAddress", address)
      localStorage.setItem("authNonce", nonce)
      localStorage.setItem("walletType", "phantom")

      // Initialize user data if first time
      initializeUserData(address)

      // Update authentication state
      setAuthenticated(true, "phantom")

      if (onAuthenticated) {
        onAuthenticated()
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Phantom connection error:", err)
      setError(err.message || "Failed to connect to Phantom. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const initializeUserData = (address: string) => {
    // Check if user data already exists
    const existingUserData = localStorage.getItem(`user_${address}`)

    if (!existingUserData) {
      // Initialize user data with default values
      const userData = {
        walletAddress: address,
        xp: 0,
        level: 1,
        questTokens: 100,
        completedCourses: [],
        achievements: [],
        stakedTokens: 0,
        stakingEndTime: 0,
        enrolledCourses: [],
      }

      localStorage.setItem(`user_${address}`, JSON.stringify(userData))
      setUserData(userData)

      // Initialize IndexedDB for course progress
      initializeIndexedDB(address)
    } else {
      setUserData(JSON.parse(existingUserData))
    }
  }

  const initializeIndexedDB = (address: string) => {
    const request = indexedDB.open("CyberTrekDB", 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains("courseProgress")) {
        db.createObjectStore("courseProgress", { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains("achievements")) {
        db.createObjectStore("achievements", { keyPath: "id" })
      }
    }

    request.onsuccess = (event) => {
      console.log("IndexedDB initialized successfully")
    }

    request.onerror = (event) => {
      console.error("IndexedDB initialization error:", event)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        variant="outline"
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold border-none"
        onClick={connectMetaMask}
        disabled={isConnecting}
      >
        {isConnecting && walletType === "metamask" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32.9582 1L19.8241 10.7183L22.2665 5.09082L32.9582 1Z"
              fill="#E17726"
              stroke="#E17726"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.04187 1L15.0217 10.809L12.7334 5.09082L2.04187 1Z"
              fill="#E27625"
              stroke="#E27625"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28.2049 23.7714L24.6748 29.1268L32.2292 31.1907L34.3979 23.9172L28.2049 23.7714Z"
              fill="#E27625"
              stroke="#E27625"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0.617676 23.9172L2.77099 31.1907L10.3254 29.1268L6.80072 23.7714L0.617676 23.9172Z"
              fill="#E27625"
              stroke="#E27625"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        Connect with MetaMask
      </Button>

      <Button
        variant="outline"
        className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold border-none"
        onClick={connectPhantom}
        disabled={isConnecting}
      >
        {isConnecting && walletType === "phantom" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="64" fill="url(#paint0_linear)" />
            <path
              d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.8993 33.0478 108 57.0929 108H63.6267C84.4175 108 110.584 91.7667 110.584 64.9142Z"
              fill="white"
            />
            <path
              d="M77.8896 64.9142H89.3321C89.3321 41.7651 70.3631 23 46.9631 23C23.8513 23 5.06229 41.3057 4.60254 64.0583C4.12679 87.8993 23.2386 108 47.2837 108H53.8174C74.6082 108 100.775 91.7667 100.775 64.9142H77.8896Z"
              fill="url(#paint1_linear)"
            />
            <defs>
              <linearGradient id="paint0_linear" x1="64" y1="0" x2="64" y2="128" gradientUnits="userSpaceOnUse">
                <stop stopColor="#534BB1" />
                <stop offset="1" stopColor="#551BF9" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1="52.6885"
                y1="23"
                x2="52.6885"
                y2="108"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#534BB1" />
                <stop offset="1" stopColor="#551BF9" />
              </linearGradient>
            </defs>
          </svg>
        )}
        Connect with Phantom
      </Button>
    </div>
  )
}

