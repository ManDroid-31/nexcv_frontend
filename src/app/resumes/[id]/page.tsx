"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResumePreview } from "@/components/resume-preview";
import { ResumeData } from "@/types/resume";
import { Lock, Unlock } from "lucide-react";
import Link from "next/link";

export default function PublicResumePage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/resumes/${id}?view=publicview`)
      .then(async (res) => {
        if (res.status === 404) throw new Error("notfound");
        if (res.status === 403) throw new Error("private");
        if (!res.ok) throw new Error("unknown");
        const data = await res.json();
        // Check for public visibility
        if (
          data.visibility === "public" ||
          data.isPublic === true ||
          (data.data && data.data.isPublic === true)
        ) {
          setResume(
            data.data
              ? { ...data.data, id: data.id, title: data.title, template: data.template }
              : data
          );
        } else {
          setIsPrivate(true);
        }
      })
      .catch((err) => {
        if (err.message === "notfound") setNotFound(true);
        else if (err.message === "private") setIsPrivate(true);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

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
