import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection, ArrayObjectItem } from "@/types/resume";

// ❗ This template renders resume sections cleanly without pagination logic.
// Pagination and page-splitting are handled in ResumePreview.tsx based on word/sentence count.
// Ensure that this renders full sections, not partial content.

export const Chikorita = ({ data, sectionsToRender }: TemplateProps) => {
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
        <header key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h1 className="text-4xl font-bold mb-2 text-green-600">{data.personalInfo.name}</h1>
          <div className="text-gray-600" style={{ lineHeight: spacing.lineHeight }}>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
            {data.personalInfo.website && (
              <p>{data.personalInfo.website}</p>
            )}
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
        <section key={key} className="mb-6">
          <h2 className="text-xl font-bold mb-2">Education</h2>
          <ul className="space-y-2">
            {data.education.map((edu, idx) => {
              const school = edu.school || edu.institution || edu.college || edu.university || edu.organization || '';
              const specialization = edu.degree || edu.field || edu.major || edu.program || '';
              const formatDate = (date: string) => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return date;
                return d.toLocaleString('default', { month: 'short', year: 'numeric' });
              };
              return (
                <li key={edu.id}>
                  <div className="font-semibold">{school}</div>
                  <div className="text-sm text-gray-700">{specialization}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(edu.startDate || edu.start_date)}{(edu.startDate || edu.start_date) && (edu.endDate || edu.end_date) ? ' – ' : ''}{formatDate(edu.endDate || edu.end_date)}
                  </div>
                </li>
              );
            })}
          </ul>
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
          <h2 className="text-2xl font-semibold border-b-2 border-green-600 pb-2 mb-2 text-green-600">Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="text-xl font-medium text-green-600">{project.name}</h3>
              <p style={{ lineHeight: spacing.lineHeight }}>{project.description}</p>
              {(project.liveUrl || project.githubUrl) && (
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {project.liveUrl && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      <span className="font-medium">Live:</span> {project.liveUrl}
                    </span>
                  )}
                  {project.githubUrl && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      <span className="font-medium">GitHub:</span> {project.githubUrl}
                    </span>
                  )}
                </div>
              )}
              {project.technologies && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
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
