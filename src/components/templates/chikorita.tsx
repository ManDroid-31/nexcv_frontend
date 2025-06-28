import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection } from "@/types/resume";

// ❗ This template renders resume sections cleanly without pagination logic.
// Pagination and page-splitting are handled in ResumePreview.tsx based on word/sentence count.
// Ensure that this renders full sections, not partial content.

export const Chikorita = ({ data, sectionsToRender }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => {
    if (Array.isArray(section.value)) {
      return (
        <div className="space-y-2">
          {section.value.map((item, index) => (
            <div key={index}>
              {typeof item === 'string' ? (
                <p className="text-gray-700">{item}</p>
              ) : (
                <div className="mb-4">
                  {Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => (
                    <p key={key} className="text-gray-700">
                      <span className="font-medium">{key}: </span>
                      {value as string}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    if (typeof section.value === 'object' && section.value !== null) {
      return (
        <div className="mb-4">
          {Object.entries(section.value).filter(([key]) => key !== 'id').map(([key, value]) => (
            <p key={key} className="text-gray-700">
              <span className="font-medium">{key}: </span>
              {value as string}
            </p>
          ))}
        </div>
      );
    }
    return <p className="text-gray-700">{section.value as string}</p>;
  };

  const spacing = {
    sectionGap: data.layout?.spacing?.sectionGap ?? 32,
    paragraphGap: data.layout?.spacing?.paragraphGap ?? 16,
    lineHeight: data.layout?.spacing?.lineHeight ?? 1.5
  };

  function renderSectionByKey(key: string) {
    if (key === 'personalInfo') {
      return (
        <header key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">{data.personalInfo.name}</h1>
          <div className="text-gray-600 space-y-1" style={{ lineHeight: spacing.lineHeight }}>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>
      );
    }
    if (key === 'summary' && data.summary) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Summary</h2>
          <p className="text-gray-700 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-green-400 pl-4" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                <div className="text-green-600 mb-2">
                  <span className="font-semibold">{exp.company}</span>
                  {exp.startDate && (
                    <span className="ml-2">• {exp.startDate} - {exp.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'education' && data.education?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-green-400 pl-4" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                <div className="text-green-600">
                  <span className="font-semibold">{edu.school}</span>
                  {edu.startDate && (
                    <span className="ml-2">• {edu.startDate} - {edu.endDate || 'Present'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'skills' && data.skills?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Skills</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'projects' && data.projects?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Projects</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id} className="border-l-4 border-green-400 pl-4" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                {(project.liveUrl || project.githubUrl) && (
                  <div className="text-sm text-green-600 mb-2">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 underline mr-4">
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 underline">
                        GitHub
                      </a>
                    )}
                  </div>
                )}
                <p className="text-gray-700 mb-3 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key.startsWith('custom:')) {
      const id = key.replace('custom:', '');
      const section = data.customSections?.find(cs => cs.id === id);
      if (!section) return null;
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b-2 border-green-200 pb-2">{section.name}</h2>
          {renderCustomSectionValue(section)}
        </section>
      );
    }
    return null;
  }

  const sectionsToRenderList = sectionsToRender || data.sectionOrder || [];

  return (
    <div className="space-y-6 text-balance mr-12" style={{ 
      pageBreakInside: 'auto',
      orphans: 2,
      widows: 2
    }}>
      {sectionsToRenderList.map(renderSectionByKey)}
    </div>
  );
};
