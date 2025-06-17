"use client"

import { useState, useEffect, useMemo } from "react"
import { useResumeStore, templateStyles } from "@/stores/resume-store"
import { ResumeData, CustomSection, KeyValuePair, ArrayObjectItem } from "@/types/resume"

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { setResumeData } = useResumeStore();

  // Get the current template style
  const style = templateStyles[template as keyof typeof templateStyles] || templateStyles.modern;

  // Initialize preview data and set loading to false when data is available
  useEffect(() => {
    if (data) {
      setResumeData(data);
      setIsLoading(false);
      // Update the last updated time whenever data changes
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [data, setResumeData]);

  const renderCustomSection = (section: CustomSection) => {
    switch (section.type) {
      case 'string':
        return (
          <div className={style.section}>
            <h3 className={style.sectionTitle}>{section.name}</h3>
            <p className={style.sectionContent}>{section.value as string}</p>
          </div>
        );

      case 'array':
        return (
          <div className={style.section}>
            <h3 className={style.sectionTitle}>{section.name}</h3>
            <ul className="list-disc list-inside space-y-1">
              {(section.value as string[]).map((item, index) => (
                <li key={index} className={style.sectionContent}>{item}</li>
              ))}
            </ul>
          </div>
        );

      case 'object':
        return (
          <div className={style.section}>
            <h3 className={style.sectionTitle}>{section.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(section.value as Record<string, string>).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className={style.sectionTitle}>{key}</span>
                  <span className={style.sectionContent}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'key-value':
        const keyValuePairs = section.value as KeyValuePair[];
        if (!Array.isArray(keyValuePairs)) return null;
        return (
          <div className={style.section}>
            <h3 className={style.sectionTitle}>{section.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              {keyValuePairs.map((item) => (
                <div key={item.id} className="flex flex-col">
                  <span className={style.sectionTitle}>{item.key}</span>
                  <span className={style.sectionContent}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'array-object':
        return (
          <div className={style.section}>
            <h3 className={style.sectionTitle}>{section.name}</h3>
            <div className="space-y-4">
              {(section.value as ArrayObjectItem[]).map((item) => (
                <div key={item.id} className="border-l-2 border-gray-200 pl-4">
                  <h4 className={style.sectionTitle}>{item.title}</h4>
                  <p className={style.sectionContent}>{item.description}</p>
                  {item.date && (
                    <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSections = () => {
    if (!data) return null;

    return (
      <div className="space-y-8">
        {/* Personal Info */}
        <div className={style.header}>
          <h1 className={style.name}>{data.personalInfo.name}</h1>
          <div className={style.contact}>
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span className="mx-2">•</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span className="mx-2">•</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className={style.section}>
            <h2 className={style.sectionTitle}>Professional Summary</h2>
            <p className={style.sectionContent}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className={style.section}>
            <h2 className={style.sectionTitle}>Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="font-semibold">{exp.position}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                  <p className={style.sectionContent}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className={style.section}>
            <h2 className={style.sectionTitle}>Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold">{edu.school}</h3>
                  <p className="text-gray-600">{edu.degree}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className={style.section}>
            <h2 className={style.sectionTitle}>Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className={style.sectionContent}>{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className={style.tag}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="flex gap-4 mt-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:underline"
                        >
                          GitHub Repository
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className={style.section}>
            <h2 className={style.sectionTitle}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className={style.tag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.map((section) => (
          <div key={section.id}>
            {renderCustomSection(section)}
          </div>
        ))}
      </div>
    );
  };

  const previewContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    return renderSections();
  }, [isLoading, data, style]);

  return (
    <div className={style.container}>
      <div className="max-w-3xl mx-auto p-8">
        {previewContent}
        <div className="mt-8 text-sm text-gray-500 text-center">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
} 