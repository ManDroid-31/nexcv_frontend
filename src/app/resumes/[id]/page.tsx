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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/resumes/${id}?view=publicview`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
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
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (notFound || !resume)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-background dark:to-muted/60 text-center px-4">
        <h1 className="text-7xl font-extrabold text-blue-600 mb-4 drop-shadow-lg">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Resume Not Found or Not Public</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          This resume is either private or does not exist.<br />
          If you think this is a mistake, please contact the owner or try again.
        </p>
        <Link href="/">
          <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-lg">
            Go back home
          </span>
        </Link>
        <div className="mt-10 opacity-60">
          <svg width="120" height="120" fill="none" viewBox="0 0 120 120">
            <ellipse cx="60" cy="100" rx="40" ry="10" fill="#e0e7ef" />
            <circle cx="60" cy="60" r="40" fill="#f1f5f9" />
            <path d="M50 70c0-5 10-5 10 0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="48" cy="55" r="3" fill="#94a3b8" />
            <circle cx="72" cy="55" r="3" fill="#94a3b8" />
          </svg>
        </div>
      </div>
    );

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
