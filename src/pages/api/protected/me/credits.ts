import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type ResponseData = { credits: number } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const backendUrl = 'http://localhost:5000/api/protected/me/credits';

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId,
      },
    });

    if (!backendRes.ok) {
      const msg = await backendRes.text();
      throw new Error(`Backend error ${backendRes.status}: ${msg}`);
    }

    const { credits } = await backendRes.json();
    return res.status(200).json({ credits });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
