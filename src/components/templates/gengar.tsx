import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection } from "@/types/resume";

function renderValue(value: unknown): React.ReactNode {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (Array.isArray(value)) {
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
    // Array of primitives or objects
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

export const Gengar = ({ data, sectionsToRender }: TemplateProps) => {
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
          <h1 className="text-5xl font-bold mb-3 text-white">{data.personalInfo.name}</h1>
          <div className="text-gray-300 space-y-1" style={{ lineHeight: spacing.lineHeight }}>
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
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">Summary</h2>
          <p className="text-gray-300 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-purple-500 pl-4 bg-gray-800 p-4 rounded-r-lg" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-white">{exp.position}</h3>
                <div className="text-purple-300 mb-2">
                  <span className="font-semibold">{exp.company}</span>
                  {exp.startDate && (
                    <span className="ml-2">• {exp.startDate} - {exp.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'education' && data.education?.length) {
      return (
        <section key={key} className="mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-purple-500 pl-4 bg-gray-800 p-4 rounded-r-lg" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                <div className="text-purple-300">
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
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
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
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">Projects</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id} className="border-l-4 border-purple-500 pl-4 bg-gray-800 p-4 rounded-r-lg" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                {(project.liveUrl || project.githubUrl) && (
                  <div className="text-sm text-purple-300 mb-2">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 underline mr-4">
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 underline">
                        GitHub
                      </a>
                    )}
                  </div>
                )}
                <p className="text-gray-300 mb-3 leading-relaxed" style={{ lineHeight: spacing.lineHeight }}>{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm font-medium"
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
          <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b-2 border-purple-600 pb-2">{section.name}</h2>
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
