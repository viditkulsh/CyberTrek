import type React from "react"
// User data types
export interface UserData {
  walletAddress: string
  xp: number
  level: number
  questTokens: number
  completedCourses: string[]
  achievements: string[]
  stakedTokens: number
  stakingEndTime: number
  enrolledCourses: EnrolledCourse[]
}

export interface EnrolledCourse {
  courseId: string
  stakedAmount: number
  enrollmentTime: number
  completed: boolean
  rewardClaimed: boolean
}

// Course types
export interface Course {
  id: string
  title: string
  description: string
  level: string
  duration: string
  icon: React.ReactNode
  premium: boolean
  stakingRequirement: number
  rewardAmount: number
  minStakingPeriodDays: number
  modules: CourseModule[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  content: string
  quizQuestions: QuizQuestion[]
  completed: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

// Achievement types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  xpReward: number
  category: string
  difficulty: number
  isActive: boolean
}

// Leaderboard types
export interface LeaderboardEntry {
  name: string
  wallet: string
  level: number
  xp: number
}

