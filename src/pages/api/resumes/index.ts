import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL;
type ResponseData = Record<string, unknown> | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  console.log('[API] /api/resumes', req.method, req.headers);
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      throw new Error('BACKEND_URL is not set in environment variables');
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // For GET requests (list resumes)
    if (req.method === 'GET') {
      const backendRes = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-user-id': userId,
        },
      });

      if (!backendRes.ok) {
        const errorText = await backendRes.text();
        console.error(`Backend error ${backendRes.status}:`, errorText);
        return res.status(backendRes.status).json({ 
          error: `Backend error: ${backendRes.status} ${backendRes.statusText}` 
        });
      }

      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    }

    // For POST requests (create resume)
    if (req.method === 'POST') {
      try {
        const { userId } = getAuth(req);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        if (!BACKEND_URL) {
          throw new Error('BACKEND_URL is not set in environment variables');
        }
        // Parse and transform the body to match backend expectations
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { title="john doe", template="onyx", isPublic=false, visibility="private", ...rest } = body;
        const backendPayload = {
          title,
          template,
          visibility: typeof visibility === 'string' ? visibility : (isPublic ? 'public' : 'private'),
          data: rest,
        };
        const backendRes = await fetch(`${BACKEND_URL}/api/resumes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': userId,
          },
          body: JSON.stringify(backendPayload),
        });
        if (!backendRes.ok) {
          const errorText = await backendRes.text();
          return res.status(backendRes.status).json({ error: errorText });
        }
        const data = await backendRes.json();
        return res.status(201).json(data);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return res.status(500).json({ error: errorMessage });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 