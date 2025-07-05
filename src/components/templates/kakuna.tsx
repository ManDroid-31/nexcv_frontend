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

export const Kakuna = ({ data, sectionsToRender }: TemplateProps) => {
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{data.personalInfo.name}</h1>
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-700 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} style={{ pageBreakInside: 'avoid' }}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Skills</h2>
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id} style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
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
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">{section.name}</h2>
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
