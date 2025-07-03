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

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/ai/chat`;
    console.log('[Chat API] Sending request to backend:', backendUrl);
    
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
    console.log('[Chat API] Backend response:', data);

    // Transform the response format
    const transformedResponse = {
      message: data.response, // Map 'response' to 'message'
      conversationId: data.conversationId,
      contextUsed: data.contextUsed
    };

    console.log('[Chat API] Transformed response:', transformedResponse);
    return res.status(200).json(transformedResponse);
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return res.status(500).json({ 
      error: 'AI service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 