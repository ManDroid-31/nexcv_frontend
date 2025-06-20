import React from "react";
import type { TemplateProps } from "../../types/template";
import type { CustomSection } from "@/types/resume";

export const Leafish = ({ data }: TemplateProps) => {
  const renderCustomSectionValue = (section: CustomSection) => {
    if (Array.isArray(section.value)) {
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
        className="max-w-[850px] w-full p-8 bg-white"
        style={{
          padding: '40px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Header with Minimal Style */}
        <header className="mb-8">
          <h1 className="text-4xl font-light mb-2 text-gray-900">{data.personalInfo.name}</h1>
          <div className="text-gray-600 space-y-1 text-sm">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3 text-gray-900 uppercase tracking-wide">Summary</h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
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
            <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
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
            <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Skills</h2>
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
            <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">Projects</h2>
            <div className="space-y-6">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  </div>
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
            <h2 className="text-lg font-medium mb-4 text-gray-900 uppercase tracking-wide">{section.name}</h2>
            {renderCustomSectionValue(section)}
          </section>
        ))}
      </div>
    </div>
  );
};
