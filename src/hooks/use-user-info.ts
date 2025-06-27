import { useContext, useEffect, useState } from 'react';
// TODO: Create UserContext in ../providers/UserContext
const UserContext = ({} as unknown) as React.Context<{
  credits?: number | null;
  user?: Record<string, unknown> | null;
  isLoading?: boolean;
  error?: Error | null;
}>;

interface UserInfo extends Record<string, unknown> {
  profession?: string;
}

export function useUserInfo() {
  const context = useContext(UserContext);
  const [data, setData] = useState<UserInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (context && typeof context.user !== 'undefined') {
      setData(context.user as UserInfo);
      setIsLoading(context.isLoading ?? false);
      setError(context.error || null);
      return;
    }
    // fallback: fetch if context not available
    let isMounted = true;
    setIsLoading(true);
    fetch('/api/protected/me')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then(json => { if (isMounted) setData(json); })
      .catch(err => { if (isMounted) setError(err); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [context]);

  return { profession: data?.profession, isLoading, error, ...(data || {}) };
} 