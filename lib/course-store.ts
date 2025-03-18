"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, Achievement, LeaderboardEntry, CourseModule, QuizQuestion } from "./types";
import { Shield, Lock, Database, Code, Cpu, BookOpen, Award, Zap, Trophy } from "lucide-react";

// Map of icon names to Lucide React components
const iconMap = {
  Shield,
  Lock,
  Database,
  Code,
  Cpu,
  BookOpen,
  Award,
  Zap,
  Trophy,
};

// Define the shape of our store
interface CourseStore {
  courses: Course[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];

  getCourse: (id: string) => Course | undefined;
  getAchievement: (id: string) => Achievement | undefined;
  updateCourseProgress: (courseId: string, moduleId: string, completed: boolean) => void;
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
          icon: "Shield", // Storing as string for later mapping
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
          icon: "Lock",
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
          icon: "Database",
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
      ],

      achievements: [
        {
          id: "first-login",
          title: "Digital Initiate",
          description: "Log in to CyberTrek for the first time",
          icon: "Award",
          xpReward: 50,
          category: "general",
          difficulty: 1,
          isActive: true,
        },
        {
          id: "first-course",
          title: "Knowledge Seeker",
          description: "Complete your first course",
          icon: "BookOpen",
          xpReward: 100,
          category: "learning",
          difficulty: 1,
          isActive: true,
        },
        {
          id: "first-stake",
          title: "Token Staker",
          description: "Stake QUEST tokens for the first time",
          icon: "Zap",
          xpReward: 150,
          category: "staking",
          difficulty: 2,
          isActive: true,
        },
        {
          id: "blockchain-master",
          title: "Blockchain Master",
          description: "Complete all blockchain courses",
          icon: "Database",
          xpReward: 500,
          category: "blockchain",
          difficulty: 4,
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
      ],

      getCourse: (id) => get().courses.find((course) => course.id === id),

      getAchievement: (id) => get().achievements.find((achievement) => achievement.id === id),

      updateCourseProgress: (courseId, moduleId, completed) => {
        const { courses } = get();

        const updatedCourses = courses.map((course) => {
          if (course.id === courseId) {
            const updatedModules = course.modules.map((module) => {
              if (module.id === moduleId) {
                return { ...module, completed };
              }
              return module;
            });

            return { ...course, modules: updatedModules };
          }
          return course;
        });

        set({ courses: updatedCourses });
      },
    }),
    { name: "cybertrek-course-storage" }
  )
);
