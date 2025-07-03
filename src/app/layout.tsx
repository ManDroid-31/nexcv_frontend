import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { PageTransition, NavigationProgress } from "@/components/page-transition";
import { UserProvider } from '../providers/UserContext';
// import { AppNavbar } from '@/components/AppNavbar';

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
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {/* TODO: Set signInUrl if you want a custom sign-in page */}
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <ThemeProvider>
            <NavigationProgress />
            <PageTransition />
            <UserProvider>
                {/* <AppNavbar /> */}
                {children}
            </UserProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
