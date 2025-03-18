"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCourseStore } from "@/lib/course-store"
import { useUserStore } from "@/lib/user-store"
import { MatrixBackground } from "@/components/matrix-background"
import { GlitchText } from "@/components/glitch-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, CheckCircle, Clock, Trophy, Zap } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const { getCourse, updateCourseProgress } = useCourseStore()
  const { userData, enrollInCourse, completeCourse, claimReward, addXp, unlockAchievement } = useUserStore()

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({})
  const [stakeAmount, setStakeAmount] = useState<number>(0)

  useEffect(() => {
    if (!userData) {
      router.push("/")
      return
    }

    const courseData = getCourse(courseId)
    if (courseData) {
      setCourse(courseData)
      if (courseData.modules.length > 0) {
        setActiveModule(courseData.modules[0].id)
      }
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }, [courseId, getCourse, router, userData])

  const isEnrolled = () => {
    if (!userData || !course) return false
    return userData.enrolledCourses.some((c) => c.courseId === courseId)
  }

  const getEnrollmentStatus = () => {
    if (!userData || !course) return null
    return userData.enrolledCourses.find((c) => c.courseId === courseId)
  }

  const handleEnroll = () => {
    if (!userData || !course) return

    if (course.premium && stakeAmount < course.stakingRequirement) {
      toast({
        title: "Insufficient Stake",
        description: `You need to stake at least ${course.stakingRequirement} QUEST tokens to access this course.`,
        variant: "destructive",
      })
      return
    }

    const amountToStake = course.premium ? stakeAmount : 0

    enrollInCourse(courseId, amountToStake)

    toast({
      title: "Enrolled Successfully",
      description: `You have enrolled in ${course.title}.`,
    })

    // Check for first-time enrollment achievement
    if (userData.enrolledCourses.length === 0) {
      unlockAchievement("first-stake")
      toast({
        title: "Achievement Unlocked!",
        description: "Token Staker: Stake QUEST tokens for the first time",
      })
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId)
  }

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    if (quizSubmitted[activeModule || ""]) return

    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answerIndex,
    })
  }

  const handleQuizSubmit = () => {
    if (!activeModule || !course) return

    const currentModule = course.modules.find((m: any) => m.id === activeModule)
    if (!currentModule) return

    let allCorrect = true
    const totalQuestions = currentModule.quizQuestions.length
    let correctAnswers = 0

    currentModule.quizQuestions.forEach((q: any) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correctAnswers++
      } else {
        allCorrect = false
      }
    })

    // Mark as submitted
    setQuizSubmitted({
      ...quizSubmitted,
      [activeModule]: true,
    })

    // If passed (more than 70% correct)
    if (correctAnswers / totalQuestions >= 0.7) {
      // Mark module as completed
      updateCourseProgress(courseId, activeModule, true)

      // Check if all modules are completed
      const allModulesCompleted = course.modules.every((m: any, index: number) => {
        if (m.id === activeModule) return true
        return m.completed
      })

      if (allModulesCompleted) {
        completeCourse(courseId)

        // Add XP for course completion
        addXp(course.rewardAmount)

        // Check for first course completion achievement
        if (userData.completedCourses.length === 0) {
          unlockAchievement("first-course")
          toast({
            title: "Achievement Unlocked!",
            description: "Knowledge Seeker: Complete your first course",
          })
        }

        // Check for specific course achievements
        if (courseId === "cryptography" && allCorrect) {
          unlockAchievement("crypto-wizard")
          toast({
            title: "Achievement Unlocked!",
            description: "Crypto Wizard: Complete the Applied Cryptography course with a perfect score",
          })
        }

        // Check for category mastery achievements
        const cybersecCourses = ["intro-cybersec", "ethical-hacking"]
        const blockchainCourses = ["blockchain-101", "smart-contracts"]

        const completedCyberSec = cybersecCourses.every(
          (id) => userData.completedCourses.includes(id) || id === courseId,
        )

        const completedBlockchain = blockchainCourses.every(
          (id) => userData.completedCourses.includes(id) || id === courseId,
        )

        if (completedCyberSec) {
          unlockAchievement("security-expert")
          toast({
            title: "Achievement Unlocked!",
            description: "Security Expert: Complete all cybersecurity courses",
          })
        }

        if (completedBlockchain) {
          unlockAchievement("blockchain-master")
          toast({
            title: "Achievement Unlocked!",
            description: "Blockchain Master: Complete all blockchain courses",
          })
        }

        toast({
          title: "Course Completed!",
          description: `You have completed ${course.title}. You can now claim your rewards.`,
        })
      } else {
        toast({
          title: "Module Completed!",
          description: `You have completed this module. Continue to the next one.`,
        })

        // Move to next module if available
        const currentIndex = course.modules.findIndex((m: any) => m.id === activeModule)
        if (currentIndex < course.modules.length - 1) {
          setActiveModule(course.modules[currentIndex + 1].id)
        }
      }
    } else {
      toast({
        title: "Quiz Failed",
        description: `You got ${correctAnswers} out of ${totalQuestions} correct. You need at least 70% to pass.`,
        variant: "destructive",
      })
    }
  }

  const handleClaimReward = () => {
    if (!course) return

    const reward = claimReward(courseId)

    toast({
      title: "Rewards Claimed!",
      description: `You have received ${reward} QUEST tokens as a reward.`,
    })
  }

  const calculateProgress = () => {
    if (!course) return 0

    const completedModules = course.modules.filter((m: any) => m.completed).length
    return (completedModules / course.modules.length) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400 text-xl font-mono">Loading...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-400 text-xl font-mono">Course not found</div>
      </div>
    )
  }

  const enrollmentStatus = getEnrollmentStatus()
  const isCompleted = enrollmentStatus?.completed
  const canClaimReward = isCompleted && !enrollmentStatus?.rewardClaimed

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
          <div className="max-w-6xl mx-auto">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-cyan-400">{course.icon && <course.icon className="h-8 w-8" />}</div>
                <GlitchText className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400">
                  {course.title}
                </GlitchText>
                {course.premium && (
                  <Badge variant="outline" className="bg-yellow-900/30 border-yellow-700/30 text-yellow-400">
                    PREMIUM
                  </Badge>
                )}
              </div>

              <p className="text-gray-300 mb-4">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-400">
                  <Trophy className="h-4 w-4" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                {course.premium && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Zap className="h-4 w-4" />
                    <span>Requires {course.stakingRequirement} QUEST tokens</span>
                  </div>
                )}
              </div>

              {isEnrolled() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400 font-mono">PROGRESS</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {course.modules.filter((m: any) => m.completed).length} / {course.modules.length} modules
                    </div>
                  </div>
                  <Progress
                    value={calculateProgress()}
                    className="h-2 bg-gray-800"
                    indicatorClassName="bg-gradient-to-r from-cyan-500 to-purple-500"
                  />

                  {isCompleted && (
                    <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400">Course completed!</span>

                      {canClaimReward && (
                        <Button
                          onClick={handleClaimReward}
                          className="ml-auto bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Claim Rewards
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="bg-gray-900/60 border-cyan-900/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-400 font-mono">Enroll in this Course</CardTitle>
                    <CardDescription>
                      {course.premium
                        ? `Stake QUEST tokens to access this premium course. You'll get them back plus rewards when you complete the course.`
                        : `This course is free to access. Click enroll to begin your learning journey.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {course.premium ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-900/30">
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-mono text-lg">Stake Amount</div>
                            <div className="text-yellow-400 font-mono text-lg">
                              {userData?.questTokens || 0} QUEST available
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <Button
                                variant="outline"
                                className={`border-cyan-900/50 ${stakeAmount === course.stakingRequirement ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                                onClick={() => setStakeAmount(course.stakingRequirement)}
                                disabled={(userData?.questTokens || 0) < course.stakingRequirement}
                              >
                                {course.stakingRequirement} QUEST
                              </Button>
                              <Button
                                variant="outline"
                                className={`border-cyan-900/50 ${stakeAmount === course.stakingRequirement * 1.5 ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                                onClick={() => setStakeAmount(Math.floor(course.stakingRequirement * 1.5))}
                                disabled={(userData?.questTokens || 0) < course.stakingRequirement * 1.5}
                              >
                                {Math.floor(course.stakingRequirement * 1.5)} QUEST
                              </Button>
                              <Button
                                variant="outline"
                                className={`border-cyan-900/50 ${stakeAmount === course.stakingRequirement * 2 ? "bg-cyan-900/20" : "hover:bg-cyan-900/20"}`}
                                onClick={() => setStakeAmount(course.stakingRequirement * 2)}
                                disabled={(userData?.questTokens || 0) < course.stakingRequirement * 2}
                              >
                                {course.stakingRequirement * 2} QUEST
                              </Button>
                            </div>

                            <Button
                              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                              onClick={handleEnroll}
                              disabled={
                                stakeAmount < course.stakingRequirement || (userData?.questTokens || 0) < stakeAmount
                              }
                            >
                              Stake & Enroll
                            </Button>

                            <div className="text-xs text-gray-500">
                              <p>Minimum stake: {course.stakingRequirement} QUEST</p>
                              <p>Staking period: {course.minStakingPeriodDays} days</p>
                              <p>Reward upon completion: {course.rewardAmount} QUEST</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                        onClick={handleEnroll}
                      >
                        Enroll Now (Free)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Course Content */}
            {isEnrolled() && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module List */}
                <div className="md:col-span-1">
                  <Card className="bg-gray-900/60 border-cyan-900/50">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 font-mono">Course Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.modules.map((module: any, index: number) => (
                          <div
                            key={module.id}
                            onClick={() => handleModuleSelect(module.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                              activeModule === module.id
                                ? "bg-cyan-900/30 border border-cyan-700/50"
                                : "bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-mono">
                                {index + 1}. {module.title}
                              </div>
                              {module.completed && <CheckCircle className="h-4 w-4 text-green-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Module Content */}
                <div className="md:col-span-2">
                  {activeModule && (
                    <Card className="bg-gray-900/60 border-cyan-900/50">
                      <CardHeader>
                        <CardTitle className="text-cyan-400 font-mono">
                          {course.modules.find((m: any) => m.id === activeModule)?.title}
                        </CardTitle>
                        <CardDescription>
                          {course.modules.find((m: any) => m.id === activeModule)?.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="content">
                          <TabsList className="bg-gray-800/60 border border-gray-700/50">
                            <TabsTrigger value="content" className="data-[state=active]:bg-cyan-900/30">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Content
                            </TabsTrigger>
                            <TabsTrigger value="quiz" className="data-[state=active]:bg-cyan-900/30">
                              <Trophy className="h-4 w-4 mr-2" />
                              Quiz
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="content" className="mt-4">
                            <div className="prose prose-invert max-w-none">
                              <p>{course.modules.find((m: any) => m.id === activeModule)?.content}</p>
                            </div>
                          </TabsContent>

                          <TabsContent value="quiz" className="mt-4">
                            <div className="space-y-6">
                              {course.modules
                                .find((m: any) => m.id === activeModule)
                                ?.quizQuestions.map((question: any, qIndex: number) => (
                                  <div key={question.id} className="space-y-3">
                                    <h3 className="text-lg font-semibold">
                                      Question {qIndex + 1}: {question.question}
                                    </h3>
                                    <div className="space-y-2">
                                      {question.options.map((option: string, oIndex: number) => (
                                        <div
                                          key={oIndex}
                                          onClick={() => handleQuizAnswer(question.id, oIndex)}
                                          className={`p-3 rounded-lg cursor-pointer border transition-colors duration-200 ${
                                            quizSubmitted[activeModule]
                                              ? oIndex === question.correctAnswer
                                                ? "bg-green-900/30 border-green-700/50 text-green-400"
                                                : quizAnswers[question.id] === oIndex
                                                  ? "bg-red-900/30 border-red-700/50 text-red-400"
                                                  : "bg-gray-800/50 border-gray-700/30 text-gray-400"
                                              : quizAnswers[question.id] === oIndex
                                                ? "bg-cyan-900/30 border-cyan-700/50"
                                                : "bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50"
                                          }`}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                              <Button
                                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                                onClick={handleQuizSubmit}
                                disabled={
                                  quizSubmitted[activeModule] ||
                                  !course.modules
                                    .find((m: any) => m.id === activeModule)
                                    ?.quizQuestions.every((q: any) => quizAnswers[q.id] !== undefined)
                                }
                              >
                                {quizSubmitted[activeModule] ? "Quiz Submitted" : "Submit Quiz"}
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

