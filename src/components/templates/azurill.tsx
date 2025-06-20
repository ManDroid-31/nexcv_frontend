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

export const Azurill = ({ data }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => renderValue(section.value);

  // Standard outer margin (not user-editable)
  const margins = {
    top: data.layout?.margins?.top ?? 40,
    bottom: data.layout?.margins?.bottom ?? 40,
    left: data.layout?.margins?.left ?? 40,
    right: data.layout?.margins?.right ?? 40
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
        className="max-w-[850px] w-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
        style={{
          padding: '40px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Header with Playful Style */}
        <header className="mb-8 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-5xl font-bold mb-3">{data.personalInfo.name}</h1>
          <div className="text-lg space-y-1 opacity-90">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">About Me</h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-400 pl-4 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-r-2xl">
                  <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                  <div className="text-blue-600 mb-2">
                    <span className="font-semibold">{exp.company}</span>
                    {exp.startDate && (
                      <span className="ml-2">• {exp.startDate} - {exp.endDate || 'Present'}</span>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-blue-400 pl-4 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-r-2xl">
                  <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                  <div className="text-blue-600">
                    <span className="font-semibold">{edu.school}</span>
                    {edu.startDate && (
                      <span className="ml-2">• {edu.startDate} - {edu.endDate || 'Present'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Projects</h2>
            <div className="space-y-6">
              {data.projects.map((project) => (
                <div key={project.id} className="border-l-4 border-blue-400 pl-4 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-r-2xl">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="text-sm text-blue-600 mb-2">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline mr-4">
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
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
                          className="bg-gradient-to-r from-indigo-400 to-blue-400 text-white px-3 py-1 rounded-full text-sm font-medium"
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
          <section key={section.id} className="mb-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">{section.name}</h2>
            {renderCustomSectionValue(section)}
          </section>
        ))}
      </div>
    </div>
  );
};
