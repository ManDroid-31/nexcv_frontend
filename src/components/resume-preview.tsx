"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { templates, Template } from "./template-selector"

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: string[];
}

interface ResumePreviewProps {
  data: ResumeData
  template: string
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templateInfo, setTemplateInfo] = useState<Template | null>(null)

  useEffect(() => {
    const info = templates.find(t => t.id === template)
    setTemplateInfo(info || null)
  }, [template])

  const encodedData = encodeURIComponent(JSON.stringify(data))
  const previewUrl = `/templates/${template}?data=${encodedData}`

  return (
    <div className="h-full flex flex-col">
      {/* Template Info Header */}
      {templateInfo && (
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{templateInfo.name}</h3>
              <p className="text-sm text-gray-500">{templateInfo.description}</p>
            </div>
            <div className="flex gap-2">
              {templateInfo.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Frame */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="space-y-4 w-full max-w-md p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">Error loading preview</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError("Failed to load preview")
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-2 text-sm text-gray-500 flex items-center justify-between">
        <div>
          {templateInfo?.category && (
            <span className="mr-4">Category: {templateInfo.category}</span>
          )}
        </div>
        <div>Last updated: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  )
} 