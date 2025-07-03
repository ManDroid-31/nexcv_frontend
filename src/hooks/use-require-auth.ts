import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

// Add Clerk to the Window type for TypeScript
declare global {
  interface Window {
    Clerk?: {
      openSignIn?: () => void;
      openSignUp?: () => void;
    };
  }
}

export function useRequireAuth() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  // Returns true if authenticated, otherwise shows toast and opens Clerk modal
  const requireAuth = useCallback((action?: () => void) => {
    if (!isSignedIn) {
      toast.toast({
        title: 'Sign in required',
        description: 'Please sign in to continue.',
        variant: 'warning',
      });
      // Open Clerk modal if available
      if (typeof window !== 'undefined' && typeof window.Clerk !== 'undefined' && typeof window.Clerk.openSignIn === 'function') {
        window.Clerk.openSignIn();
      } else {
        // Fallback: redirect to /sign-in
        window.location.href = '/sign-in';
      }
      return false;
    }
    if (action) action();
    return true;
  }, [isSignedIn, toast]);

  return { requireAuth, isSignedIn };
} 