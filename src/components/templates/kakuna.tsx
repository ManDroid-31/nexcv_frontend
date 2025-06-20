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

export const Kakuna = ({ data }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => renderValue(section.value);

  // Standard outer margin (not user-editable)
  const margins = {
    top: data.layout?.margins?.top ?? 40,
    bottom: data.layout?.margins?.bottom ?? 40,
    left: data.layout?.margins?.left ?? 40,
    right: data.layout?.margins?.right ?? 40
  };
  // User-controlled internal spacing
  const spacing = {
    sectionGap: data.layout?.spacing?.sectionGap ?? 32,
    paragraphGap: data.layout?.spacing?.paragraphGap ?? 16,
    lineHeight: data.layout?.spacing?.lineHeight ?? 1.5
  };
  const scale = data.layout?.scale ?? 1;

  return (
    <div
      style={{
        margin: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        className="max-w-[850px] w-full bg-white shadow-lg"
        style={{
          padding: '40px', // standard internal padding for resume content
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Header with Simple Style */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{data.personalInfo.name}</h1>
          <div className="text-gray-600 space-y-1 text-sm">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 uppercase tracking-wide">Summary</h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    {exp.startDate && (
                      <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{exp.company}</p>
                  <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
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
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-8">
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
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
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
                  <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>
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
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.map((section) => (
          <section key={section.id} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 uppercase tracking-wide">{section.name}</h2>
            {renderCustomSectionValue(section)}
          </section>
        ))}
      </div>
    </div>
  );
};
