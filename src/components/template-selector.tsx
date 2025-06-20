"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ResumeData } from '@/types/resume';
import { templateMap } from './templates/index';
import React from 'react';
import type { TemplateProps } from '@/types/template';

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  currentTemplate: string
  onSelectTemplate: (template: string) => void
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  layout: "traditional" | "modern" | "creative" | "minimal" | "academic"
  tags: string[]
}

export const templates: Template[] = [
  {
    id: "onyx",
    name: "Onyx",
    category: "Professional",
    description: "Professional template with a clean layout",
    layout: "modern",
    tags: ["Professional", "ATS-Friendly"],
  },
  {
    id: "bronzor",
    name: "Bronzor",
    category: "Professional",
    description: "Professional template with traditional structure",
    layout: "traditional",
    tags: ["Professional", "ATS-Friendly"],
  },
  {
    id: "ditto",
    name: "Ditto",
    category: "Creative",
    description: "Creative template with unique layout",
    layout: "creative",
    tags: ["Creative", "Design"],
  },
  {
    id: "chikorita",
    name: "Chikorita",
    category: "Academic",
    description: "Academic template with research focus",
    layout: "academic",
    tags: ["Academic", "Research"],
  },
  {
    id: "leafish",
    name: "Leafish",
    category: "Minimal",
    description: "Clean template with minimal design",
    layout: "minimal",
    tags: ["Minimal", "Clean"],
  },
  {
    id: "azurill",
    name: "Azurill",
    category: "Creative",
    description: "Creative template with unique style",
    layout: "creative",
    tags: ["Creative", "Design"],
  },
  {
    id: "gengar",
    name: "Gengar",
    category: "Professional",
    description: "Dark theme template",
    layout: "modern",
    tags: ["Dark", "Professional"],
  },
  {
    id: "pikachu",
    name: "Pikachu",
    category: "Creative",
    description: "Creative template with bold design",
    layout: "creative",
    tags: ["Creative", "Bold"],
  },
  {
    id: "kakuna",
    name: "Kakuna",
    category: "Minimal",
    description: "Simple template with clean layout",
    layout: "minimal",
    tags: ["Minimal", "Simple"],
  }
]

const SAMPLE_RESUME: ResumeData = {
  title: 'Sample Resume',
  slug: 'sample-resume',
  isPublic: true,
  template: 'onyx',
  tags: [],
  layout: {
    margins: { top: 24, bottom: 24, left: 24, right: 24 },
    spacing: { sectionGap: 20, paragraphGap: 10, lineHeight: 1.4 },
    scale: 0.7,
  },
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
  },
  summary: 'A quick summary for preview.',
  experience: [{
    id: '1',
    company: 'Preview Corp',
    position: 'Developer',
    startDate: '2022-01',
    endDate: '2022-12',
    description: 'Worked on preview features.',
  }],
  education: [{
    id: '1',
    school: 'Preview University',
    degree: 'BSc Computer Science',
    startDate: '2018-09',
    endDate: '2022-05',
  }],
  projects: [{
    id: '1',
    name: 'Preview Project',
    description: 'A sample project.',
    technologies: ['React', 'TypeScript'],
    startDate: '2022-01',
    endDate: '2022-06',
  }],
  skills: ['React', 'TypeScript', 'UI'],
  customSections: [],
  sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'],
};

const TEMPLATE_STYLE_NOTES: Record<string, string> = {
  onyx: 'Modern, single-column, clean',
  pikachu: 'Bright, rounded, single-column',
  gengar: 'Dark, bold, single-column',
  kakuna: 'Minimal, single-column',
  azurill: 'Soft, single-column',
  chikorita: 'Academic, single-column',
  leafish: 'Minimal, two-column',
  ditto: 'Creative, two-column',
  bronzor: 'Classic, single-column',
  rhyhorn: 'Simple, single-column',
  nosepass: 'Professional, single-column',
  glalie: 'Modern, single-column',
};

export function TemplateSelector({ isOpen, onClose, currentTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="w-[80vw] h-[90vh] max-w-none p-6 flex flex-col">
  <DialogHeader>
    <DialogTitle className="text-xl">Choose a Template</DialogTitle>
    <DialogDescription className="text-sm text-muted-foreground">
      Select a resume template to preview and apply.
    </DialogDescription>
  </DialogHeader>

  <ScrollArea className="flex-1 overflow-auto mt-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      {Object.entries(templateMap).map(([key, TemplateComponent]) => (
        <button
          key={key}
          className={`border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all flex flex-col items-center ${
            currentTemplate === key ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSelectTemplate(key)}
          type="button"
        >
          <div className="w-full h-56 overflow-hidden flex items-center justify-center bg-gray-100 rounded mb-3">
            <div style={{ width: 280, height: 220, transform: 'scale(0.7)', pointerEvents: 'none' }}>
              {React.createElement(TemplateComponent as React.ComponentType<TemplateProps>, {
                data: { ...SAMPLE_RESUME, template: key },
              })}
            </div>
          </div>
          <div className="font-semibold text-base mb-1 capitalize">{key}</div>
          <div className="text-xs text-gray-500 text-center px-2">{TEMPLATE_STYLE_NOTES[key] || ''}</div>
        </button>
      ))}
      {/* More coming soon card */}
      <div className="border rounded-xl p-4 bg-gray-50 shadow-none flex flex-col items-center opacity-60 cursor-not-allowed select-none">
        <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded mb-3">
          <span className="text-4xl text-gray-300">...</span>
        </div>
        <div className="font-semibold text-base mb-1">More coming soon...</div>
        <div className="text-xs text-gray-400 text-center px-2">New templates are on the way!</div>
      </div>
    </div>
  </ScrollArea>

  <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
    <Button variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button onClick={onClose} className="px-6">
      Apply Template
    </Button>
  </div>
</DialogContent>

    </Dialog>
  )
} 