import { useUser, SignInButton } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export function useRequireAuth() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  // Returns true if authenticated, otherwise shows toast and opens Clerk modal
  const requireAuth = useCallback((action?: () => void) => {
    if (!isSignedIn) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue.',
        variant: 'warning',
      });
      // Open Clerk modal if available
      if (typeof window !== 'undefined' && window.Clerk && window.Clerk.openSignIn) {
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