import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ResumeData } from '@/types/resume';
import { Loader2 } from "lucide-react";
import DashboardClient from './DashboardClient';

// Loading component for suspense
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/60">
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-sm text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    </div>
  );
}

// Server component for dashboard
async function DashboardServer() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // We'll fetch resumes on the client side using the useResumeApi hook
  return <DashboardClient />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardServer />
    </Suspense>
  );
} 