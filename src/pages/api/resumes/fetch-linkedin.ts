import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = Record<string, unknown> | { error: string };

function getAuth(req: NextApiRequest): { userId: string | null } {
  const userId = req.headers['x-clerk-user-id'] as string || null;
  return { userId };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  console.log('[API] /api/resumes/fetch-linkedin', req.method, req.headers);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { linkedinUrl } = req.body;

    if (!linkedinUrl) {
      return res.status(400).json({ error: 'linkedinUrl is required' });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resumes/fetch-linkedin`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId,
      },
      body: JSON.stringify({
        linkedinUrl,
        userId
      }),
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error(`Backend error ${backendRes.status}:`, errorText);
      
      // Handle specific error cases
      if (backendRes.status === 403) {
        return res.status(403).json({ error: 'Not enough credits' });
      }
      
      if (backendRes.status === 400) {
        return res.status(400).json({ error: errorText || 'Invalid LinkedIn URL' });
      }
      
      if (backendRes.status === 502) {
        return res.status(502).json({ error: 'Failed to fetch from LinkedIn' });
      }
      
      return res.status(backendRes.status).json({ 
        error: `Backend error: ${backendRes.status} ${backendRes.statusText}` 
      });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 