"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ResumeData } from '@/types/resume'
import debounce from 'lodash/debounce'

// Add template styles
export const templateStyles = {
  modern: {
    container: "bg-white shadow-lg rounded-lg",
    header: "text-center mb-8",
    name: "text-3xl font-bold mb-2",
    contact: "text-gray-600",
    section: "mb-6",
    sectionTitle: "text-xl font-semibold mb-2",
    sectionContent: "text-gray-700",
    tag: "px-2 py-1 bg-gray-100 rounded-full text-xs",
  },
  executive: {
    container: "bg-white shadow-lg rounded-lg",
    header: "text-left mb-8",
    name: "text-3xl font-bold mb-2",
    contact: "text-gray-600",
    section: "mb-6",
    sectionTitle: "text-xl font-semibold mb-2 border-b pb-2",
    sectionContent: "text-gray-700",
    tag: "px-2 py-1 bg-gray-100 rounded-full text-xs",
  },
  creative: {
    container: "bg-white shadow-lg rounded-lg",
    header: "text-center mb-8",
    name: "text-3xl font-bold mb-2 text-blue-600",
    contact: "text-gray-600",
    section: "mb-6",
    sectionTitle: "text-xl font-semibold mb-2 text-blue-600",
    sectionContent: "text-gray-700",
    tag: "px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs",
  },
  academic: {
    container: "bg-white shadow-lg rounded-lg",
    header: "text-left mb-8",
    name: "text-3xl font-bold mb-2",
    contact: "text-gray-600",
    section: "mb-6",
    sectionTitle: "text-xl font-semibold mb-2",
    sectionContent: "text-gray-700",
    tag: "px-2 py-1 bg-gray-100 rounded-full text-xs",
  },
  minimal: {
    container: "bg-white shadow-sm rounded-lg",
    header: "text-center mb-8",
    name: "text-2xl font-bold mb-2",
    contact: "text-gray-600 text-sm",
    section: "mb-6",
    sectionTitle: "text-lg font-semibold mb-2",
    sectionContent: "text-gray-700 text-sm",
    tag: "px-2 py-1 bg-gray-50 rounded-full text-xs",
  },
  startup: {
    container: "bg-white shadow-lg rounded-lg",
    header: "text-center mb-8",
    name: "text-3xl font-bold mb-2 text-purple-600",
    contact: "text-gray-600",
    section: "mb-6",
    sectionTitle: "text-xl font-semibold mb-2 text-purple-600",
    sectionContent: "text-gray-700",
    tag: "px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs",
  },
} as const;

export type TemplateStyle = typeof templateStyles;
export type TemplateType = keyof TemplateStyle;

interface ResumeState {
  // State
  resumeData: ResumeData | null
  previewData: ResumeData | null
  isLoading: boolean
  error: string | null
  lastUpdate: number
  currentTemplate: string
}

// Default resume data
const defaultResumeData: ResumeData = {
  title: "Software Engineer Resume",
  slug: "software-engineer-resume",
  isPublic: true,
  template: "modern",
  tags: [],
  layout: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  personalInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "johndoe.dev",
  },
  summary: "Experienced software engineer with 5+ years building scalable web applications.",
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2022-01",
      endDate: "Present",
      description: "Led development of microservices architecture serving 1M+ users.",
    },
  ],
  education: [
    {
      id: "1",
      school: "University of Technology",
      degree: "Bachelor of Computer Science",
      startDate: "2016-09",
      endDate: "2020-05",
    },
  ],
  projects: [
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Built a scalable e-commerce platform using Next.js and Node.js",
      technologies: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      startDate: "2023-01",
      endDate: "2023-06"
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  customSections: [],
  sectionOrder: [
    "personalInfo",
    "summary",
    "experience",
    "education",
    "projects",
    "skills"
  ]
}

// Create store
export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      // Initial state
      resumeData: defaultResumeData,
      previewData: defaultResumeData,
      isLoading: false,
      error: null,
      lastUpdate: Date.now(),
      currentTemplate: 'modern',

      // Actions
      setResumeData: (data: ResumeData) => set({
        resumeData: data,
        previewData: data,
        lastUpdate: Date.now(),
        error: null,
      }),

      updateResumeData: (data: Partial<ResumeData>) => set((state) => {
        const newData = state.resumeData ? { ...state.resumeData, ...data } : null
        return {
          resumeData: newData,
          previewData: newData,
          lastUpdate: Date.now(),
          error: null,
        }
      }),

      clearResumeData: () => set({
        resumeData: null,
        previewData: null,
        lastUpdate: Date.now(),
        error: null,
      }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      setTemplate: (template: string) => set((state) => ({
        currentTemplate: template,
        resumeData: state.resumeData ? { ...state.resumeData, template } : null,
        previewData: state.previewData ? { ...state.previewData, template } : null,
      })),

      updatePreview: debounce((data: ResumeData) => {
        set((state) => {
          if (JSON.stringify(state.previewData) === JSON.stringify(data)) {
            return state
          }
          return { 
            previewData: data, 
            lastUpdate: Date.now() 
          }
        })
      }, 100),
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({ 
        resumeData: state.resumeData,
        currentTemplate: state.currentTemplate,
      })
    }
  )
) 