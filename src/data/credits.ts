// calls all /api/credits operation apis and returns its responce

import {config} from "dotenv";
config();

// console.log(process.env.NEXT_PUBLIC_BACKEND_URL) //works
// Use relative URLs for all credit requests (proxy through Next.js API)
const BASE_URL = '/api/credits';

const getAuthHeaders = (userId?: string) => ({
  'Content-Type': 'application/json',
  ...(userId ? { 'x-clerk-user-id': userId } : {}),
});

export async function getCreditPricing() {
  const res = await fetch(`${BASE_URL}/pricing`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch credit pricing');
  }
  return res.json();
}

export async function getCreditBalance(userId?: string) {
  const res = await fetch(`${BASE_URL}/balance`, {
    headers: getAuthHeaders(userId),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch credit balance');
  }
  return res.json();
}

export async function getCreditHistory(userId?: string) {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: getAuthHeaders(userId),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch credit history');
  }
  return res.json();
}

export async function purchaseCredits(credits: number, userId?: string) {
  const res = await fetch(`${BASE_URL}/purchase`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(userId),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credits }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create Stripe checkout session');
  }
  return res.json();
} 