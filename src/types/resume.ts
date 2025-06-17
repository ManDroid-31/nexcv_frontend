export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface ArrayObjectItem {
  id: string;
  title: string;
  description: string;
  date: string;
  [key: string]: string; // Allow additional string fields
}

export type CustomSectionValue = 
  | string 
  | string[] 
  | Record<string, string> 
  | KeyValuePair[] 
  | ArrayObjectItem[];

export interface CustomSection {
  id: string;
  name: string;
  type: 'string' | 'array' | 'object' | 'key-value' | 'array-object';
  value: CustomSectionValue;
}

export interface ResumeData {
  title: string;
  slug: string;
  isPublic: boolean;
  template: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  customSections: CustomSection[];
  [key: string]: unknown;
} 