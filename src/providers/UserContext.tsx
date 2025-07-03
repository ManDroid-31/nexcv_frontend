'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCreditBalance } from '@/data/credits';

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
  const { user } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user credits from the new credit system
      const creditsResponse = await getCreditBalance(user.id);
      
      setCredits(creditsResponse.creditBalance);
      setUserInfo({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        profession: user.publicMetadata?.profession as string,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.emailAddresses, user?.fullName, user?.publicMetadata?.profession]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refresh = () => {
    fetchUserData();
  };

  return (
    <UserContext.Provider value={{ credits, user: userInfo, isLoading, error, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext }; 