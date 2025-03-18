"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/user-store"
import { MatrixBackground } from "@/components/matrix-background"
import { GlitchText } from "@/components/glitch-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Clock, Zap } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function StakingPage() {
  const router = useRouter()
  const { userData, stakeTokens, withdrawStake, unlockAchievement } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  const [stakeDuration, setStakeDuration] = useState<number>(7)

  useEffect(() => {
    if (!userData) {
      router.push("/")
      return
    }

    setLoading(false)
  }, [router, userData])

  const handleStakeTokens = () => {
    if (!userData) return

    if (stakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      })
      return
    }

    if (stakeAmount > userData.questTokens) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough QUEST tokens.",
        variant: "destructive",
      })
      return
    }

    stakeTokens(stakeAmount, stakeDuration)

    toast({
      title: "Tokens Staked",
      description: `You have staked ${stakeAmount} QUEST tokens for ${stakeDuration} days.`,
    })

    // Check for first-time staking achievement
    if (userData.stakedTokens === 0) {
      unlockAchievement("first-stake")
      toast({
        title: "Achievement Unlocked!",
        description: "Token Staker: Stake QUEST tokens for the first time",
      })
    }

    setStakeAmount(0)
  }

  const calculateReward = (amount: number, days: number) => {
    // Simple reward calculation based on stake amount and duration
    let rewardRate = 0

    if (days === 7) rewardRate = 0.05
    else if (days === 14) rewardRate = 0.12
    else if (days === 30) rewardRate = 0.3

    return Math.floor(amount * rewardRate)
  }

  const timeUntilUnlock = () => {
    if (!userData || userData.stakingEndTime <= Date.now()) return null

    const timeLeft = userData.stakingEndTime - Date.now()
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return { days, hours }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400 text-xl font-mono">Loading...</div>
      </div>
    )
  }

  const unlockTime = timeUntilUnlock()

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
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono">{userData.questTokens} QUEST</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <GlitchText className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 mb-8 text-center">
              QUEST Token Staking
            </GlitchText>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staking Form */}
              <Card className="bg-gray-900/60 border-cyan-900/50">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono">Stake QUEST Tokens</CardTitle>
                  <CardDescription>Lock your tokens to earn rewards and access premium content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                      <div className="flex justify-between items-center mb-4">
                        <div className="font-mono text-lg">Available to Stake</div>
                        <div className="text-yellow-400 font-mono text-lg">{userData?.questTokens || 0} QUEST</div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Stake Amount</div>
                          <Input
                            type="number"
                            value={stakeAmount || ""}
                            onChange={(e) => setStakeAmount(Number.parseInt(e.target.value) || 0)}
                            className="bg-gray-800 border-gray-700"
                            placeholder="Enter amount to stake"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Staking Period</div>
                          <div className="grid grid-cols-3 gap-4">
                            <Button
                              variant="outline"
                              className={`border-cyan-900/50 ${stakeDuration === 7 ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                              onClick={() => setStakeDuration(7)}
                            >
                              7 Days
                            </Button>
                            <Button
                              variant="outline"
                              className={`border-cyan-900/50 ${stakeDuration === 14 ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                              onClick={() => setStakeDuration(14)}
                            >
                              14 Days
                            </Button>
                            <Button
                              variant="outline"
                              className={`border-cyan-900/50 ${stakeDuration === 30 ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                              onClick={() => setStakeDuration(30)}
                            >
                              30 Days
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-800/80 border border-cyan-900/20">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Estimated Reward</div>
                            <div className="text-green-400 font-mono">
                              +{calculateReward(stakeAmount, stakeDuration)} QUEST
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                          onClick={handleStakeTokens}
                          disabled={stakeAmount <= 0 || stakeAmount > (userData?.questTokens || 0)}
                        >
                          Stake Tokens
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Stakes */}
              <Card className="bg-gray-900/60 border-cyan-900/50">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono">Your Staked Tokens</CardTitle>
                  <CardDescription>View your current stakes and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData && userData.stakedTokens > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-mono text-lg">Total Staked</div>
                          <div className="text-purple-400 font-mono text-lg">{userData.stakedTokens} QUEST</div>
                        </div>

                        {unlockTime && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/80 border border-cyan-900/20 mb-4">
                            <Clock className="h-4 w-4 text-cyan-400" />
                            <span className="text-cyan-400 text-sm">
                              Unlocks in {unlockTime.days} days, {unlockTime.hours} hours
                            </span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Staking Benefits</div>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>Access to premium courses</li>
                            <li>Earn rewards upon course completion</li>
                            <li>Higher position on leaderboards</li>
                            <li>Unlock exclusive achievements</li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>Early withdrawal will incur a 20% penalty fee.</p>
                        <p>Staked tokens are returned along with rewards when you complete premium courses.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Zap className="h-12 w-12 text-gray-600 mb-4" />
                      <p className="text-gray-400 mb-2">You don't have any staked tokens yet</p>
                      <p className="text-gray-500 text-sm">
                        Stake QUEST tokens to access premium courses and earn rewards
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Staking Tiers */}
              <Card className="bg-gray-900/60 border-cyan-900/50 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono">Staking Tiers & Rewards</CardTitle>
                  <CardDescription>Higher stakes and longer durations yield better rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                      <div className="text-lg font-mono text-cyan-400 mb-2">Basic Tier</div>
                      <div className="text-2xl font-bold mb-2">7 Days</div>
                      <div className="text-green-400 font-mono mb-4">5% Reward</div>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Access to premium courses</li>
                        <li>Basic reward rate</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50 border border-purple-900/30">
                      <div className="text-lg font-mono text-purple-400 mb-2">Advanced Tier</div>
                      <div className="text-2xl font-bold mb-2">14 Days</div>
                      <div className="text-green-400 font-mono mb-4">12% Reward</div>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Access to premium courses</li>
                        <li>Improved reward rate</li>
                        <li>Leaderboard bonus points</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50 border border-green-900/30">
                      <div className="text-lg font-mono text-green-400 mb-2">Expert Tier</div>
                      <div className="text-2xl font-bold mb-2">30 Days</div>
                      <div className="text-green-400 font-mono mb-4">30% Reward</div>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Access to premium courses</li>
                        <li>Maximum reward rate</li>
                        <li>Leaderboard bonus points</li>
                        <li>Exclusive achievement eligibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

