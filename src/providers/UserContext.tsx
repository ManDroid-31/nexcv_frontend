'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserInfo extends Record<string, unknown> {
  profession?: string;
}

interface UserContextType {
  credits: number | null;
  user: UserInfo | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const UserContext = createContext<UserContextType>({
  credits: null,
  user: null,
  isLoading: true,
  error: null,
  refresh: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [credits, setCredits] = useState<number | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userRes, creditsRes] = await Promise.all([
        fetch('/api/protected/me'),
        fetch('/api/protected/me/credits'),
      ]);
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      if (!creditsRes.ok) throw new Error('Failed to fetch credits');
      const userData = await userRes.json();
      const creditsData = await creditsRes.json();
      setUser(userData);
      setCredits(creditsData.credits);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const refresh = () => {
    fetchUserData();
  };

  return (
    <UserContext.Provider value={{ credits, user, isLoading, error, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext }; 