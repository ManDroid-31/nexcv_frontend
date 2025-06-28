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
  const res = await fetch('/api/resumes/fetch-linkedin', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(linkedInData),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not enough credits');
  if (res.status === 400) throw new Error('Invalid LinkedIn URL');
  if (res.status === 502) throw new Error('Failed to fetch from LinkedIn');
  if (!res.ok) throw new Error('Failed to fetch LinkedIn resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume.resume || backendResume);
};

export const defaultResumeData = {
  title: 'John Doe Resume',
  slug: 'john-doe-resume',
  isPublic: false,
  template: 'onyx',
  tags: ['developer', 'engineer'],
  layout: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
  },
  summary: 'Experienced software engineer with a passion for building scalable web applications and working across the full stack.',
  experience: [
    {
      id: 'exp1',
      company: 'Acme Corp',
      position: 'Senior Software Engineer',
      startDate: '2021-01',
      endDate: '2023-06',
      description: 'Led a team of 5 engineers to build a modern SaaS platform using React, Node.js, and AWS.'
    },
    {
      id: 'exp2',
      company: 'BetaTech',
      position: 'Frontend Developer',
      startDate: '2018-06',
      endDate: '2020-12',
      description: 'Developed and maintained UI components for a large e-commerce site.'
    }
  ],
  education: [
    {
      id: 'edu1',
      school: 'State University',
      degree: 'B.Sc. in Computer Science',
      startDate: '2014-08',
      endDate: '2018-05',
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Open Source Dashboard',
      description: 'A customizable dashboard for monitoring web services.',
      technologies: ['React', 'TypeScript', 'Docker'],
      githubUrl: 'https://github.com/johndoe/dashboard',
      liveUrl: 'https://dashboard.johndoe.dev',
      startDate: '2022-01',
      endDate: '2022-06',
      tags: ['open-source']
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
  customSections: [],
  sectionOrder: [
    'personalInfo',
    'summary',
    'experience',
    'education',
    'projects',
    'skills'
  ]
}; 