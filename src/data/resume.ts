import { ResumeData } from '@/types/resume';

// Use relative URLs for all resume requests (proxy through Next.js API)
const BASE_URL = '/api/resumes';

// Helper function to transform backend response to frontend format
const transformBackendResponse = (backendResume: Record<string, unknown>): ResumeData => {
  return {
    id: backendResume.id as string,
    title: backendResume.title as string,
    slug: backendResume.slug as string,
    isPublic: backendResume.visibility === 'public',
    template: backendResume.template as string,
    tags: (backendResume.tags as string[]) || [],
    layout: (backendResume.data as Record<string, unknown>)?.layout as ResumeData['layout'] || {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 24, paragraphGap: 12, lineHeight: 1.5 },
      scale: 1
    },
    personalInfo: (backendResume.data as Record<string, unknown>)?.personalInfo as ResumeData['personalInfo'] || {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    summary: (backendResume.data as Record<string, unknown>)?.summary as string || '',
    experience: (backendResume.data as Record<string, unknown>)?.experience as ResumeData['experience'] || [],
    education: (backendResume.data as Record<string, unknown>)?.education as ResumeData['education'] || [],
    projects: (backendResume.data as Record<string, unknown>)?.projects as ResumeData['projects'] || [],
    skills: (backendResume.data as Record<string, unknown>)?.skills as string[] || [],
    customSections: (backendResume.data as Record<string, unknown>)?.customSections as ResumeData['customSections'] || [],
    sectionOrder: (backendResume.data as Record<string, unknown>)?.sectionOrder as string[] || ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'],
    status: backendResume.status as string || 'Draft',
    views: backendResume.views as number || 0,
    updatedAt: backendResume.updatedAt as string
  };
};

const getAuthHeaders = (userId?: string) => ({
  'Content-Type': 'application/json',
  ...(userId ? { 'x-clerk-user-id': userId } : {}),
});

export const getResumes = async (userId?: string): Promise<ResumeData[]> => {
  try {
    const res = await fetch(`${BASE_URL}/all`, {
      headers: getAuthHeaders(userId),
    });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error(`Failed to fetch resumes: ${res.status} ${res.statusText}`);
    const backendResumes = await res.json();
    return backendResumes.map(transformBackendResponse);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

export const getResumeById = async (id: string, userId?: string): Promise<ResumeData> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(userId),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume);
};

export const createResume = async (data: ResumeData, userId?: string): Promise<ResumeData> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to create resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume);
};

export const updateResume = async (id: string, data: Partial<ResumeData>, userId?: string): Promise<ResumeData> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to update resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume);
};

export const deleteResume = async (id: string, userId?: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to delete resume');
  return res.json();
};

export const fetchLinkedInResume = async (linkedInData: Record<string, unknown>, userId?: string): Promise<ResumeData> => {
  const res = await fetch(`${BASE_URL}/fetch-linkedin`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(linkedInData),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch LinkedIn resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume);
}; 