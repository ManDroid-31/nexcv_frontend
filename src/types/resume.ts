export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  tags?: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  tags?: string[];
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
  tags?: string[];
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

// Define layout types
export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Spacing {
  sectionGap: number;
  paragraphGap: number;
  lineHeight: number;
}

export interface Layout {
  margins: Margins;
  spacing: Spacing;
  scale: number;
}

export interface ResumeData {
  title: string;
  slug: string;
  isPublic: boolean;
  template: string;
  tags: string[];
  layout: Layout;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  customSections: CustomSection[];
  sectionOrder: string[];
} 