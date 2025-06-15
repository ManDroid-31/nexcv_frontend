"use client"

import { useSearchParams } from 'next/navigation'

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
}

export default function TemplatePage() {
  const searchParams = useSearchParams()
  const data = searchParams.get('data')
  
  if (!data) {
    return <div>No data provided</div>
  }

  try {
    const resumeData = JSON.parse(decodeURIComponent(data)) as ResumeData
    
    return (
      <div className="p-8 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo?.name}</h1>
          <div className="text-gray-600">
            {resumeData.personalInfo?.email} • {resumeData.personalInfo?.phone} • {resumeData.personalInfo?.location}
            {resumeData.personalInfo?.website && (
              <> • <a href={resumeData.personalInfo.website} className="text-blue-600 hover:underline">{resumeData.personalInfo.website}</a></>
            )}
          </div>
        </div>

        {/* Summary */}
        {resumeData.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
            <p className="text-gray-700">{resumeData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Education</h2>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.school}</p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
            {resumeData.projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {project.url ? (
                        <a href={project.url} className="text-blue-600 hover:underline">{project.name}</a>
                      ) : (
                        project.name
                      )}
                    </h3>
                    {project.startDate && project.endDate && (
                      <div className="text-gray-600 text-sm">
                        {project.startDate} - {project.endDate}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{project.description}</p>
                {project.technologies?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resumeData.skills?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <span key={skill} className="bg-gray-100 px-3 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error parsing resume data:', error)
    return <div>Error parsing resume data</div>
  }
} 