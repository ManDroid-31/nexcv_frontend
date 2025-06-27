"use client";

import { UserButton, SignedIn, useUser } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Linkedin, Eye, Download, Edit3, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ResumeData } from '@/types/resume';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useResumeStore } from '@/stores/resume-store';
import { toast } from 'sonner';

// Client-side only date formatter to prevent hydration mismatch
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'recently';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return 'recently';
  }
};

export default function DashboardClient() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { credits, isLoading: creditsLoading } = useUserCredits();
  const resumeStore = useResumeStore();
  const resumes = resumeStore.resumes || [];

  // Always fetch resumes on mount and when a resume is created/deleted
  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      resumeStore.listResumes(user.id);
    }
  }, [user?.id]);

  // Refetch resumes after create/delete
  const refreshResumes = () => {
    if (user?.id) {
      resumeStore.listResumes(user.id);
    }
  };

  const handleCreateResume = async () => {
    setCreating(true);
    try {
      const emptyResume = {
        title: 'Untitled Resume',
        slug: '',
        isPublic: false,
        template: 'modern',
        tags: [],
        layout: {
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          spacing: { sectionGap: 24, paragraphGap: 12, lineHeight: 1.5 },
          scale: 1
        },
        personalInfo: { name: '', email: '', phone: '', location: '' },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        customSections: [],
        sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'],
      };
      const newResume = await resumeStore.saveResume(emptyResume, user?.id);
      refreshResumes();
      toast.success('Resume created!');
      router.push(`/editor/${newResume?.id}`);
    } catch {
      toast.error('Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (resumeId: string, resumeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(resumeId);
      await resumeStore.deleteResume(resumeId, user?.id);
      refreshResumes();
      toast.success('Resume deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete resume';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/60">
        <div className="flex items-center justify-center h-screen">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/60">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl tracking-tight text-primary">NexCV</span>
            <span className="hidden md:inline text-muted-foreground font-medium text-sm ml-2">AI Resume Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm font-semibold">
              {creditsLoading ? 'Loading credits...' : `${credits ?? 0} credits`}
            </div>
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Welcome{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl">Effortlessly create, manage, and export beautiful resumes powered by AI. Get started by creating a new resume or importing from LinkedIn.</p>
          <div className="flex gap-4">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer"
              onClick={handleCreateResume}
              disabled={creating}
            >
              {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-5 h-5" />} Create Resume
            </button>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-sky-400 text-white font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer"
              onClick={() => router.push('/import')}
            >
              <Linkedin className="w-5 h-5" /> Import from LinkedIn
              <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full font-bold">7 credits</span>
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-xl">
            {user?.imageUrl
              ? user.imageUrl.trim() !== "" && (
                  <Image src={user.imageUrl} alt="User avatar" width={112} height={112} className="w-28 h-28 rounded-full object-cover border-4 border-white/80 shadow" />
                )
              : (
                  <span className="text-5xl font-bold text-white">{user?.firstName?.[0] || 'U'}</span>
                )
            }
          </div>
        </div>
      </section>

      {/* Resume Actions Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6 text-primary">Your Resumes</h2>
        {resumes.length === 0 ? (
          <div className="text-muted-foreground text-center py-12 text-lg">No resumes found. Click &quot;Create Resume&quot; to get started!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {resumes.map((resume: ResumeData) => (
              <div
                key={resume.id}
                className="group relative rounded-2xl bg-card p-5 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 cursor-pointer overflow-hidden min-h-[170px] flex flex-col justify-between"
                onClick={e => { e.stopPropagation(); router.push(`/editor/${resume.id}`); }}
              >
                <div className="flex items-center justify-between mb-2 z-10">
                  <span className="font-bold text-lg truncate max-w-[70%]">{resume.title}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-semibold ml-2">{resume.template || 'Template'}</span>
                </div>
                <div className="transition-all duration-200 group-hover:opacity-0 group-hover:pointer-events-none opacity-100 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${resume.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{resume.status || 'Draft'}</span>
                    <span className="text-xs text-muted-foreground">{resume.views || 0} views</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Modified {formatDate(resume.updatedAt)}</div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-20 bg-background/80 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <button className="p-2 rounded-lg bg-secondary cursor-pointer text-white hover:bg-secondary/90 shadow flex items-center gap-1" onClick={e => { e.stopPropagation(); router.push(`/editor/${resume.id}`); }}>
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button className="p-2 rounded-lg bg-muted text-primary cursor-pointer hover:bg-muted/80 shadow flex items-center gap-1" onClick={e => { e.stopPropagation(); router.push(`/resume/${resume.id}`); }}>
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button className="p-2 rounded-lg bg-muted text-primary cursor-pointer hover:bg-muted/80 shadow flex items-center gap-1" onClick={e => { e.stopPropagation(); /* TODO: implement download/export */ }}>
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 shadow flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={e => { 
                        e.stopPropagation(); 
                        if (resume.id) {
                          handleDeleteResume(resume.id, resume.title);
                        }
                      }}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
