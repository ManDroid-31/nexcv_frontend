"use client"

import React from "react";
import { getTemplate } from "./templates";
import { Onyx } from "./templates/onyx";
import type { ResumeData } from "@/types/resume";

// Industry standard A4 dimensions and spacing
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;
const HEADER_FOOTER_SPACE = 30;
const CONTENT_HEIGHT = A4_HEIGHT - PAGE_MARGIN * 2 - HEADER_FOOTER_SPACE;
const SECTION_SPACING = 24;

// Utility to estimate content height for pagination
function estimateContentHeight(data: ResumeData, sectionsToRender: string[]): number {
  let totalHeight = 0;
  sectionsToRender.forEach((key) => {
    if (key === "personalInfo") {
      totalHeight += 120;
    } else if (key === "summary" && data.summary) {
      totalHeight += 80 + Math.ceil(data.summary.length / 80) * 20;
    } else if (key === "experience" && data.experience?.length) {
      totalHeight += 50;
      totalHeight += data.experience.length * 100;
    } else if (key === "education" && data.education?.length) {
      totalHeight += 50;
      totalHeight += data.education.length * 80;
    } else if (key === "skills" && data.skills?.length) {
      totalHeight += 50;
      totalHeight += Math.ceil(data.skills.length / 8) * 35;
    } else if (key === "projects" && data.projects?.length) {
      totalHeight += 50;
      totalHeight += data.projects.length * 90;
    } else if (key.startsWith("custom:")) {
      const section = data.customSections?.find((cs) => cs.id === key.replace("custom:", ""));
      if (
        section?.value &&
        typeof section.value === 'object' &&
        section.value !== null &&
        Array.isArray((section.value as Record<string, unknown>).items)
      ) {
        totalHeight += 50;
        totalHeight += ((section.value as Record<string, unknown>).items as unknown[]).length * 40;
      }
    }
    totalHeight += SECTION_SPACING;
  });
  return totalHeight;
}

// Split sections across pages
function splitContentAcrossPages(data: ResumeData, sectionsToRender: string[]): string[][] {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentPageHeight = 0;
  sectionsToRender.forEach((key) => {
    let sectionHeight = 0;
    if (key === "personalInfo") {
      sectionHeight = 120;
    } else if (key === "summary" && data.summary) {
      sectionHeight = 80 + Math.ceil(data.summary.length / 80) * 20;
    } else if (key === "experience" && data.experience?.length) {
      sectionHeight = 50 + data.experience.length * 100;
    } else if (key === "education" && data.education?.length) {
      sectionHeight = 50 + data.education.length * 80;
    } else if (key === "skills" && data.skills?.length) {
      sectionHeight = 50 + Math.ceil(data.skills.length / 8) * 35;
    } else if (key === "projects" && data.projects?.length) {
      sectionHeight = 50 + data.projects.length * 90;
    } else if (key.startsWith("custom:")) {
      const section = data.customSections?.find((cs) => cs.id === key.replace("custom:", ""));
      if (
        section?.value &&
        typeof section.value === 'object' &&
        section.value !== null &&
        Array.isArray((section.value as Record<string, unknown>).items)
      ) {
        sectionHeight = 50 + ((section.value as Record<string, unknown>).items as unknown[]).length * 40;
      }
    }
    sectionHeight += SECTION_SPACING;
    if (currentPageHeight + sectionHeight > CONTENT_HEIGHT && currentPage.length > 0) {
      pages.push([...currentPage]);
      currentPage = [key];
      currentPageHeight = sectionHeight;
    } else {
      currentPage.push(key);
      currentPageHeight += sectionHeight;
    }
  });
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  return pages.length > 0 ? pages : [[]];
}

export function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  // Defensive: fallback to Onyx if template not found
  const TemplateComponent = getTemplate(template) || Onyx;
  const sectionOrder = data?.sectionOrder || [];

  // Pagination logic
  const totalContentHeight = estimateContentHeight(data, sectionOrder);
  const needsPagination = totalContentHeight > CONTENT_HEIGHT;
  const pages = needsPagination ? splitContentAcrossPages(data, sectionOrder) : [sectionOrder];

  // Responsive scale for preview (not for print)
  const getScale = () => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) return 0.5;
      if (screenWidth < 1024) return 0.65;
      return 0.8;
    }
    return 0.8;
  };
  const [scale, setScale] = React.useState(0.8);
  React.useEffect(() => {
    const handleResize = () => setScale(getScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Print CSS (for PDF/print)
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body { background: #fff !important; }
        .resume-print-page {
          box-shadow: none !important;
          border: none !important;
          background: #fff !important;
          page-break-after: always;
          margin: 0 auto !important;
        }
        .resume-print-btn, .resume-nonprint { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const scaledWidth = A4_WIDTH * scale;
  const scaledHeight = A4_HEIGHT * scale;

  if (!data) {
    return (
      <div className="flex flex-col items-center p-4" style={{ background: "#f5f5f5" }}>
        <div className="w-full max-w-[850px]">
          <div
            className="bg-white mb-6 border border-gray-200 flex items-center justify-center"
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              boxSizing: "border-box",
            }}
          >
            <div className="text-muted-foreground">No resume data available</div>
          </div>
        </div>
      </div>
    );
  }

  // Render all pages, each with the correct template and sections
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header (non-print) */}
        <div className="text-center mb-8 resume-nonprint">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Resume Preview</h2>
          <p className="text-gray-600">
            Template: <span className="font-medium capitalize">{template}</span>
            {pages.length > 1 && <span className="ml-4">• {pages.length} pages</span>}
          </p>
        </div>
        {/* Controls (non-print) */}
        <div className="flex justify-center mb-8 resume-nonprint">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center gap-2">
            <span className="text-sm text-gray-600 px-3">Zoom:</span>
            <button
              onClick={() => setScale(Math.max(0.3, scale - 0.1))}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(1.2, scale + 0.1))}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        {/* Pages */}
        <div className="flex flex-col items-center gap-8">
          {pages.map((pageSections, pageIndex) => (
            <div key={pageIndex} className="relative">
              {/* Shadow */}
              <div
                className="absolute inset-0 bg-gray-400 rounded-lg transform translate-x-2 translate-y-2 opacity-20"
                style={{ width: scaledWidth, height: scaledHeight }}
              />
              {/* Page */}
              <div
                className="resume-print-page bg-white rounded-lg shadow-2xl border border-gray-200 relative z-10 transition-all duration-300 hover:shadow-3xl"
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  boxSizing: "border-box",
                  color: "#222",
                  background: "#fff",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: PAGE_MARGIN * scale,
                    overflow: "hidden",
                    background: "#fff",
                    wordBreak: "break-word",
                    boxSizing: "border-box",
                    height: scaledHeight - PAGE_MARGIN * scale * 2,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${1 / scale})`,
                      transformOrigin: "top left",
                      width: `${100 / scale}%`,
                      height: `${100 / scale}%`,
                    }}
                  >
                    <TemplateComponent
                      data={data}
                      sectionsToRender={pageSections}
                    />
                  </div>
                </div>
              </div>
              {/* Corner fold */}
              <div
                className="absolute top-0 right-0 w-8 h-8 bg-gray-100 transform rotate-45 translate-x-4 -translate-y-4 opacity-30 rounded-sm"
                style={{ zIndex: 5 }}
              />
            </div>
          ))}
        </div>
        {/* Footer (non-print) */}
        <div className="text-center mt-8 resume-nonprint">
          <p className="text-sm text-gray-500">
            A4 Format • {A4_WIDTH} × {A4_HEIGHT} pixels • Ready for print and PDF export
            {pages.length > 1 && <span> • {pages.length} pages</span>}
          </p>
        </div>
      </div>
    </div>
  );
}