"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ResumeData } from '@/types/resume'
import debounce from 'lodash/debounce'
import { getResumeById, createResume, updateResume, deleteResume, getResumes, defaultResumeData } from '@/data/resume'

interface ResumeState {
  // State
  resumeData: ResumeData | null;
  previewData: ResumeData | null;
  resumes: ResumeData[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  currentTemplate: string;
  // Draft tracking per resume
  draftStatus: Record<string, { hasUnsavedChanges: boolean; lastSavedAt: number | null }>;
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (data: Partial<ResumeData>) => void;
  clearResumeData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPreviewData: (data: ResumeData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentTemplate: (template: string) => void;
  // Draft actions
  markAsSaved: (resumeId?: string) => void;
  markAsUnsaved: (resumeId?: string) => void;
  // Async actions
  loadResume: (id: string, userId?: string) => Promise<void>;
  saveResume: (data: ResumeData, userId?: string, id?: string) => Promise<ResumeData>;
  deleteResume: (id: string, userId?: string) => Promise<void>;
  listResumes: (userId?: string) => Promise<ResumeData[]>;
  updatePreviewData: (data: Partial<ResumeData>) => void;
  // Getter to ensure previewData is always available
  getPreviewData: () => ResumeData | null;
  // Getter to check if resume is in draft state
  isDraft: (resumeId?: string) => boolean;
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
        // Draft tracking per resume
        draftStatus: {},
        setResumeData: (data: ResumeData) => set({
          resumeData: data,
          previewData: data,
          lastUpdate: Date.now(),
          error: null,
          // If data has an ID, it's loaded from backend, so mark as saved
          draftStatus: data.id ? {
            ...get().draftStatus,
            [data.id]: { hasUnsavedChanges: false, lastSavedAt: Date.now() }
          } : get().draftStatus,
        }),
        updateResumeData: (data: Partial<ResumeData>) => set((state) => {
          const newData = state.resumeData ? { ...state.resumeData, ...data } : null
          // Immediately update resume data
          const newState: Partial<ResumeState> = {
            resumeData: newData,
            lastUpdate: Date.now(),
            error: null,
          };
          
          // Mark as having unsaved changes when data is updated
          if (newData?.id) {
            newState.draftStatus = {
              ...state.draftStatus,
              [newData.id]: { 
                hasUnsavedChanges: true, 
                lastSavedAt: state.draftStatus[newData.id]?.lastSavedAt || null 
              }
            };
          }
          
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
        // Draft actions
        markAsSaved: (resumeId?: string) => set((state) => {
          const targetId = resumeId || state.resumeData?.id;
          if (!targetId) return state;
          
          return {
            draftStatus: {
              ...state.draftStatus,
              [targetId]: { hasUnsavedChanges: false, lastSavedAt: Date.now() }
            }
          };
        }),
        markAsUnsaved: (resumeId?: string) => set((state) => {
          const targetId = resumeId || state.resumeData?.id;
          if (!targetId) return state;
          
          return {
            draftStatus: {
              ...state.draftStatus,
              [targetId]: { 
                hasUnsavedChanges: true, 
                lastSavedAt: state.draftStatus[targetId]?.lastSavedAt || null 
              }
            }
          };
        }),
        // Getter to ensure previewData is always available
        getPreviewData: () => {
          const state = get();
          return state.previewData || state.resumeData;
        },
        // Getter to check if resume is in draft state
        isDraft: (resumeId?: string) => {
          const state = get();
          const targetId = resumeId || state.resumeData?.id;
          if (!targetId) return false;
          return state.draftStatus[targetId]?.hasUnsavedChanges || false;
        },
        loadResume: async (id: string, userId?: string) => {
          try {
            set({ isLoading: true });
            const data = await getResumeById(id, userId);
            set({ 
              resumeData: data, 
              previewData: data, 
              error: null, 
              isLoading: false,
              // Mark as saved when loaded from backend
              draftStatus: {
                ...get().draftStatus,
                [id]: { hasUnsavedChanges: false, lastSavedAt: Date.now() }
              }
            });
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
            set({ 
              resumeData: savedData, 
              previewData: savedData, 
              error: null, 
              isLoading: false,
              // Mark as saved after successful save
              draftStatus: {
                ...get().draftStatus,
                [savedData.id!]: { hasUnsavedChanges: false, lastSavedAt: Date.now() }
              }
            });
            return savedData;
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to save resume', isLoading: false });
            throw err;
          }
        },
        deleteResume: async (id: string, userId?: string) => {
          try {
            set({ isLoading: true });
            await deleteResume(id, userId);
            const state = get();
            const newDraftStatus = { ...state.draftStatus };
            delete newDraftStatus[id];
            set({ 
              resumeData: null, 
              previewData: null, 
              error: null, 
              isLoading: false,
              draftStatus: newDraftStatus,
            });
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
        draftStatus: state.draftStatus,
      })
    }
  )
) 