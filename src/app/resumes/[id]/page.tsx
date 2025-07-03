"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResumePreview } from "@/components/resume-preview";
import { ResumeData } from "@/types/resume";

export default function PublicResumePage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/resumes/${id}`)
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
    return <div className="p-8 text-center text-red-500">Resume not found or not public.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8">
      <ResumePreview data={resume} template={resume.template || "onyx"} />
    </div>
  );
}
