"use client";
import { CreditBalance } from "@/components/CreditBalance";
import { CreditPurchaseModal } from "@/components/credit-purchase-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton, SignedIn } from '@clerk/nextjs';
import { CreditCard } from 'lucide-react';

export function AppNavbar() {
  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-2xl tracking-tight text-primary">NexCV</span>
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
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
} 