import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-clerk-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }

  const { credits } = req.body;
  if (!credits || typeof credits !== 'number') {
    return res.status(400).json({ error: 'Invalid credits value' });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/credits/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId as string,
      },
      body: JSON.stringify({ credits }),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return res.status(backendRes.status).json({
        error: errorData.error || 'Failed to create checkout session from backend',
      });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating checkout session from backend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 