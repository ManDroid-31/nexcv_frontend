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
        <header key={key} className="break-inside-avoid">
          <h1 className="text-5xl font-bold" style={{ marginBottom: `${spacing.paragraphGap}px` }}>{data.personalInfo.name}</h1>
          <div className="text-lg opacity-90" style={{ lineHeight: spacing.lineHeight }}>
            <p style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{data.personalInfo.email}</p>
            <p style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
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
        <section key={key} className="break-inside-avoid">
          <h2
            className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2"
            style={{ marginBottom: `${spacing.paragraphGap}px` }}
          >
            Education
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.paragraphGap}px` }}>
            {data.education.map((edu) => (
              <div
                key={edu.id}
                style={{
                  borderLeft: '4px solid #fb923c',
                  background: 'linear-gradient(to right, #ffedd5, transparent)',
                  padding: '16px',
                  borderRadius: '1rem',
                  marginBottom: `${spacing.paragraphGap/2}px`
                }}
              >
                <h3 className="text-xl font-bold text-gray-900" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{edu.degree}</h3>
                <div className="text-orange-600" style={{ lineHeight: spacing.lineHeight }}>
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
        <section key={key} className="break-inside-avoid">
          <h2
            className="text-2xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2"
            style={{ marginBottom: `${spacing.paragraphGap}px` }}
          >
            Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.paragraphGap}px` }}>
            {data.projects.map((project) => (
              <div
                key={project.id}
                style={{
                  borderLeft: '4px solid #fb923c',
                  background: 'linear-gradient(to right, #ffedd5, transparent)',
                  padding: '16px',
                  borderRadius: '1rem',
                  marginBottom: `${spacing.paragraphGap/2}px`
                }}
              >
                <h3 className="text-xl font-bold text-gray-900" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{project.name}</h3>
                {(project.liveUrl || project.githubUrl) && (
                  <div className="text-sm text-orange-600" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 underline mr-4">
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 underline">
                        GitHub
                      </a>
                    )}
                  </div>
                )}
                <p className="text-gray-700" style={{ lineHeight: spacing.lineHeight, marginBottom: `${spacing.paragraphGap/2}px` }}>{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-3 py-1 rounded-full text-sm font-medium"
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
