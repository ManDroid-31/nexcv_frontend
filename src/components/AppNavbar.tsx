"use client";
import { CreditBalance } from "@/components/CreditBalance";
import { CreditPurchaseModal } from "@/components/credit-purchase-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { CreditCard, LogIn, UserPlus, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppNavbar() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleLogoClick = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <div className="relative">
              <FileText className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-80"></div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-primary">NexCV</span>
          </button>
          <span className="hidden md:inline text-muted-foreground font-medium text-sm ml-2">AI Resume Builder</span>
        </div>
        <div className="flex items-center gap-4">
          <CreditBalance />
          <CreditPurchaseModal
            trigger={
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Buy Credits
              </button>
            }
            onSuccess={() => {
              window.location.reload();
            }}
          />
          <ThemeToggle />
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-base">
                <UserPlus className="w-5 h-5" />
                Sign Up
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-400 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-base">
                <LogIn className="w-5 h-5" />
                Log In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
} 