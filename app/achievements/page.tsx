"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/user-store"
import { useCourseStore } from "@/lib/course-store"
import { MatrixBackground } from "@/components/matrix-background"
import { GlitchText } from "@/components/glitch-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Award, BookOpen, Database, Lock, Shield, Trophy, Zap } from "lucide-react"

export default function AchievementsPage() {
  const router = useRouter()
  const { userData } = useUserStore()
  const { achievements } = useCourseStore()

  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    if (!userData) {
      router.push("/")
      return
    }

    setLoading(false)
  }, [router, userData])

  const isAchievementUnlocked = (achievementId: string) => {
    if (!userData) return false
    return userData.achievements.includes(achievementId)
  }

  const getFilteredAchievements = () => {
    if (filter === "all") return achievements
    return achievements.filter((achievement) => achievement.category === filter)
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
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>

            {userData && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 font-mono">Level {userData.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono">{userData.questTokens} QUEST</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <GlitchText className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 mb-8 text-center">
              ACHIEVEMENTS
            </GlitchText>

            <Card className="bg-gray-900/60 border-cyan-900/50 mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                    <div className="text-2xl font-bold text-cyan-400 mb-1">{userData?.achievements.length || 0}</div>
                    <div className="text-sm text-gray-400">Achievements Unlocked</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {Math.round(((userData?.achievements.length || 0) / achievements.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Completion Rate</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">{userData?.level || 1}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{userData?.xp || 0}</div>
                    <div className="text-sm text-gray-400">Total XP</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" onValueChange={setFilter}>
              <TabsList className="bg-gray-900/60 border border-cyan-900/50 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-cyan-900/30">
                  <Trophy className="h-4 w-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-cyan-900/30">
                  <Award className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-cyan-900/30">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning
                </TabsTrigger>
                <TabsTrigger value="cybersecurity" className="data-[state=active]:bg-cyan-900/30">
                  <Shield className="h-4 w-4 mr-2" />
                  Cybersecurity
                </TabsTrigger>
                <TabsTrigger value="blockchain" className="data-[state=active]:bg-cyan-900/30">
                  <Database className="h-4 w-4 mr-2" />
                  Blockchain
                </TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getFilteredAchievements().map((achievement) => {
                  const unlocked = isAchievementUnlocked(achievement.id)
                  return (
                    <Card
                      key={achievement.id}
                      className={`overflow-hidden transition-all duration-300 ${
                        unlocked
                          ? "bg-gray-900/60 border-cyan-900/50 hover:border-cyan-500/50"
                          : "bg-gray-900/30 border-gray-800/50 text-gray-500"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className={unlocked ? "text-purple-400" : "text-gray-600"}>
                            {achievement.icon && <achievement.icon className="h-6 w-6" />}
                          </div>
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
                        <CardDescription className={unlocked ? "" : "text-gray-600"}>
                          {achievement.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div
                            className={`flex items-center gap-1 text-sm ${unlocked ? "text-purple-400" : "text-gray-600"}`}
                          >
                            <Trophy className="h-4 w-4" />
                            <span>+{achievement.xpReward} XP</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>Difficulty:</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                                    i < achievement.difficulty
                                      ? unlocked
                                        ? "bg-cyan-400"
                                        : "bg-gray-600"
                                      : "bg-gray-800"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {!unlocked && <Lock className="h-4 w-4 text-gray-600" />}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

