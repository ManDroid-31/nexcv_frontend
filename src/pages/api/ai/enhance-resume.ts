import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type ResponseData = Record<string, unknown> | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const backendUrl = `${process.env.AI_BACKEND_URL || 'http://localhost:5000'}/api/ai/enhance-resume`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId,
      },
      body: JSON.stringify(req.body),
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error(`AI Backend error ${backendRes.status}:`, errorText);
      return res.status(backendRes.status).json({ 
        error: `AI Backend error: ${backendRes.status} ${backendRes.statusText}`,
        details: errorText
      });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 