import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection } from "@/types/resume";

function renderValue(value: unknown): React.ReactNode {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    // Array of primitives
    if (value.length > 0 && typeof value[0] === 'string') {
      return (
        <ul className="space-y-1">
          {value.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
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
      <ul className="space-y-1">
        {value.map((item, idx) => (
          <li key={idx}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object' && value !== null) {
    // Defensive: If the object only has 'id' or is empty, do not render anything
    const entries = Object.entries(value).filter(([key]) => key !== 'id');
    if (entries.length === 0) return null;
    return (
      <div className="space-y-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium">{key}:</span>
            <span>{renderValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export const Pikachu = ({ data, sectionsToRender }: TemplateProps) => {
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
          <h1 className="text-4xl font-bold mb-2 text-blue-600">{data.personalInfo.name}</h1>
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
        <section key={key} className="break-inside-avoid">
          <h2 className="text-xl font-bold mb-2 text-yellow-700 border-b-2 border-yellow-300 pb-1">Summary</h2>
          <p className="text-gray-700" style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="break-inside-avoid">
          <h2
            className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2"
            style={{ marginBottom: `${spacing.paragraphGap}px` }}
          >
            Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.paragraphGap}px` }}>
            {data.experience.map((exp) => (
              <div
                key={exp.id}
                style={{
                  borderLeft: '4px solid #fb923c',
                  background: 'linear-gradient(to right, #ffedd5, transparent)',
                  padding: '16px',
                  borderRadius: '1rem',
                  marginBottom: `${spacing.paragraphGap/2}px`
                }}
              >
                <h3 className="text-xl font-bold text-gray-900" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{exp.position}</h3>
                <div className="text-orange-600" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                  <span className="font-semibold">{exp.company}</span>
                  {exp.startDate && (
                    <span className="ml-2">• {exp.startDate} - {exp.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-700" style={{ lineHeight: spacing.lineHeight }}>{exp.description}</p>
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
            {data.education.map((edu, index) => {
              const school = edu.school || '';
              const specialization = edu.degree || '';
              const formatDate = (date: string) => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return date;
                return d.toLocaleString('default', { month: 'short', year: 'numeric' });
              };
              return (
                <li key={index}>
                  <div className="font-semibold">{school}</div>
                  <div className="text-sm text-gray-700">{specialization}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(edu.startDate)}{edu.startDate && edu.endDate ? ' – ' : ''}{formatDate(edu.endDate)}
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
        <section key={key} className="break-inside-avoid">
          <h2
            className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2"
            style={{ marginBottom: `${spacing.paragraphGap}px` }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
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
          <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2 mb-2 text-blue-600">Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="text-xl font-medium text-blue-600">{project.name}</h3>
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
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
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
        <section key={key} className="break-inside-avoid">
          <h2
            className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2"
            style={{ marginBottom: `${spacing.paragraphGap}px` }}
          >
            {section.name}
          </h2>
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
