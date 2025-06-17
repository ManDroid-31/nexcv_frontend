"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Template {
  id: string
  name: string
  category: string
  description: string
  preview: string
  tags: string[]
}

type TemplateStore = {
  // State
  templates: Template[]
  currentTemplate: string
  
  // Actions
  setCurrentTemplate: (template: string) => void
  getTemplate: (id: string) => Template | undefined
}

// Initial state
const initialState = {
  templates: [
    {
      id: "modern",
      name: "Modern",
      category: "Professional",
      description: "Clean and contemporary design perfect for tech roles",
      preview: "/templates/modern/preview.png",
      tags: ["Tech", "Minimal", "ATS-Friendly"],
    },
    {
      id: "executive",
      name: "Executive",
      category: "Professional",
      description: "Sophisticated layout for senior positions",
      preview: "/templates/executive/preview.png",
      tags: ["Leadership", "Corporate", "Premium"],
    },
    {
      id: "creative",
      name: "Creative",
      category: "Design",
      description: "Bold and artistic for creative professionals",
      preview: "/templates/creative/preview.png",
      tags: ["Design", "Creative", "Colorful"],
    },
    {
      id: "academic",
      name: "Academic",
      category: "Education",
      description: "Traditional format for academic positions",
      preview: "/templates/academic/preview.png",
      tags: ["Academic", "Research", "Traditional"],
    },
    {
      id: "minimal",
      name: "Minimal",
      category: "Professional",
      description: "Simple and elegant design",
      preview: "/templates/minimal/preview.png",
      tags: ["Simple", "Clean", "ATS-Friendly"],
    },
    {
      id: "startup",
      name: "Startup",
      category: "Tech",
      description: "Dynamic layout for startup environments",
      preview: "/templates/startup/preview.png",
      tags: ["Startup", "Dynamic", "Modern"],
    },
  ],
  currentTemplate: "modern"
}

// Create store
export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentTemplate: (template: string) => 
        set({ currentTemplate: template }),

      getTemplate: (id: string) => 
        get().templates.find(t => t.id === id)
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({ 
        currentTemplate: state.currentTemplate 
      })
    }
  )
) 