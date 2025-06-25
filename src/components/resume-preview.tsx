// ResumePreview.tsx
"use client"

import React, { useRef, useEffect, useState } from "react";
import { getTemplate } from "./templates";
import type { ResumeData } from "@/types/resume";

const A4_WIDTH = 794; // px
const A4_HEIGHT = 1123; // px
const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 60;
const CONTENT_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;

export function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const TemplateComponent = getTemplate(template);

  const sectionOrder = data.sectionOrder || [];
  const hiddenBlocks = sectionOrder.map((sectionKey) => (
    <div key={sectionKey} className="mb-4">
      <TemplateComponent data={data} sectionsToRender={[sectionKey]} />
    </div>
  ));

  useEffect(() => {
    if (!hiddenRef.current) return;
    const container = hiddenRef.current;
    const blocks = Array.from(container.children) as HTMLElement[];
    const pageBlocks: React.ReactNode[][] = [[]];
    let currentHeight = 0;
    let pageIndex = 0;

    blocks.forEach((el, idx) => {
      const elHeight = el.offsetHeight;

      if (currentHeight + elHeight <= (pageIndex === 0 ? (A4_HEIGHT - FOOTER_HEIGHT) : CONTENT_HEIGHT)) {
        pageBlocks[pageIndex].push(
          <div key={idx} dangerouslySetInnerHTML={{ __html: el.innerHTML }} />
        );
        currentHeight += elHeight;
      } else {
        // Push to new page
        pageIndex++;
        currentHeight = elHeight;
        pageBlocks[pageIndex] = [
          <div key={idx} dangerouslySetInnerHTML={{ __html: el.innerHTML }} />
        ];
      }
    });

    setPages(pageBlocks.filter(p => p.length > 0));
  }, [data, template]);

  return (
    <div className="flex flex-col items-center p-4" style={{ background: '#f5f5f5' }}>
      <div className="w-full max-w-[850px]">
        {pages.map((pageContent, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg mb-6 border border-gray-200"
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              boxSizing: 'border-box',
              color: '#222',
              background: '#fff',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header: only on pages 2+ */}
            {idx > 0 && (
              <div
                style={{
                  height: HEADER_HEIGHT,
                  flexShrink: 0,
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 18,
                  background: '#fff',
                  color: '#222',
                  letterSpacing: 1,
                }}
              >
                {data.personalInfo?.name || 'Resume'}
              </div>
            )}
            {/* Content */}
            <div
              style={{
                flex: 1,
                padding: PAGE_MARGIN,
                overflow: 'hidden',
                background: '#fff',
                minHeight: idx === 0 ? (A4_HEIGHT - FOOTER_HEIGHT) : CONTENT_HEIGHT,
                maxHeight: idx === 0 ? (A4_HEIGHT - FOOTER_HEIGHT) : CONTENT_HEIGHT,
                wordBreak: 'break-word',
                display: 'block',
              }}
            >
              {pageContent}
            </div>
            {/* Footer: always present, but omit 'Page 1' label on first page */}
            <div
              style={{
                height: FOOTER_HEIGHT,
                flexShrink: 0,
                borderTop: '1.5px solid #2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                background: '#fff',
                color: '#222',
                letterSpacing: 1,
              }}
            >
              {idx > 0 ? `Page ${idx + 1}` : null}
            </div>
          </div>
        ))}
        {/* Hidden container to measure blocks */}
        <div
          ref={hiddenRef}
          style={{ position: 'absolute', left: -9999, top: 0, width: A4_WIDTH - PAGE_MARGIN * 2, visibility: 'hidden', pointerEvents: 'none' }}
        >
          {hiddenBlocks}
        </div>
      </div>
    </div>
  );
}
