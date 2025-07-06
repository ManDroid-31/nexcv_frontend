import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection } from "@/types/resume";

function renderValue(value: unknown): React.ReactNode {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <p>{value.toString()}</p>;
  }
  if (Array.isArray(value)) {
    // Array of primitives
    if (value.length > 0 && typeof value[0] === 'string') {
      return (
        <div className="space-y-1">
          {value.map((item, idx) => (
            <p key={idx}>{item}</p>
          ))}
        </div>
      );
    }
    // Key-value array
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'key' in value[0] && 'value' in value[0]) {
      return (
        <ul className="space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="flex gap-2"><span className="font-medium">{item.key}:</span> {renderValue(item.value)}</li>
          ))}
        </ul>
      );
    }
    // Array of objects (ArrayObjectItem[])
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'title' in value[0]) {
      return (
        <div className="space-y-3">
          {value.map((item, idx) => (
            <div key={idx} className="mb-3">
              <h4 className="font-medium text-lg">{item.title}</h4>
              {item.description && <p className="text-gray-700 mb-1">{item.description}</p>}
              {item.date && <p className="text-sm text-gray-500">{item.date}</p>}
            </div>
          ))}
        </div>
      );
    }
    // Generic array of objects
    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx}>{renderValue(item)}</div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).filter(([key]) => key !== 'id');
    if (entries.length === 1) {
      // Only one field, just show the value
      return <p>{entries[0][1] as string}</p>;
    }
    if (entries.length === 0) return null;
    return (
      <div className="space-y-1">
        {entries.map(([key, val]) => (
          <p key={key} className="text-gray-700">
          <span className="font-medium">{key}: </span>
          {val as string}
        </p>
        ))}
      </div>
    );
  }
  return null;
}

// ❗ This template renders resume sections cleanly without pagination logic.
// Pagination and page-splitting are handled in ResumePreview.tsx based on word/sentence count.
// Ensure that this renders full sections, not partial content.
export const Onyx = ({ data, sectionsToRender }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => renderValue(section.value);

  const spacing = {
    sectionGap: data.layout?.spacing?.sectionGap ?? 32,
    paragraphGap: data.layout?.spacing?.paragraphGap ?? 16,
    lineHeight: data.layout?.spacing?.lineHeight ?? 1.5
  };

  function renderSectionByKey(key: string) {
    if (key === 'personalInfo') {
      return (
        <header key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h1 className="text-4xl font-bold mb-2">{data.personalInfo.name}</h1>
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
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Summary</h2>
          <p style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="text-xl font-medium">{exp.position}</h3>
              <div className="text-gray-600 text-sm">
                <span>{exp.company}</span>
                {exp.startDate && <span> • {exp.startDate} - {exp.endDate || 'Present'}</span>}
              </div>
              <p style={{ lineHeight: spacing.lineHeight }}>{exp.description}</p>
            </div>
          ))}
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
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                style={{ lineHeight: spacing.lineHeight }}
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="text-xl font-medium">{project.name}</h3>
              <p style={{ lineHeight: spacing.lineHeight }}>{project.description}</p>
              {(project.liveUrl || project.githubUrl) && (
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {project.liveUrl && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
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
                    <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
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
      if (!section) {
        return null;
      }
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">{section.name}</h2>
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
