import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection, ArrayObjectItem } from "@/types/resume";

// ❗ This template renders resume sections cleanly without pagination logic.
// Pagination and page-splitting are handled in ResumePreview.tsx based on word/sentence count.
// Ensure that this renders full sections, not partial content.

export const Leafish = ({ data, sectionsToRender }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => {
    if (Array.isArray(section.value)) {
      // Array of primitives
      if (section.value.length > 0 && typeof section.value[0] === 'string') {
        return (
          <div className="space-y-1">
            {(section.value as string[]).map((item, idx) => (
              <p key={idx} className="text-gray-700">{item}</p>
            ))}
          </div>
        );
      }
      // Array of objects (ArrayObjectItem[])
      if (section.value.length > 0 && typeof section.value[0] === 'object' && section.value[0] !== null && 'title' in section.value[0]) {
        return (
          <div className="space-y-3">
            {section.value.map((item, idx) => {
              const objItem = item as ArrayObjectItem;
              return (
                <div key={idx} className="mb-3">
                  <h4 className="font-medium text-lg">{objItem.title}</h4>
                  {objItem.description && <p className="text-gray-700 mb-1">{objItem.description}</p>}
                  {objItem.date && <p className="text-sm text-gray-500">{objItem.date}</p>}
                </div>
              );
            })}
          </div>
        );
      }
      // Generic array of objects
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
        <header key={key} className="break-inside-avoid">
          <h1 className="text-4xl font-light mb-2 text-gray-900">{data.personalInfo.name}</h1>
          <div className="text-gray-600 space-y-1 text-sm" style={{ lineHeight: spacing.lineHeight }}>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>
      );
    }
    if (key === 'summary' && data.summary) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-3 text-gray-900 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-700 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
                  {exp.startDate && (
                    <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{exp.company}</p>
                <p className="text-gray-700 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'education' && data.education?.length) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                  {edu.startDate && (
                    <span className="text-sm text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-600">{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'skills' && data.skills?.length) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'projects' && data.projects?.length) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Projects</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                </div>
                {(project.liveUrl || project.githubUrl) && (
                  <div className="text-sm text-gray-600 mb-2">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 underline mr-4">
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 underline">
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
                        className="text-gray-600 border border-gray-300 px-2 py-0.5 rounded text-sm"
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
        <section key={key} className="break-inside-avoid">
          <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">{section.name}</h2>
          {renderCustomSectionValue(section)}
        </section>
      );
    }
    return null;
  }

  const sectionsToRenderList = sectionsToRender || data.sectionOrder || [];

  return (
    <div className="space-y-6 break-words mr-10">
      {sectionsToRenderList.map(renderSectionByKey)}
    </div>
  );
};
