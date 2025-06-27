import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, currentUser } from '@/lib/auth/clerk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireAuth();
    const user = await currentUser();
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.status(200).json({
      id: user.id,
      name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
      email: user.emailAddresses?.[0]?.emailAddress || '',
      profession: user.publicMetadata?.profession || '',
      imageUrl: user.imageUrl || '',
    });
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
  }
} 
