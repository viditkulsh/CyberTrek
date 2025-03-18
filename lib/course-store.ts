"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Course, Achievement, LeaderboardEntry } from "./types"
import { Shield, Lock, Database, Code, Cpu, BookOpen, Award, Zap, Trophy } from "lucide-react"

interface CourseStore {
  courses: Course[]
  achievements: Achievement[]
  leaderboard: LeaderboardEntry[]

  getCourse: (id: string) => Course | undefined
  getAchievement: (id: string) => Achievement | undefined
  updateCourseProgress: (courseId: string, moduleId: string, completed: boolean) => void
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [
        {
          id: "intro-cybersec",
          title: "Introduction to Cybersecurity",
          description: "Learn the fundamentals of cybersecurity and basic threat models",
          level: "Beginner",
          duration: "2 hours",
          icon: Shield,
          premium: false,
          stakingRequirement: 0,
          rewardAmount: 50,
          minStakingPeriodDays: 0,
          modules: [
            {
              id: "cybersec-basics",
              title: "Cybersecurity Basics",
              description: "Understanding the core concepts of cybersecurity",
              content:
                "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks...",
              quizQuestions: [
                {
                  id: "q1",
                  question: "What is the primary goal of cybersecurity?",
                  options: [
                    "To make computers faster",
                    "To protect systems from unauthorized access",
                    "To develop new software",
                    "To increase internet speed",
                  ],
                  correctAnswer: 1,
                },
              ],
              completed: false,
            },
          ],
        },
        {
          id: "ethical-hacking",
          title: "Ethical Hacking Basics",
          description: "Discover the tools and techniques used by ethical hackers",
          level: "Intermediate",
          duration: "4 hours",
          icon: Lock,
          premium: true,
          stakingRequirement: 50,
          rewardAmount: 100,
          minStakingPeriodDays: 7,
          modules: [
            {
              id: "ethical-intro",
              title: "Introduction to Ethical Hacking",
              description: "Understanding the role and responsibilities of ethical hackers",
              content: "Ethical hacking involves identifying weaknesses in computer systems and networks...",
              quizQuestions: [
                {
                  id: "q1",
                  question: "What distinguishes ethical hackers from malicious hackers?",
                  options: [
                    "Ethical hackers use different tools",
                    "Ethical hackers have permission to test systems",
                    "Ethical hackers only work at night",
                    "Ethical hackers are faster",
                  ],
                  correctAnswer: 1,
                },
              ],
              completed: false,
            },
          ],
        },
        {
          id: "blockchain-101",
          title: "Blockchain Fundamentals",
          description: "Understand the core concepts behind blockchain technology",
          level: "Beginner",
          duration: "3 hours",
          icon: Database,
          premium: false,
          stakingRequirement: 0,
          rewardAmount: 50,
          minStakingPeriodDays: 0,
          modules: [
            {
              id: "blockchain-intro",
              title: "Introduction to Blockchain",
              description: "Understanding the basics of blockchain technology",
              content: "A blockchain is a distributed ledger that records transactions across many computers...",
              quizQuestions: [
                {
                  id: "q1",
                  question: "What is a key feature of blockchain technology?",
                  options: [
                    "Centralized control",
                    "Fast transaction processing",
                    "Immutable record-keeping",
                    "Low energy consumption",
                  ],
                  correctAnswer: 2,
                },
              ],
              completed: false,
            },
          ],
        },
        {
          id: "smart-contracts",
          title: "Smart Contract Development",
          description: "Learn to write and audit secure smart contracts",
          level: "Advanced",
          duration: "6 hours",
          icon: Code,
          premium: true,
          stakingRequirement: 100,
          rewardAmount: 200,
          minStakingPeriodDays: 14,
          modules: [
            {
              id: "smart-intro",
              title: "Introduction to Smart Contracts",
              description: "Understanding what smart contracts are and how they work",
              content: "Smart contracts are self-executing contracts with the terms directly written into code...",
              quizQuestions: [
                {
                  id: "q1",
                  question: "What language is commonly used to write Ethereum smart contracts?",
                  options: ["JavaScript", "Python", "Solidity", "C++"],
                  correctAnswer: 2,
                },
              ],
              completed: false,
            },
          ],
        },
        {
          id: "cryptography",
          title: "Applied Cryptography",
          description: "Master the principles of modern cryptographic systems",
          level: "Intermediate",
          duration: "5 hours",
          icon: Cpu,
          premium: true,
          stakingRequirement: 75,
          rewardAmount: 150,
          minStakingPeriodDays: 10,
          modules: [
            {
              id: "crypto-intro",
              title: "Introduction to Cryptography",
              description: "Understanding the basics of encryption and decryption",
              content: "Cryptography is the practice of secure communication in the presence of adversaries...",
              quizQuestions: [
                {
                  id: "q1",
                  question: "What is the difference between symmetric and asymmetric encryption?",
                  options: [
                    "Symmetric uses one key, asymmetric uses two keys",
                    "Symmetric is faster, asymmetric is slower",
                    "Symmetric is newer, asymmetric is older",
                    "There is no difference",
                  ],
                  correctAnswer: 0,
                },
              ],
              completed: false,
            },
          ],
        },
      ],

      achievements: [
        {
          id: "first-login",
          title: "Digital Initiate",
          description: "Log in to CyberTrek for the first time",
          icon: Award,
          xpReward: 50,
          category: "general",
          difficulty: 1,
          isActive: true,
        },
        {
          id: "first-course",
          title: "Knowledge Seeker",
          description: "Complete your first course",
          icon: BookOpen,
          xpReward: 100,
          category: "learning",
          difficulty: 1,
          isActive: true,
        },
        {
          id: "first-stake",
          title: "Token Staker",
          description: "Stake QUEST tokens for the first time",
          icon: Zap,
          xpReward: 150,
          category: "staking",
          difficulty: 2,
          isActive: true,
        },
        {
          id: "security-expert",
          title: "Security Expert",
          description: "Complete all cybersecurity courses",
          icon: Shield,
          xpReward: 500,
          category: "cybersecurity",
          difficulty: 4,
          isActive: true,
        },
        {
          id: "blockchain-master",
          title: "Blockchain Master",
          description: "Complete all blockchain courses",
          icon: Database,
          xpReward: 500,
          category: "blockchain",
          difficulty: 4,
          isActive: true,
        },
        {
          id: "crypto-wizard",
          title: "Crypto Wizard",
          description: "Complete the Applied Cryptography course with a perfect score",
          icon: Trophy,
          xpReward: 300,
          category: "cryptography",
          difficulty: 3,
          isActive: true,
        },
      ],

      leaderboard: [
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
      ],

      getCourse: (id) => {
        return get().courses.find((course) => course.id === id)
      },

      getAchievement: (id) => {
        return get().achievements.find((achievement) => achievement.id === id)
      },

      updateCourseProgress: (courseId, moduleId, completed) => {
        const { courses } = get()

        const updatedCourses = courses.map((course) => {
          if (course.id === courseId) {
            const updatedModules = course.modules.map((module) => {
              if (module.id === moduleId) {
                return { ...module, completed }
              }
              return module
            })

            return { ...course, modules: updatedModules }
          }
          return course
        })

        set({ courses: updatedCourses })
      },
    }),
    {
      name: "cybertrek-course-storage",
    },
  ),
)

