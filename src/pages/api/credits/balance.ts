import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/credits/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId as string,
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return res.status(backendRes.status).json({
        error: errorData.error || 'Failed to fetch balance from backend',
      });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching balance from backend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 