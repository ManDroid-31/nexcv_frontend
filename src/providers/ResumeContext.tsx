'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ResumeData } from '@/types/resume';

interface ResumeContextType {
  resumes: ResumeData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  fetchAll: () => Promise<void>;
  // Optionally add CRUD methods here
}

const ResumeContext = createContext<ResumeContextType>({
  resumes: [],
  isLoading: true,
  error: null,
  refresh: () => {},
  fetchAll: async () => {},
});

export const useResumeContext = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resumes/all');
      if (!res.ok) throw new Error('Failed to fetch resumes');
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refresh = () => {
    fetchAll();
  };

  return (
    <ResumeContext.Provider value={{ resumes, isLoading, error, refresh, fetchAll }}>
      {children}
    </ResumeContext.Provider>
  );
};

export { ResumeContext }; 