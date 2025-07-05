"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getTemplate } from "./templates";
import { Onyx } from "./templates/onyx";
import type { ResumeData } from "@/types/resume";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 40;
const CONTENT_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - (PAGE_MARGIN * 2);

export function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  const [isMeasuring, setIsMeasuring] = useState(true); // Start with measuring
  const [hasInitialized, setHasInitialized] = useState(false);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lastDataRef = useRef<string>("");
  const lastTemplateRef = useRef<string>("");
  
  const TemplateComponent = getTemplate(template) || Onyx;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionOrder = data?.sectionOrder || [];

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
    
    setIsMeasuring(true);
    
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
      setIsMeasuring(false);
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

  // Effect to trigger measurement when needed
  useEffect(() => {
    if (needsRemeasuring) {
      // For template changes, measure immediately
      if (template !== lastTemplateRef.current) {
        measureAndPaginate();
      } else {
        // For data changes, use small delay to batch rapid changes
        const timeoutId = setTimeout(measureAndPaginate, 25);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [needsRemeasuring, measureAndPaginate, template]);

  // Force initial measurement if no pages exist
  useEffect(() => {
    if (pages.length === 0 && !isMeasuring && data) {
      measureAndPaginate();
    }
  }, [pages.length, isMeasuring, data, measureAndPaginate]);

  // Print CSS
  useEffect(() => {
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
  
  // Early return if no data
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
  
  // Show loading state while measuring
  if (isMeasuring && pages.length === 0) {
    return (
      <div className="flex flex-col items-center p-4" style={{ background: "#f5f5f5" }}>
        <div className="w-full max-w-[850px]">
          <div className="bg-white mb-6 border border-gray-200 animate-pulse" style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            boxSizing: "border-box",
          }} />
        </div>
      </div>
    );
  }

  // Fallback: if no pages exist, render a single page with all content
  if (pages.length === 0 && data) {
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
              pageBreakAfter: "always",
            }}
          >
            <div
              style={{
                flex: "1 1 0%",
                padding: PAGE_MARGIN,
                overflow: "hidden",
                overflowX: "hidden",
                background: "#fff",
                wordBreak: "break-word",
                display: "block",
                boxSizing: "border-box",
              }}
            >
              <TemplateComponent data={data} sectionsToRender={sectionOrder} />
            </div>
            <div
              style={{
                height: FOOTER_HEIGHT,
                flexShrink: 0,
                borderTop: "1px solid #2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                background: "#fff",
                color: "#222",
                letterSpacing: 1
              }}
            >
              {/* No page number for single page */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render paginated result
  return (
    <div className="flex flex-col items-center p-4" style={{ background: "#f5f5f5" }}>
      <div className="w-full max-w-[850px]">
        {pages.map((pageContent, idx) => (
          <div
            key={`resume-page-${idx}-${dataString}`}
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
              pageBreakAfter: "always",
            }}
          >
            {idx > 0 && (
              <div
                style={{
                  height: HEADER_HEIGHT,
                  flexShrink: 0,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 18,
                  background: "#fff",
                  color: "#222",
                  letterSpacing: 1,
                }}
              >
                {data.personalInfo?.name || "Resume"}
              </div>
            )}
            <div
              style={{
                flex: "1 1 0%",
                padding: PAGE_MARGIN,
                overflow: "hidden",
                overflowX: "hidden",
                background: "#fff",
                wordBreak: "break-word",
                display: "block",
                // minHeight: PAGE_MARGIN+1,
                boxSizing: "border-box",
              }}
            >
              {pageContent}
            </div>
            <div
              style={{
                height: FOOTER_HEIGHT,
                flexShrink: 0,
                borderTop: "1px solid #2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                background: "#fff",
                color: "#222",
                letterSpacing: 1
              }}
            >
              {pages.length > 1 ? `Page ${idx + 1}` : null}
            </div>
          </div>
        ))}
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