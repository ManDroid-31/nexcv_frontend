"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ResumeData } from '@/types/resume'
import debounce from 'lodash/debounce'
import { getResumeById, createResume, updateResume, deleteResume, getResumes } from '@/data/resume'

interface ResumeState {
  // State
  resumeData: ResumeData | null;
  previewData: ResumeData | null;
  resumes: ResumeData[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  currentTemplate: string;
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (data: Partial<ResumeData>) => void;
  clearResumeData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPreviewData: (data: ResumeData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentTemplate: (template: string) => void;
  // Async actions
  loadResume: (id: string, userId?: string) => Promise<void>;
  saveResume: (data: ResumeData, userId?: string, id?: string) => Promise<void>;
  deleteResume: (id: string, userId?: string) => Promise<void>;
  listResumes: (userId?: string) => Promise<ResumeData[]>;
  updatePreviewData: (data: Partial<ResumeData>) => void;
  // Getter to ensure previewData is always available
  getPreviewData: () => ResumeData | null;
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
    (set, get) => {
      // Create debounced preview update function
      const debouncedPreviewUpdate = debounce((data: ResumeData) => {
        set({ previewData: data });
      }, 50);

      return {
        resumeData: defaultResumeData,
        previewData: defaultResumeData,
        resumes: [],
        isLoading: false,
        error: null,
        lastUpdate: Date.now(),
        currentTemplate: 'modern',
        setResumeData: (data: ResumeData) => set({
          resumeData: data,
          previewData: data,
          lastUpdate: Date.now(),
          error: null,
        }),
        updateResumeData: (data: Partial<ResumeData>) => set((state) => {
          const newData = state.resumeData ? { ...state.resumeData, ...data } : null
          // Immediately update resume data
          const newState: Partial<ResumeState> = {
            resumeData: newData,
            lastUpdate: Date.now(),
            error: null,
          };
          
          // For immediate feedback, update preview data immediately for certain fields
          if (newData) {
            const immediateFields = ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'];
            const hasImmediateField = Object.keys(data).some(key => immediateFields.includes(key));
            
            if (hasImmediateField) {
              // Update preview immediately for content fields
              newState.previewData = newData;
            } else {
              // Debounce preview update for layout/template changes
              debouncedPreviewUpdate(newData);
            }
          }
          
          return newState;
        }),
        updatePreviewData: (data: Partial<ResumeData>) => set((state) => {
          const newData = state.previewData ? { ...state.previewData, ...data } : null
          return {
            previewData: newData,
            lastUpdate: Date.now(),
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
        setPreviewData: (data: ResumeData | null) => set({ previewData: data }),
        setIsLoading: (loading: boolean) => set({ isLoading: loading }),
        setCurrentTemplate: (template: string) => set({ currentTemplate: template }),
        // Getter to ensure previewData is always available
        getPreviewData: () => {
          const state = get();
          return state.previewData || state.resumeData;
        },
        loadResume: async (id: string, userId?: string) => {
          try {
            set({ isLoading: true });
            const data = await getResumeById(id, userId);
            set({ resumeData: data, previewData: data, error: null, isLoading: false });
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to load resume', isLoading: false });
          }
        },
        saveResume: async (data: ResumeData, userId?: string, id?: string) => {
          try {
            set({ isLoading: true });
            let savedData;
            if (id) {
              savedData = await updateResume(id, data, userId);
            } else {
              savedData = await createResume(data, userId);
            }
            set({ resumeData: savedData, previewData: savedData, error: null, isLoading: false });
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to save resume', isLoading: false });
          }
        },
        deleteResume: async (id: string, userId?: string) => {
          try {
            set({ isLoading: true });
            await deleteResume(id, userId);
            set({ resumeData: null, previewData: null, error: null, isLoading: false });
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to delete resume', isLoading: false });
          }
        },
        listResumes: async (userId?: string) => {
          try {
            set({ isLoading: true });
            const resumes = await getResumes(userId);
            set({ resumes, error: null, isLoading: false });
            return resumes;
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to list resumes', isLoading: false });
            return [];
          }
        },
      }
    },
    {
      name: 'resume-storage',
      partialize: (state) => ({ 
        resumeData: state.resumeData,
        previewData: state.previewData,
        resumes: state.resumes,
        currentTemplate: state.currentTemplate,
      })
    }
  )
) 