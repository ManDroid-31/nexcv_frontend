// backend api call too return crud operations result 

import { ResumeData, ArrayObjectItem } from '@/types/resume';

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

// Specialized transformation for LinkedIn data
const transformLinkedInData = (linkedInData: Record<string, unknown>): ResumeData => {
  // Extract the actual resume data from the LinkedIn response
  const resumeData = linkedInData.data as Record<string, unknown> || linkedInData;
  
  // Transform layout spacing if it's a number
  let layout = resumeData.layout as ResumeData['layout'] || {
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    spacing: { sectionGap: 24, paragraphGap: 12, lineHeight: 1.5 },
    scale: 1
  };
  
  if (typeof layout.spacing === 'number') {
    layout = {
      ...layout,
      spacing: { sectionGap: 24, paragraphGap: 12, lineHeight: layout.spacing }
    };
  }

  // Transform education entries
  const education = ((resumeData.education as Record<string, unknown>[]) || []).map((edu, index) => ({
    id: edu.id as string || `edu-${index + 1}`,
    school: (edu.school as string) || (edu.institution as string) || '',
    degree: edu.degree as string || '',
    startDate: edu.startDate as string || '',
    endDate: edu.endDate as string || '',
    gpa: edu.gpa as string || '',
    tags: edu.tags as string[] || []
  }));

  // Transform experience entries
  const experience = ((resumeData.experience as Record<string, unknown>[]) || []).map((exp, index) => ({
    id: exp.id as string || `exp-${index + 1}`,
    company: exp.company as string || '',
    position: exp.position as string || '',
    startDate: exp.startDate as string || '',
    endDate: exp.endDate as string || '',
    description: (exp.description as string) || ((exp.achievements as string[])?.join('\n')) || '',
    tags: exp.tags as string[] || []
  }));

  // Transform projects entries
  const projects = ((resumeData.projects as Record<string, unknown>[]) || []).map((proj, index) => ({
    id: proj.id as string || `proj-${index + 1}`,
    name: proj.name as string || '',
    description: proj.description as string || '',
    technologies: proj.technologies as string[] || [],
    liveUrl: (proj.liveUrl as string) || (proj.url as string) || '',
    githubUrl: proj.githubUrl as string || '',
    startDate: proj.startDate as string || '',
    endDate: proj.endDate as string || '',
    tags: proj.tags as string[] || []
  }));

  // Transform custom sections
  const customSections = ((resumeData.customSections as Record<string, unknown>[]) || []).map((section, index) => {
    // Handle different custom section structures
    const transformedSection = {
      id: section.id as string || `custom-${index + 1}`,
      name: (section.title as string) || (section.name as string) || '',
      type: 'array-object' as const,
      value: [] as ArrayObjectItem[]
    };

    // Handle certifications
    if (section.title === 'Certifications' && (section.content as Record<string, unknown>)?.items) {
      transformedSection.value = ((section.content as Record<string, unknown>).items as Record<string, unknown>[]).map((item) => ({
        id: `cert-${Math.random().toString(36).substr(2, 9)}`,
        title: (item.name as string) || '',
        description: '',
        date: item.date as string || ''
      }));
    }
    // Handle volunteer work
    else if (section.title === 'Volunteer Work' && (section.content as Record<string, unknown>)?.items) {
      transformedSection.value = ((section.content as Record<string, unknown>).items as Record<string, unknown>[]).map((item) => ({
        id: `vol-${Math.random().toString(36).substr(2, 9)}`,
        title: item.title as string || '',
        description: item.description as string || '',
        date: (item.starts_at as Record<string, unknown>) ? `${(item.starts_at as Record<string, unknown>).year}-${(item.starts_at as Record<string, unknown>).month}-${(item.starts_at as Record<string, unknown>).day}` : ''
      }));
    }
    // Handle other custom sections
    else if ((section.content as Record<string, unknown>)?.items) {
      transformedSection.value = ((section.content as Record<string, unknown>).items as Record<string, unknown>[]).map((item) => ({
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        title: (item.name as string) || (item.title as string) || '',
        description: (item.description as string) || (item.summary as string) || '',
        date: item.date as string || ''
      }));
    }

    return transformedSection;
  });

  return {
    id: linkedInData.id as string,
    title: linkedInData.title as string || 'Imported Resume',
    slug: linkedInData.slug as string || 'imported-resume',
    isPublic: linkedInData.isPublic as boolean || false,
    template: linkedInData.template as string || 'pikachu',
    tags: (linkedInData.tags as string[]) || [],
    layout,
    personalInfo: {
      name: ((resumeData.personalInfo as Record<string, unknown>)?.name as string) || '',
      email: ((resumeData.personalInfo as Record<string, unknown>)?.email as string) || '',
      phone: ((resumeData.personalInfo as Record<string, unknown>)?.phone as string) || '',
      location: ((resumeData.personalInfo as Record<string, unknown>)?.location as string) || '',
      website: ((resumeData.personalInfo as Record<string, unknown>)?.website as string) || '',
      linkedin: ((resumeData.personalInfo as Record<string, unknown>)?.linkedin as string) || '',
      github: ((resumeData.personalInfo as Record<string, unknown>)?.github as string) || ''
    },
    summary: resumeData.summary as string || '',
    experience,
    education,
    projects,
    skills: (resumeData.skills as string[]) || [],
    customSections,
    sectionOrder: (resumeData.sectionOrder as string[]) || ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'customSections'],
    status: linkedInData.status as string || 'Draft',
    views: linkedInData.views as number || 0,
    updatedAt: linkedInData.updatedAt as string
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

export const getResumeById = async (
  id: string,
  userId?: string,
  view: 'ownerview' | 'publicview' | 'guestview' = 'ownerview'
): Promise<ResumeData> => {
  const res = await fetch(`${BASE_URL}/${id}?view=${view}`, {
    headers: getAuthHeaders(userId),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch resume');
  const backendResume = await res.json();
  return transformBackendResponse(backendResume);
};

export const createResume = async (data: Partial<ResumeData>, userId?: string): Promise<ResumeData> => {
  // Merge provided data with defaults
  const merged = { ...defaultResumeData, ...data };

  // Extract top-level fields
  const { title, template, isPublic, visibility, ...rest } = merged;

  // Remove undefined/null from rest
  const cleanData: Record<string, unknown> = {};
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null) cleanData[k] = v;
  });

  // Build payload
  const payload = {
    title: title ?? "Untitled Resume",
    template: template ?? "onyx",
    visibility: typeof visibility === "string" ? visibility : (isPublic ? "public" : "private"),
    data: cleanData,
  };

  // Log payload for debugging
  // if (typeof window !== "undefined") {
  //   // Client-side
  //   console.log("[createResume] Payload to backend:", payload);
  // } else {
  //   // Server-side
  //   console.log("[createResume] Payload to backend:", JSON.stringify(payload, null, 2));
  // }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create resume: ${errorText}`);
  }
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
  return transformLinkedInData(backendResume.resume || backendResume);
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