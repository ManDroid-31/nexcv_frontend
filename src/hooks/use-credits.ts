"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCreditPricing, getCreditBalance, getCreditHistory, purchaseCredits } from '@/data/credits';

// Types for pricing and transaction
interface CreditPackage {
  credits: number;
  price: number;
}
interface CreditPricing {
  pricePerCredit: number;
  currency: string;
  packages: CreditPackage[];
}
export interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
  sessionId?: string;
  price?: number;
  status?: string;
}

// Module-level cache for balance and pricing
let cachedBalance: number | null = null;
let cachedPricing: CreditPricing | null = null;
let cachedUserId: string | null = null;
let balancePromise: Promise<number | void> | null = null;
let pricingPromise: Promise<CreditPricing | void> | null = null;

export function useCredits() {
  const { user } = useUser();
  const userId = user?.id;

  const [balance, setBalance] = useState<number | null>(cachedBalance);
  const [pricing, setPricing] = useState<CreditPricing | null>(cachedPricing);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch and cache balance
  const fetchBalance = useCallback(async (force = false) => {
    if (!userId) return;
    if (!force && cachedBalance !== null && cachedUserId === userId) {
      setBalance(cachedBalance);
      return;
    }
    setLoading(true);
    setError(null);
    if (!balancePromise) {
      balancePromise = getCreditBalance(userId)
        .then(res => {
          cachedBalance = res.creditBalance;
          cachedUserId = userId;
          setBalance(res.creditBalance);
          return res.creditBalance;
        })
        .catch(() => {
          setError('Failed to fetch credit balance');
        })
        .finally(() => {
          setLoading(false);
          balancePromise = null;
        });
    } else {
      await balancePromise;
      setBalance(cachedBalance);
      setLoading(false);
    }
  }, [userId]);

  // Helper to fetch and cache pricing
  const fetchPricing = useCallback(async (force = false) => {
    if (!force && cachedPricing !== null) {
      setPricing(cachedPricing);
      return;
    }
    setLoading(true);
    setError(null);
    if (!pricingPromise) {
      pricingPromise = getCreditPricing()
        .then(res => {
          cachedPricing = res;
          setPricing(res);
          return res;
        })
        .catch(() => {
          setError('Failed to fetch credit pricing');
        })
        .finally(() => {
          setLoading(false);
          pricingPromise = null;
        });
    } else {
      await pricingPromise;
      setPricing(cachedPricing);
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCreditHistory(userId);
      setHistory(res as CreditTransaction[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const buyCredits = useCallback(async (credits: number) => {
    if (!userId) throw new Error('Not signed in');
    setLoading(true);
    setError(null);
    try {
      return await purchaseCredits(credits, userId);
    } catch (e) {
      setError('Failed to start checkout');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Only fetch if not cached or user changed
    if (userId && (cachedUserId !== userId || cachedBalance === null)) {
      fetchBalance();
    } else if (cachedBalance !== null) {
      setBalance(cachedBalance);
    }
    if (cachedPricing === null) {
      fetchPricing();
    } else {
      setPricing(cachedPricing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const handler = () => {
      fetchBalance(true);
    };
    window.addEventListener('refresh-credits', handler);
    return () => window.removeEventListener('refresh-credits', handler);
  }, [fetchBalance]);

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