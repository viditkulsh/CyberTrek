"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GlitchText } from "@/components/glitch-text"
import { MatrixBackground } from "@/components/matrix-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, BookOpen, Code, Shield, Database, Cpu, Lock, LogOut, Zap, Award, BarChart3 } from "lucide-react"

interface UserData {
  xp: number
  level: number
  questTokens: number
  completedCourses: string[]
  achievements: string[]
  stakedTokens: number
  stakingEndTime: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const storedWalletAddress = localStorage.getItem("walletAddress")

    if (!storedWalletAddress) {
      router.push("/")
      return
    }

    setWalletAddress(storedWalletAddress)

    // Load user data from localStorage
    const storedUserData = localStorage.getItem(`user_${storedWalletAddress}`)

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("authNonce")
    localStorage.removeItem("walletType")
    router.push("/")
  }

  const formatWalletAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const calculateLevelProgress = () => {
    if (!userData) return 0
    const xpForNextLevel = userData.level * 1000
    const xpFromLastLevel = (userData.level - 1) * 1000
    const currentLevelXp = userData.xp - xpFromLastLevel
    return (currentLevelXp / (xpForNextLevel - xpFromLastLevel)) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400 text-xl font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <MatrixBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-900/50 bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <GlitchText className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400">
                CYBERTREK
              </GlitchText>
            </div>

            <div className="flex items-center gap-4">
              {userData && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-mono">{userData.questTokens} QUEST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 font-mono">Level {userData.level}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1 text-sm border border-cyan-900/50">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-mono text-gray-300">{formatWalletAddress(walletAddress || "")}</span>
              </div>

              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-gray-400 hover:text-white" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {userData && (
            <>
              {/* User Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Card className="bg-gray-900/60 border-cyan-900/50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400 font-mono">LEVEL {userData.level}</div>
                        <Progress
                          value={calculateLevelProgress()}
                          className="h-2 bg-gray-800"
                          indicatorClassName="bg-gradient-to-r from-cyan-500 to-purple-500"
                        />
                        <div className="text-xs text-gray-500 font-mono">
                          {userData.xp} XP / {userData.level * 1000} XP
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-gray-400 font-mono">QUEST TOKENS</div>
                        <div className="text-2xl font-bold text-yellow-400 font-mono">{userData.questTokens}</div>
                        <div className="text-xs text-gray-500">Use tokens to access premium courses</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-gray-400 font-mono">STAKED TOKENS</div>
                        <div className="text-2xl font-bold text-green-400 font-mono">{userData.stakedTokens}</div>
                        <div className="text-xs text-gray-500">
                          {userData.stakedTokens > 0 && userData.stakingEndTime > Date.now()
                            ? `Unlocks in ${Math.ceil((userData.stakingEndTime - Date.now()) / (1000 * 60 * 60 * 24))} days`
                            : "Stake tokens to earn rewards"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Dashboard */}
              <Tabs defaultValue="courses" className="space-y-6">
                <TabsList className="bg-gray-900/60 border border-cyan-900/50">
                  <TabsTrigger value="courses" className="data-[state=active]:bg-cyan-900/30">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-cyan-900/30">
                    <Award className="h-4 w-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-900/30">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Leaderboard
                  </TabsTrigger>
                  <TabsTrigger value="staking" className="data-[state=active]:bg-cyan-900/30">
                    <Zap className="h-4 w-4 mr-2" />
                    Staking
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                      <CourseCard key={index} course={course} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement, index) => (
                      <AchievementCard key={index} achievement={achievement} unlocked={index < 2} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-6">
                  <Card className="bg-gray-900/60 border-cyan-900/50">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 font-mono">Global Leaderboard</CardTitle>
                      <CardDescription>Top cybersecurity experts this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leaderboard.map((entry, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-900/30 to-yellow-700/20 border border-yellow-700/30"
                                : "bg-gray-800/50 border border-gray-700/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-bold font-mono text-gray-400">#{index + 1}</div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {entry.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-mono">{entry.name}</div>
                                <div className="text-xs text-gray-500">{formatWalletAddress(entry.wallet)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-purple-400 font-mono">Level {entry.level}</div>
                              <div className="text-cyan-400 font-mono">{entry.xp} XP</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="staking" className="space-y-6">
                  <Card className="bg-gray-900/60 border-cyan-900/50">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 font-mono">Stake QUEST Tokens</CardTitle>
                      <CardDescription>Lock your tokens to earn rewards and access premium content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-mono text-lg">Available to Stake</div>
                            <div className="text-yellow-400 font-mono text-lg">{userData.questTokens} QUEST</div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <Button variant="outline" className="border-cyan-900/50 hover:bg-cyan-900/20">
                                25 QUEST
                              </Button>
                              <Button variant="outline" className="border-cyan-900/50 hover:bg-cyan-900/20">
                                50 QUEST
                              </Button>
                              <Button variant="outline" className="border-cyan-900/50 hover:bg-cyan-900/20">
                                100 QUEST
                              </Button>
                            </div>

                            <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                              Stake Tokens
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                            <div className="text-sm text-gray-400 mb-1">Staking Period</div>
                            <div className="text-lg font-mono">7 Days</div>
                            <div className="text-xs text-gray-500 mt-1">Earn 5% rewards</div>
                          </div>

                          <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                            <div className="text-sm text-gray-400 mb-1">Staking Period</div>
                            <div className="text-lg font-mono">14 Days</div>
                            <div className="text-xs text-gray-500 mt-1">Earn 12% rewards</div>
                          </div>

                          <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                            <div className="text-sm text-gray-400 mb-1">Staking Period</div>
                            <div className="text-lg font-mono">30 Days</div>
                            <div className="text-xs text-gray-500 mt-1">Earn 30% rewards</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration: string
  icon: React.ReactNode
  premium: boolean
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="bg-gray-900/60 border-cyan-900/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="text-cyan-400">{course.icon}</div>
          {course.premium && (
            <div className="px-2 py-1 bg-yellow-900/30 border border-yellow-700/30 rounded text-yellow-400 text-xs font-mono">
              PREMIUM
            </div>
          )}
        </div>
        <CardTitle className="text-white">{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
        </div>
        <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
          Start Course
        </Button>
      </CardContent>
    </Card>
  )
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  xpReward: number
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        unlocked
          ? "bg-gray-900/60 border-cyan-900/50 hover:border-cyan-500/50"
          : "bg-gray-900/30 border-gray-800/50 text-gray-500"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={unlocked ? "text-purple-400" : "text-gray-600"}>{achievement.icon}</div>
          <div
            className={`px-2 py-1 rounded text-xs font-mono ${
              unlocked
                ? "bg-green-900/30 border border-green-700/30 text-green-400"
                : "bg-gray-800/30 border border-gray-700/30 text-gray-500"
            }`}
          >
            {unlocked ? "UNLOCKED" : "LOCKED"}
          </div>
        </div>
        <CardTitle className={unlocked ? "text-white" : "text-gray-500"}>{achievement.title}</CardTitle>
        <CardDescription className={unlocked ? "" : "text-gray-600"}>{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-1 text-sm ${unlocked ? "text-purple-400" : "text-gray-600"}`}>
            <Trophy className="h-4 w-4" />
            <span>+{achievement.xpReward} XP</span>
          </div>
          {!unlocked && <Lock className="h-4 w-4 text-gray-600" />}
        </div>
      </CardContent>
    </Card>
  )
}

// Missing Clock component
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

const courses: Course[] = [
  {
    id: "intro-cybersec",
    title: "Introduction to Cybersecurity",
    description: "Learn the fundamentals of cybersecurity and basic threat models",
    level: "Beginner",
    duration: "2 hours",
    icon: <Shield className="h-6 w-6" />,
    premium: false,
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking Basics",
    description: "Discover the tools and techniques used by ethical hackers",
    level: "Intermediate",
    duration: "4 hours",
    icon: <Lock className="h-6 w-6" />,
    premium: true,
  },
  {
    id: "blockchain-101",
    title: "Blockchain Fundamentals",
    description: "Understand the core concepts behind blockchain technology",
    level: "Beginner",
    duration: "3 hours",
    icon: <Database className="h-6 w-6" />,
    premium: false,
  },
  {
    id: "smart-contracts",
    title: "Smart Contract Development",
    description: "Learn to write and audit secure smart contracts",
    level: "Advanced",
    duration: "6 hours",
    icon: <Code className="h-6 w-6" />,
    premium: true,
  },
  {
    id: "cryptography",
    title: "Applied Cryptography",
    description: "Master the principles of modern cryptographic systems",
    level: "Intermediate",
    duration: "5 hours",
    icon: <Cpu className="h-6 w-6" />,
    premium: true,
  },
]

const achievements: Achievement[] = [
  {
    id: "first-login",
    title: "Digital Initiate",
    description: "Log in to CyberTrek for the first time",
    icon: <Award className="h-6 w-6" />,
    xpReward: 50,
  },
  {
    id: "first-course",
    title: "Knowledge Seeker",
    description: "Complete your first course",
    icon: <BookOpen className="h-6 w-6" />,
    xpReward: 100,
  },
  {
    id: "first-stake",
    title: "Token Staker",
    description: "Stake QUEST tokens for the first time",
    icon: <Zap className="h-6 w-6" />,
    xpReward: 150,
  },
  {
    id: "security-expert",
    title: "Security Expert",
    description: "Complete all cybersecurity courses",
    icon: <Shield className="h-6 w-6" />,
    xpReward: 500,
  },
  {
    id: "blockchain-master",
    title: "Blockchain Master",
    description: "Complete all blockchain courses",
    icon: <Database className="h-6 w-6" />,
    xpReward: 500,
  },
]

const leaderboard = [
  {
    name: "CryptoNinja",
    wallet: "0x1a2b3c4d5e6f7g8h9i0j",
    level: 12,
    xp: 11850,
  },
  {
    name: "BlockchainWizard",
    wallet: "0x9i8u7y6t5r4e3w2q1",
    level: 10,
    xp: 9200,
  },
  {
    name: "HackerElite",
    wallet: "0xq1w2e3r4t5y6u7i8o9p",
    level: 8,
    xp: 7500,
  },
  {
    name: "CipherPunk",
    wallet: "0xa1s2d3f4g5h6j7k8l9",
    level: 7,
    xp: 6300,
  },
  {
    name: "TokenMaster",
    wallet: "0xz1x2c3v4b5n6m7",
    level: 6,
    xp: 5100,
  },
]

