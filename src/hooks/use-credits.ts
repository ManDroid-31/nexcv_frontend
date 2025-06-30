import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCreditPricing, getCreditBalance, getCreditHistory, purchaseCredits } from '@/data/credits';

export function useCredits() {
  const { user } = useUser();
  const userId = user?.id;

  const [balance, setBalance] = useState<number | null>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getCreditBalance(userId);
      setBalance(res.creditBalance);
    } catch (err) {
      setError('Failed to fetch credit balance');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCreditPricing();
      setPricing(res);
    } catch (err) {
      setError('Failed to fetch credit pricing');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getCreditHistory(userId);
      setHistory(res.transactions);
    } catch (err) {
      setError('Failed to fetch credit history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const buyCredits = useCallback(async (credits: number) => {
    if (!userId) throw new Error('Not signed in');
    return purchaseCredits(credits, userId);
  }, [userId]);

  useEffect(() => {
    fetchBalance();
    fetchPricing();
  }, [fetchBalance, fetchPricing]);

  return {
    balance,
    pricing,
    history,
    loading,
    error,
    fetchBalance,
    fetchPricing,
    fetchHistory,
    buyCredits,
  };
} 