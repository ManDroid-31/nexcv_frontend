

// think of thsi as middleware for frontend store and backend database  to save and delete resumes 


"use client"

import { useEffect, useCallback } from 'react'
import { useResumeStore } from '@/stores/resume-store'
import { ResumeData } from '@/types/resume'

const API_BASE_URL = 'http://localhost:5000/api/resumes'

export const useResume = (id?: string) => {
  const {
    resumeData,
    isLoading,
    error,
    setResumeData,
    updateResumeData,
    clearResumeData,
    setLoading,
    setError
  } = useResumeStore()

  const loadResume = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch resume')
      }

      const data = await response.json()
      setResumeData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resume')
    } finally {
      setLoading(false)
    }
  }, [id, setResumeData, setError, setLoading])

  const save = useCallback(async (data: ResumeData) => {
    try {
      setLoading(true)
      const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL
      const method = id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save resume')
      }

      const savedData = await response.json()
      setResumeData(savedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume')
      throw err
    } finally {
      setLoading(false)
    }
  }, [id, setResumeData, setError, setLoading])

  const remove = useCallback(async (resumeId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${resumeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete resume')
      }

      clearResumeData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume')
      throw err
    } finally {
      setLoading(false)
    }
  }, [clearResumeData, setError, setLoading])

  const list = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL)
      
      if (!response.ok) {
        throw new Error('Failed to list resumes')
      }

      const resumes = await response.json()
      return resumes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list resumes')
      throw err
    } finally {
      setLoading(false)
    }
  }, [setError, setLoading])

  useEffect(() => {
    loadResume()
  }, [loadResume])

  return {
    // State
    resumeData,
    isLoading,
    error,

    // Actions
    updateResumeData,
    save,
    remove,
    list,
    loadResume
  }
} 