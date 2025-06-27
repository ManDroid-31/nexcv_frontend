// think of thsi as middleware for frontend store and backend database  to save and delete resumes 

"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useResumeStore } from '@/stores/resume-store'
import { ResumeData } from '@/types/resume'
import { toast } from 'sonner'
import { useUserCredits } from './use-user-credits'
import { useUser } from '@clerk/nextjs'
import { useResumeContext } from '@/providers/ResumeContext'

export function useResumeList() {
  const context = useResumeContext();
  // For listing resumes, use context
  return {
    resumes: context.resumes,
    isLoading: context.isLoading,
    error: context.error,
    refresh: context.refresh,
  };
}

export const useResume = (id?: string) => {
  const {
    resumeData,
    isLoading,
    error,
    updateResumeData,
    clearResumeData,
    setLoading,
    setError,
    loadResume,
    saveResume,
    deleteResume,
    listResumes
  } = useResumeStore()

  // Get user info and credits
  const { user, credits, isLoading: isUserLoading, error: userError } = useUserCredits();
  const clerkUser = useUser().user;
  const userId = clerkUser?.id;

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async () => {
    if (!id || !userId) return
    try {
      setLoading(true)
      setError(null)
      await loadResume(id, userId)
      toast.success('Resume loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resume'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, setError, setLoading, loadResume, userId])

  const save = useCallback(async (data: ResumeData) => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      await saveResume(data, userId, id)
      toast.success('Resume saved successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save resume'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [id, setError, setLoading, saveResume, userId])

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data: ResumeData) => {
    if (!id || !data || !userId) return
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveResume(data, userId, id)
        console.log('Auto-saved resume')
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 3500)
  }, [id, saveResume, userId])

  const remove = useCallback(async (resumeId: string) => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      await deleteResume(resumeId, userId)
      clearResumeData()
      toast.success('Resume deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete resume'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [clearResumeData, setError, setLoading, deleteResume, userId])

  const list = useCallback(async () => {
    if (!userId) return []
    try {
      setLoading(true)
      setError(null)
      const resumes = await listResumes(userId)
      return resumes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list resumes'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setError, setLoading, listResumes, userId])

  // Auto-save effect - triggers when resumeData changes
  useEffect(() => {
    if (resumeData && id) {
      autoSave(resumeData)
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [resumeData, id, autoSave])

  useEffect(() => {
    if (id) {
      load()
    }
  }, [id, load])

  useEffect(() => {
    if (userId) {
      listResumes(userId);
    }
  }, [userId, listResumes]);

  return {
    // State
    resumeData,
    isLoading,
    error,
    user,
    credits,
    isUserLoading,
    userError,
    // Actions
    updateResumeData,
    save,
    remove,
    list,
    load
  }
} 