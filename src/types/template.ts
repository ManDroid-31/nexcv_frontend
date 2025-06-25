import { ResumeData } from "./resume";

export interface TemplateProps {
  data: ResumeData;
  sectionsToRender?: string[]; // Optional: if provided, only render these sections
  // You can add more props here if templates need them (e.g., layout, columns, etc.)
} 