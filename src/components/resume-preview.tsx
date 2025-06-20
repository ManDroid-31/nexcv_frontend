"use client"

import React from "react";
import { getTemplate } from "./templates";
import type { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  if (!data) {
    return <div>Loading...</div>;
  }

  const TemplateComponent = getTemplate(template);
  
  // Apply layout settings
  const layoutStyles = {
    margin: `${data.layout?.margins?.top || 40}px ${data.layout?.margins?.right || 40}px ${data.layout?.margins?.bottom || 40}px ${data.layout?.margins?.left || 40}px`,
    lineHeight: data.layout?.spacing?.lineHeight || 1.5,
    transform: `scale(${data.layout?.scale || 1})`,
    transformOrigin: 'top left',
  };

  return (
    <div style={layoutStyles}>
      <TemplateComponent data={data} />
    </div>
  );
} 