"use client"

import { useSearchParams } from 'next/navigation'
import { ResumeData } from '@/types/resume'
import React, { Suspense } from 'react'

function ModernTemplateInner() {
  const searchParams = useSearchParams()
  const data = (searchParams as URLSearchParams).get('data')
  
  if (!data) {
    return <div>No resume data provided</div>
  }

  let resumeData: ResumeData
  try {
    resumeData = JSON.parse(decodeURIComponent(data))
  } catch {
    return <div>Invalid resume data</div>
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{resumeData.personalInfo?.name}</h1>
        <div className="mt-2 text-gray-600">
          {resumeData.personalInfo?.email} • {resumeData.personalInfo?.phone}
          {resumeData.personalInfo?.location && ` • ${resumeData.personalInfo.location}`}
        </div>
        {resumeData.personalInfo?.website && (
          <div className="mt-1">
            <a href={resumeData.personalInfo.website} className="text-blue-600 hover:underline">
              {resumeData.personalInfo.website}
            </a>
          </div>
        )}
      </header>

      {/* Summary */}
      {resumeData.summary && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 border-b pb-2">Professional Summary</h2>
          <p className="text-gray-700">{resumeData.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 border-b pb-2">Experience</h2>
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id || index} className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <div className="text-gray-600">{exp.company}</div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.description && (
                  <p className="mt-2 text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resumeData.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 border-b pb-2">Education</h2>
          <div className="space-y-4">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id || index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <div className="text-gray-600">{edu.school}</div>
                </div>
                <div className="text-gray-600 text-sm">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resumeData.projects?.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 border-b pb-2">Projects</h2>
          <div className="space-y-6">
            {resumeData.projects.map((project, index) => (
              <div key={project.id || index} className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {project.technologies?.length > 0 && (
                      <div className="text-gray-600 text-sm">
                        {project.technologies.join(' • ')}
                      </div>
                    )}
                  </div>
                  {(project.githubUrl || project.liveUrl) && (
                    <a href={project.githubUrl || project.liveUrl} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
                      View Project
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="mt-2 text-gray-700">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resumeData.skills?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900 border-b pb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function ModernTemplate() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModernTemplateInner />
    </Suspense>
  )
} 