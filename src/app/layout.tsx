import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { PageTransition, NavigationProgress } from "@/components/page-transition";
import { UserProvider } from '../providers/UserContext';
import { ResumeProvider } from '@/providers/ResumeContext';
import { useCredits } from '@/hooks/use-credits';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexCV - Modern AI Resume Builder",
  description: "Create beautiful resumes with AI-powered enhancements",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { balance, loading: balanceLoading } = useCredits();

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {/* TODO: Set signInUrl if you want a custom sign-in page */}
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <ThemeProvider>
            <NavigationProgress />
            <PageTransition />
            <UserProvider>
              <ResumeProvider>
                {/* Header with credits */}
                <header className="w-full border-b bg-background px-6 py-3 flex items-center justify-between">
                  <div className="font-bold text-xl text-primary">NexCV</div>
                  <div className="flex items-center gap-4">
                    <span className="bg-muted px-3 py-1 rounded-full text-sm font-semibold">
                      {balanceLoading ? 'Loading credits...' : `${balance ?? 0} credits`}
                    </span>
                    {/* ... other header content ... */}
                  </div>
                </header>
                {children}
              </ResumeProvider>
            </UserProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
