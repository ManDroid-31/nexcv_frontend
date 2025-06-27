import { useContext, useEffect, useState } from 'react';
// TODO: Create UserContext in ../providers/UserContext
const UserContext = ({} as unknown) as React.Context<{
  credits?: number | null;
  user?: Record<string, unknown> | null;
  isLoading?: boolean;
  error?: Error | null;
}>;

export function useUserCredits() {
  const context = useContext(UserContext);
  const [credits, setCredits] = useState<number | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (context && typeof context.credits !== 'undefined') {
      setCredits(context.credits);
      setUser(context.user || null);
      setIsLoading(context.isLoading ?? false);
      setError(context.error || null);
      return;
    }
    // fallback: fetch if context not available
    let isMounted = true;
    setIsLoading(true);
    fetch('/api/protected/me/credits')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch credits');
        return res.json();
      })
      .then(json => {
        if (isMounted) {
          setCredits(json.credits);
          setUser(json.user || null);
        }
      })
      .catch(err => { if (isMounted) setError(err); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [context]);

  return { credits, user, isLoading, error };
} 