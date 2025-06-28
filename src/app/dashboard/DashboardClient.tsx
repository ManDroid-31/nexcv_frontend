"use client";

import { UserButton, SignedIn, useUser } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Linkedin, Eye, Download, Edit3, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ResumeData } from '@/types/resume';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useResumeStore } from '@/stores/resume-store';
import { toast } from 'sonner';
import { fetchLinkedInResume } from '@/data/resume';

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
  const [importing, setImporting] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
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
      // Dummy data for a software engineer resume
      const dummyResume = {
        title: 'John Doe - Software Engineer',
        slug: 'john-doe-software-engineer',
        isPublic: false,
        template: 'modern',
        tags: ['software engineer', 'typescript', 'react'],
        layout: {
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          spacing: { sectionGap: 24, paragraphGap: 12, lineHeight: 1.5 },
          scale: 1
        },
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 555-123-4567',
          location: 'San Francisco, CA',
          website: 'https://johndoe.dev',
          linkedin: 'linkedin.com/in/johndoe',
          github: 'github.com/johndoe',
        },
        summary: 'Results-driven Software Engineer with 5+ years of experience specializing in building scalable web applications using React, TypeScript, and Node.js. Passionate about clean code, performance, and user experience.',
        experience: [
          {
            id: '1',
            company: 'Tech Solutions Inc.',
            position: 'Senior Software Engineer',
            startDate: '2021-01',
            endDate: '2023-12',
            description: 'Led a team of 5 engineers to develop a SaaS platform using React, Next.js, and GraphQL. Improved application performance by 30% and reduced bug count by 40%.',
            tags: ['React', 'Next.js', 'GraphQL']
          },
          {
            id: '2',
            company: 'Webify Corp.',
            position: 'Frontend Developer',
            startDate: '2018-06',
            endDate: '2020-12',
            description: 'Built and maintained responsive web applications with React and Redux. Collaborated with designers and backend engineers to deliver high-quality products.',
            tags: ['React', 'Redux', 'JavaScript']
          }
        ],
        education: [
          {
            id: '1',
            school: 'University of California, Berkeley',
            degree: 'B.S. in Computer Science',
            startDate: '2014-08',
            endDate: '2018-05',
            gpa: '3.8',
            tags: ['Dean\'s List', 'Programming Club']
          }
        ],
        projects: [
          {
            id: '1',
            name: 'Open Source Portfolio',
            description: 'A personal portfolio website built with Next.js and Tailwind CSS, featuring open source projects and blogs.',
            technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
            liveUrl: 'https://johndoe.dev',
            githubUrl: 'https://github.com/johndoe/portfolio',
            startDate: '2022-01',
            endDate: '2022-03',
            tags: ['Personal', 'Open Source']
          },
          {
            id: '2',
            name: 'Task Manager App',
            description: 'A full-stack task management app with authentication, real-time updates, and drag-and-drop UI.',
            technologies: ['React', 'Node.js', 'MongoDB'],
            liveUrl: '',
            githubUrl: 'https://github.com/johndoe/task-manager',
            startDate: '2021-05',
            endDate: '2021-08',
            tags: ['Full Stack', 'Productivity']
          }
        ],
        skills: [
          'JavaScript',
          'TypeScript',
          'React',
          'Next.js',
          'Node.js',
          'GraphQL',
          'HTML',
          'CSS',
          'Git',
          'Jest',
          'Cypress'
        ],
        customSections: [],
        sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'],
      };
      const newResume = await resumeStore.saveResume(dummyResume, user?.id);
      refreshResumes();
      toast.success('Resume created!');
      router.push(`/editor/${newResume?.id}`);
    } catch {
      toast.error('Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedInUrl.trim()) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }

    // Validate LinkedIn URL format
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    if (!linkedInRegex.test(linkedInUrl.trim())) {
      toast.error('Please enter a valid LinkedIn profile URL');
      return;
    }

    // Check if user has enough credits
    if (credits !== null && credits < 7) {
      toast.error('Not enough credits. You need 7 credits to import from LinkedIn.');
      return;
    }

    setImporting(true);
    try {
      const importedResume = await fetchLinkedInResume({ linkedinUrl: linkedInUrl.trim() }, user?.id);
      refreshResumes();
      toast.success('LinkedIn profile imported successfully!');
      setShowLinkedInModal(false);
      setLinkedInUrl('');
      router.push(`/editor/${importedResume.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import LinkedIn profile';
      toast.error(errorMessage);
    } finally {
      setImporting(false);
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-sky-400 text-white font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer relative group"
              onClick={() => setShowLinkedInModal(true)}
              disabled={importing}
            >
              {importing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Linkedin className="w-5 h-5" />
              )}
              Import from LinkedIn
              <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full font-bold animate-pulse border border-white/30">7 credits</span>
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

      {/* LinkedIn Import Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Import from LinkedIn</h3>
              <button
                onClick={() => {
                  setShowLinkedInModal(false);
                  setLinkedInUrl('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                disabled={importing}
              />
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-blue-800 dark:text-blue-200 text-lg">7 Credits</span>
                  <span className="text-blue-600 dark:text-blue-300 text-sm ml-2">required</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Your balance:</span>
                <span className="font-semibold text-blue-800 dark:text-blue-200">
                  {creditsLoading ? 'Loading...' : `${credits ?? 0} credits`}
                </span>
              </div>
              {credits !== null && credits < 7 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 text-xs">
                    ⚠️ Insufficient credits. You need {7 - credits} more credits.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLinkedInImport}
                disabled={importing || !linkedInUrl.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Profile'}
              </button>
              <button
                onClick={() => {
                  setShowLinkedInModal(false);
                  setLinkedInUrl('');
                }}
                className="px-4 py-2 border border-input rounded-md hover:bg-muted"
                disabled={importing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
