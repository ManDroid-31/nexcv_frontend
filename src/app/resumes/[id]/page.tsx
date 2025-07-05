"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ResumePreview } from "@/components/resume-preview";
import { ResumeData } from "@/types/resume";
import { getResumeById } from "@/data/resume";
import { Lock, Unlock } from "lucide-react";
import Link from "next/link";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PublicResumePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    getResumeById(id, undefined, 'publicview')
      .then((resumeData) => {
        setResume(resumeData);
      })
      .catch((err) => {
        console.error('Error fetching resume:', err);
        if (err.message.includes('not found') || err.message.includes('404')) {
          setNotFound(true);
        } else if (err.message.includes('Access denied') || err.message.includes('403')) {
          setIsPrivate(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Handle download logic
  useEffect(() => {
    if (!resume) return;
    const downloadType = searchParams?.get('download');
    if (!downloadType) return;
    setDownloading(true);
    if (downloadType === 'json') {
      // Download JSON
      const jsonData = JSON.stringify(resume, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const fileName = `${resume.personalInfo?.name || resume.title || 'resume'}-${new Date().toISOString().split('T')[0]}.json`
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .toLowerCase();
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
      link.type = 'application/json';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
        router.replace(`/resumes/${id}?view=publicview`);
      }, 100);
    } else if (downloadType === 'pdf') {
      // Download PDF using ResumePreview and html2canvas/jsPDF
      setTimeout(async () => {
        try {
          const previewNode = previewRef.current;
          if (!previewNode) throw new Error('Preview not found');
          const pages = Array.from(previewNode.querySelectorAll('.resume-print-page'));
          if (pages.length === 0) throw new Error('No pages found in preview');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
          for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, backgroundColor: '#fff' });
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage([794, 1123], 'p');
            pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
          }
          const fileName = `${resume.personalInfo?.name || resume.title || 'resume'}-${new Date().toISOString().split('T')[0]}.pdf`
            .replace(/[^a-zA-Z0-9-]/g, '-')
            .toLowerCase();
          pdf.save(fileName);
        } catch {
          // Optionally show error
        } finally {
          setDownloading(false);
          router.replace(`/resumes/${id}?view=publicview`);
        }
      }, 500);
    }
  }, [resume, searchParams, id, router]);

  if (loading || downloading) return <div className="p-8 text-center">{downloading ? 'Preparing download...' : 'Loading...'}</div>;

  if (notFound)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-background dark:to-muted/60 text-center px-4">
        <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
          <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
            <ellipse cx="24" cy="40" rx="16" ry="4" fill="#e0e7ef" />
            <circle cx="24" cy="24" r="16" fill="#f1f5f9" />
            <path d="M20 28c0-2 8-2 8 0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="22" r="2" fill="#94a3b8" />
            <circle cx="30" cy="22" r="2" fill="#94a3b8" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Resume Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The resume you are looking for does not exist.<br />
          Please check the link or contact the owner.
        </p>
        <Link href="/">
          <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-lg">
            Go back home
          </span>
        </Link>
      </div>
    );

  if (isPrivate)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-background dark:to-muted/60 text-center px-4">
        <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-red-700 dark:text-red-300 mb-4">This Resume is Private</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The owner of this resume has set it to private.<br />
          Only the owner can view this resume.
        </p>
        <Link href="/">
          <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-lg">
            Go back home
          </span>
        </Link>
      </div>
    );

  if (!resume)
    return null;

  // Determine public/private status for badge
  const isPublic = resume.visibility === "public" || resume.isPublic === true;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8">
      {/* Hidden preview for PDF export */}
      <div style={{ position: 'absolute', left: -9999, top: 0, width: 850, pointerEvents: 'none', zIndex: -1 }} aria-hidden ref={previewRef}>
        <ResumePreview data={resume} template={resume.template || "onyx"} />
      </div>
      {/* Public/Private Badge */}
      <div className="mb-6 flex flex-col items-center">
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow text-lg
            ${isPublic ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"}
          `}
        >
          {isPublic ? (
            <>
              <Unlock className="w-5 h-5" /> Public Resume
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" /> Private Resume
            </>
          )}
        </span>
        <span className="text-xs text-muted-foreground mt-2">
          {isPublic
            ? "Anyone with this link can view this resume."
            : "This resume is private. Only the owner can view it."}
        </span>
      </div>
      <ResumePreview data={resume} template={resume.template || "onyx"} />
    </div>
  );
}
