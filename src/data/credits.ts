import { getAuthHeaders } from './resume';

const BASE_URL = '/api/credits';

export async function getCreditPricing() {
  const res = await fetch(`${BASE_URL}/pricing`);
  if (!res.ok) throw new Error('Failed to fetch credit pricing');
  return res.json();
}

export async function getCreditBalance(userId?: string) {
  const res = await fetch(`${BASE_URL}/balance`, {
    headers: getAuthHeaders(userId),
  });
  if (!res.ok) throw new Error('Failed to fetch credit balance');
  return res.json();
}

export async function getCreditHistory(userId?: string) {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: getAuthHeaders(userId),
  });
  if (!res.ok) throw new Error('Failed to fetch credit history');
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
  if (!res.ok) throw new Error('Failed to create Stripe checkout session');
  return res.json();
} 