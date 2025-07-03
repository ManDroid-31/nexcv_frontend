"use client"

import { useSearchParams } from 'next/navigation'
import { ResumeData } from '@/types/resume'
import React, { Suspense } from 'react'

function ExecutiveTemplateInner() {
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
    <div className="min-h-screen bg-white p-12">
      {/* Header */}
      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{resumeData.personalInfo?.name}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {resumeData.personalInfo?.email}
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {resumeData.personalInfo?.phone}
            </div>
          </div>
          <div className="space-y-2">
            {resumeData.personalInfo?.location && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {resumeData.personalInfo.location}
              </div>
            )}
            {resumeData.personalInfo?.website && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={resumeData.personalInfo.website} className="text-blue-600 hover:underline">
                  {resumeData.personalInfo.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-8">
          {/* Summary */}
          {resumeData.summary && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
            </section>
          )}

          {/* Experience */}
          {resumeData.experience?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Professional Experience</h2>
              <div className="space-y-8">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id || index} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{exp.position}</h3>
                        <div className="text-gray-600">{exp.company}</div>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {resumeData.projects?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Projects</h2>
              <div className="space-y-8">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id || index} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
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
                      <p className="text-gray-700 leading-relaxed">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Education */}
          {resumeData.education?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id || index} className="border-l-4 border-gray-200 pl-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <div className="text-gray-600">{edu.school}</div>
                    <div className="text-gray-600 text-sm">
                      {edu.startDate} - {edu.endDate || 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {resumeData.skills?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Core Competencies</h2>
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
      </div>
    </div>
  )
}

export default function ExecutiveTemplate() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExecutiveTemplateInner />
    </Suspense>
  )
} 