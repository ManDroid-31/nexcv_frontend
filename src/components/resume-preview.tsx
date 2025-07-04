"use client"

import React from "react";
import { getTemplate } from "./templates";
import { Onyx } from "./templates/onyx";
import type { ResumeData } from "@/types/resume";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;

export function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  // Always use the selected template, fallback to Onyx
  const TemplateComponent = getTemplate(template) || Onyx;
  // All sections at once
  const sectionOrder = data?.sectionOrder || [];

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
    return () => { document.head.removeChild(style); };
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center p-4" style={{ background: "#f5f5f5" }}>
        <div className="w-full max-w-[850px]">
          <div className="bg-white mb-6 border border-gray-200 flex items-center justify-center" style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            boxSizing: "border-box",
          }}>
            <div className="text-muted-foreground">No resume data available</div>
          </div>
        </div>
      </div>
    );
  }

  // Render the full resume in one go, with all sections and template features
  return (
    <div className="flex flex-col items-center p-4" style={{ background: "#f5f5f5" }}>
      <div className="w-full max-w-[850px]">
        <div
          className="resume-print-page bg-white mb-6 border border-gray-200"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
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
              padding: PAGE_MARGIN,
              overflow: "hidden",
              overflowX: "hidden",
              background: "#fff",
              wordBreak: "break-word",
              display: "block",
              boxSizing: "border-box",
              height: A4_HEIGHT - PAGE_MARGIN * 2,
            }}
          >
            <TemplateComponent data={data} sectionsToRender={sectionOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}