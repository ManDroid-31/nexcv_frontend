import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-clerk-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/credits/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId as string,
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return res.status(backendRes.status).json({
        error: errorData.error || 'Failed to fetch history from backend',
      });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching history from backend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 