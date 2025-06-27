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
        <header key={key} className="break-inside-avoid mb-6">
          <h1 className="text-4xl font-bold mb-2">{data.personalInfo.name}</h1>
          <div className="text-gray-600" style={{ lineHeight: spacing.lineHeight }}>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>
      );
    }
    if (key === 'summary' && data.summary) {
      return (
        <section key={key} className="break-inside-avoid mb-6">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Summary</h2>
          <p style={{ lineHeight: spacing.lineHeight }}>{data.summary}</p>
        </section>
      );
    }
    if (key === 'experience' && data.experience?.length) {
      return (
        <section key={key} className="break-inside-avoid mb-6">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
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
        <section key={key} className="break-inside-avoid mb-6">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="text-xl font-medium">{edu.degree}</h3>
              <div className="text-gray-600 text-sm">
                <span>{edu.school}</span>
                {edu.startDate && <span> • {edu.startDate} - {edu.endDate || 'Present'}</span>}
              </div>
            </div>
          ))}
        </section>
      );
    }
    if (key === 'skills' && data.skills?.length) {
      return (
        <section key={key} className="break-inside-avoid mb-6">
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
        <section key={key} className="break-inside-avoid mb-6">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <h3 className="text-xl font-medium">{project.name}</h3>
              <p style={{ lineHeight: spacing.lineHeight }}>{project.description}</p>
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
      if (!section) return null;
      return (
        <section key={key} className="break-inside-avoid mb-6">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-2">{section.name}</h2>
          {renderCustomSectionValue(section)}
        </section>
      );
    }
    return null;
  }

  const sectionsToRenderList = sectionsToRender || data.sectionOrder || [];

  return (
    <div className="space-y-6 text-balance mr-12">
      {sectionsToRenderList.map(renderSectionByKey)}
    </div>
  );
};
