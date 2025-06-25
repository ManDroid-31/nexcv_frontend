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
    // If the object only has 'id', do not render anything
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

export const Onyx = ({ data, sectionsToRender }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => renderValue(section.value);

  const spacing = {
    sectionGap: data.layout?.spacing?.sectionGap ?? 32,
    paragraphGap: data.layout?.spacing?.paragraphGap ?? 16,
    lineHeight: data.layout?.spacing?.lineHeight ?? 1.5
  };

  // Helper to render a section by key
  function renderSectionByKey(key: string) {
    if (key === 'personalInfo') {
      return (
        <header style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h1 className="text-4xl font-bold" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            {data.personalInfo.name}
          </h1>
          <div className="text-gray-600" style={{ lineHeight: spacing.lineHeight }}>
            <p style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{data.personalInfo.email}</p>
            <p style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>
      );
    }
    if (key === 'summary' && data.summary) {
      return (
        <section style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            Professional Summary
          </h2>
          <p className="text-gray-700" style={{ lineHeight: spacing.lineHeight, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience && data.experience.length > 0) {
      return (
        <section style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: `${spacing.paragraphGap}px` }}>
                <h3 className="text-xl font-medium" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                  {exp.position}
                </h3>
                <div className="text-gray-600" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                  <span className="font-medium">{exp.company}</span>
                  {exp.startDate && (
                    <span> • {exp.startDate} - {exp.endDate || 'Present'}</span>
                  )}
                </div>
                <p className="text-gray-700" style={{ lineHeight: spacing.lineHeight, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'education' && data.education && data.education.length > 0) {
      return (
        <section style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: `${spacing.paragraphGap}px` }}>
                <h3 className="text-xl font-medium" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                  {edu.degree}
                </h3>
                <div className="text-gray-600" style={{ lineHeight: spacing.lineHeight }}>
                  <span className="font-medium">{edu.school}</span>
                  {edu.startDate && (
                    <span> • {edu.startDate} - {edu.endDate || 'Present'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'skills' && data.skills && data.skills.length > 0) {
      return (
        <section style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            Skills
          </h2>
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
    if (key === 'projects' && data.projects && data.projects.length > 0) {
      return (
        <section style={{ marginBottom: `${spacing.sectionGap}px` }} key={key}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            Projects
          </h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id} style={{ marginBottom: `${spacing.paragraphGap}px` }}>
                <h3 className="text-xl font-medium" style={{ marginBottom: `${spacing.paragraphGap/2}px` }}>
                  {project.name}
                </h3>
                <p className="text-gray-700" style={{ marginBottom: `${spacing.paragraphGap/2}px`, lineHeight: spacing.lineHeight, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  {project.description}
                </p>
                {project.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        style={{ lineHeight: spacing.lineHeight }}
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
    // Custom section
    if (key.startsWith('custom:')) {
      const customId = key.replace('custom:', '');
      const customSection = data.customSections?.find(s => s.id === customId);
      if (!customSection) return null;
      return (
        <section key={key} style={{ marginBottom: `${spacing.sectionGap}px` }}>
          <h2 className="text-2xl font-semibold border-b pb-2" style={{ marginBottom: `${spacing.paragraphGap}px` }}>
            {customSection.name}
          </h2>
          <div style={{ lineHeight: spacing.lineHeight, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {renderCustomSectionValue(customSection)}
          </div>
        </section>
      );
    }
    return null;
  }

  // Determine which sections to render
  const sectionsToRenderList = sectionsToRender || data.sectionOrder || [];

  return (
    <div className="w-full">
      {/* Render sections based on sectionsToRender or fallback to sectionOrder */}
      {sectionsToRenderList.map(renderSectionByKey)}
    </div>
  );
};
