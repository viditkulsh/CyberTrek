"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserData, EnrolledCourse } from "./types"

interface UserStore {
  userData: UserData | null
  isAuthenticated: boolean
  walletType: "metamask" | "phantom" | null

  // Authentication actions
  setUserData: (data: UserData) => void
  setAuthenticated: (status: boolean, walletType: "metamask" | "phantom" | null) => void
  logout: () => void

  // User data actions
  addXp: (amount: number) => void
  addQuestTokens: (amount: number) => void
  stakeTokens: (amount: number, durationDays: number) => void
  withdrawStake: (courseId: string) => number
  enrollInCourse: (courseId: string, amount: number) => void
  completeCourse: (courseId: string) => void
  claimReward: (courseId: string) => number
  unlockAchievement: (achievementId: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userData: null,
      isAuthenticated: false,
      walletType: null,

      setUserData: (data) => set({ userData: data }),

      setAuthenticated: (status, walletType) =>
        set({
          isAuthenticated: status,
          walletType,
        }),

      logout: () => {
        localStorage.removeItem("walletAddress")
        localStorage.removeItem("authNonce")
        localStorage.removeItem("walletType")
        set({
          isAuthenticated: false,
          userData: null,
          walletType: null,
        })
      },

      addXp: (amount) => {
        const { userData } = get()
        if (!userData) return

        let newXp = userData.xp + amount
        let newLevel = userData.level

        // Level up if enough XP
        while (newXp >= newLevel * 1000) {
          newXp -= newLevel * 1000
          newLevel++
        }

        set({
          userData: {
            ...userData,
            xp: newXp,
            level: newLevel,
          },
        })
      },

      addQuestTokens: (amount) => {
        const { userData } = get()
        if (!userData) return

        set({
          userData: {
            ...userData,
            questTokens: userData.questTokens + amount,
          },
        })
      },

      stakeTokens: (amount, durationDays) => {
        const { userData } = get()
        if (!userData || userData.questTokens < amount) return

        const stakingEndTime = Date.now() + durationDays * 24 * 60 * 60 * 1000

        set({
          userData: {
            ...userData,
            questTokens: userData.questTokens - amount,
            stakedTokens: userData.stakedTokens + amount,
            stakingEndTime,
          },
        })
      },

      withdrawStake: (courseId) => {
        const { userData } = get()
        if (!userData) return 0

        const enrolledCourseIndex = userData.enrolledCourses.findIndex((course) => course.courseId === courseId)

        if (enrolledCourseIndex === -1) return 0

        const enrolledCourse = userData.enrolledCourses[enrolledCourseIndex]
        const { stakedAmount, enrollmentTime } = enrolledCourse

        // Apply early withdrawal fee if within minimum staking period (7 days)
        const minStakingPeriod = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
        const earlyWithdrawalFee = 20 // 20%

        let penalty = 0
        if (Date.now() < enrollmentTime + minStakingPeriod) {
          penalty = Math.floor((stakedAmount * earlyWithdrawalFee) / 100)
        }

        const returnAmount = stakedAmount - penalty

        // Update enrolled courses
        const updatedEnrolledCourses = [...userData.enrolledCourses]
        updatedEnrolledCourses.splice(enrolledCourseIndex, 1)

        set({
          userData: {
            ...userData,
            questTokens: userData.questTokens + returnAmount,
            enrolledCourses: updatedEnrolledCourses,
          },
        })

        return returnAmount
      },

      enrollInCourse: (courseId, amount) => {
        const { userData } = get()
        if (!userData || userData.questTokens < amount) return

        // Check if already enrolled
        const existingEnrollment = userData.enrolledCourses.find((course) => course.courseId === courseId)

        let updatedEnrolledCourses = [...userData.enrolledCourses]

        if (existingEnrollment) {
          // Update existing enrollment
          updatedEnrolledCourses = updatedEnrolledCourses.map((course) =>
            course.courseId === courseId ? { ...course, stakedAmount: course.stakedAmount + amount } : course,
          )
        } else {
          // Create new enrollment
          const newEnrollment: EnrolledCourse = {
            courseId,
            stakedAmount: amount,
            enrollmentTime: Date.now(),
            completed: false,
            rewardClaimed: false,
          }

          updatedEnrolledCourses.push(newEnrollment)
        }

        set({
          userData: {
            ...userData,
            questTokens: userData.questTokens - amount,
            enrolledCourses: updatedEnrolledCourses,
          },
        })
      },

      completeCourse: (courseId) => {
        const { userData } = get()
        if (!userData) return

        // Update enrolled course status
        const updatedEnrolledCourses = userData.enrolledCourses.map((course) =>
          course.courseId === courseId ? { ...course, completed: true } : course,
        )

        // Add to completed courses list if not already there
        const updatedCompletedCourses = [...userData.completedCourses]
        if (!updatedCompletedCourses.includes(courseId)) {
          updatedCompletedCourses.push(courseId)
        }

        set({
          userData: {
            ...userData,
            enrolledCourses: updatedEnrolledCourses,
            completedCourses: updatedCompletedCourses,
          },
        })
      },

      claimReward: (courseId) => {
        const { userData } = get()
        if (!userData) return 0

        const enrolledCourse = userData.enrolledCourses.find(
          (course) => course.courseId === courseId && course.completed && !course.rewardClaimed,
        )

        if (!enrolledCourse) return 0

        // Determine reward amount based on course
        // In a real app, this would come from the course data
        const rewardAmount = 50 // Default reward

        // Update enrolled course
        const updatedEnrolledCourses = userData.enrolledCourses.map((course) =>
          course.courseId === courseId ? { ...course, rewardClaimed: true } : course,
        )

        set({
          userData: {
            ...userData,
            questTokens: userData.questTokens + enrolledCourse.stakedAmount + rewardAmount,
            enrolledCourses: updatedEnrolledCourses,
          },
        })

        return rewardAmount
      },

      unlockAchievement: (achievementId) => {
        const { userData } = get()
        if (!userData) return

        // Check if achievement already unlocked
        if (userData.achievements.includes(achievementId)) return

        // Add achievement and XP reward
        // In a real app, XP would come from achievement data
        const xpReward = 100 // Default XP reward

        set({
          userData: {
            ...userData,
            achievements: [...userData.achievements, achievementId],
            xp: userData.xp + xpReward,
          },
        })
      },
    }),
    {
      name: "cybertrek-user-storage",
    },
  ),
)

