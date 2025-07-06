"use client"

import React, { useMemo, useEffect, useCallback, useRef, useState } from "react";
import { getTemplate } from "./templates";
import { Onyx } from "./templates/onyx";
import type { ResumeData } from "@/types/resume";

// A4 dimensions in px (at 96dpi)
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;
const HEADER_FOOTER_SPACE = 30;
const CONTENT_HEIGHT = A4_HEIGHT - PAGE_MARGIN * 2 - HEADER_FOOTER_SPACE;






export function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  const resumeData = data;
  const sectionOrder = resumeData?.sectionOrder || [];
  
  // State for pagination and measurement
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [scale, setScale] = useState(0.8);
  
  // Refs for tracking
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastDataRef = useRef<string>('');
  const lastTemplateRef = useRef<string>('');
  
  // Get template component
  const TemplateComponent = getTemplate(template) || Onyx;
  


  // Memoize the data string to detect actual changes
  const dataString = useMemo(() => JSON.stringify(data), [data]);
  
  // Debug: Log section order and custom sections (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && data && data.sectionOrder) {
      console.log('Section Order:', data.sectionOrder);
      console.log('Custom Sections:', data.customSections);
    }
  }, [data]);
  
  // Check if we need to re-measure
  const needsRemeasuring = useMemo(() => {
    return !hasInitialized || dataString !== lastDataRef.current || template !== lastTemplateRef.current;
  }, [dataString, template, hasInitialized]);

  // Memoize section nodes to prevent unnecessary re-renders
  const sectionNodes = useMemo(() => 
    sectionOrder.map((sectionKey, idx) => (
      <div
        key={`${sectionKey}-${idx}-${dataString}`}
        ref={el => { sectionRefs.current[idx] = el; }}
        style={{ 
          width: A4_WIDTH, 
          boxSizing: "border-box",
          pageBreakInside: "avoid",
          breakInside: "avoid"
        }}
      >
        <TemplateComponent data={data} sectionsToRender={[sectionKey]} />
      </div>
    )), [sectionOrder, TemplateComponent, data, dataString]);

  // Height-based pagination with debouncing
  const measureAndPaginate = useCallback(() => {
    if (!needsRemeasuring) return;
    
    // Use requestIdleCallback for better performance, fallback to requestAnimationFrame
    const scheduleMeasurement = () => {
      let currentPage: React.ReactNode[] = [];
      let currentHeight = 0;
      const allPages: React.ReactNode[][] = [];
      
      sectionRefs.current.forEach((el, idx) => {
        if (!el) return;
        const sectionHeight = el.getBoundingClientRect().height;
        // More conservative pagination: leave some buffer space
        const bufferSpace = 20; // 20px buffer
        const availableHeight = CONTENT_HEIGHT - bufferSpace;
        // If section is too tall for a single page, force it onto a new page and show warning
        if (sectionHeight > availableHeight) {
          // If not at top of page, start a new page first
          if (currentHeight !== 0) {
            if (currentPage.length > 0) allPages.push(currentPage);
            currentPage = [];
            currentHeight = 0;
          }
          // Add the too-tall section as its own page
          allPages.push([
            <div key={`oversize-warning-${idx}`} style={{ position: 'relative' }}>
              {sectionNodes[idx]}
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(255,0,0,0.85)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                zIndex: 10,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}>
                Section too tall for one page!
              </div>
            </div>
          ]);
          currentPage = [];
          currentHeight = 0;
        } else if (currentHeight + sectionHeight <= availableHeight || currentHeight === 0) {
          // If section fits with buffer space, add to current page
          currentPage.push(sectionNodes[idx]);
          currentHeight += sectionHeight;
        } else {
          // Start new page
          if (currentPage.length > 0) allPages.push(currentPage);
          currentPage = [sectionNodes[idx]];
          currentHeight = sectionHeight;
        }
      });
      if (currentPage.length > 0) allPages.push(currentPage);
      
      // If no pages were created, create a single page with all content
      if (allPages.length === 0 && sectionNodes.length > 0) {
        allPages.push(sectionNodes);
      }
      
      setPages(allPages);
      setHasInitialized(true);
      
      // Update refs to track what we've measured
      lastDataRef.current = dataString;
      lastTemplateRef.current = template;
    };

    // Use requestIdleCallback if available, otherwise use requestAnimationFrame
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback(scheduleMeasurement, { timeout: 100 });
    } else {
      requestAnimationFrame(scheduleMeasurement);
    }
  }, [needsRemeasuring, sectionNodes, dataString, template]);

  // Trigger measurement when needed
  useEffect(() => {
    measureAndPaginate();
  }, [measureAndPaginate]);

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
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  const scaledWidth = A4_WIDTH * scale;
  const scaledHeight = A4_HEIGHT * scale;

  if (!resumeData) {
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

  // Enhanced preview with clean, responsive UI and correct print/export
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
          {pages.map((pageContent, idx) => (
            <div key={idx} className="relative">
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
                    {pageContent}
                  </div>
                </div>
                {/* Corner fold */}
                <div
                  className="absolute top-0 right-0 w-8 h-8 bg-gray-100 transform rotate-45 translate-x-4 -translate-y-4 opacity-30 rounded-sm"
                  style={{ zIndex: 5 }}
                />
              </div>
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
      
      {/* Hidden measurement container */}
      <div style={{ 
        position: "absolute", 
        left: -9999, 
        top: 0, 
        visibility: "hidden", 
        width: A4_WIDTH,
        pointerEvents: "none"
      }}>
        {sectionNodes}
      </div>
    </div>
  );
}