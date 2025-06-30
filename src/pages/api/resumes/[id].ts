import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type ResponseData = Record<string, unknown> | { error: string };

// Available templates with their default layouts - using actual template names from components
const AVAILABLE_TEMPLATES = {
  onyx: {
    name: 'Onyx',
    description: 'Clean and professional black theme with elegant typography',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  pikachu: {
    name: 'Pikachu',
    description: 'Energetic yellow-orange gradient with card-based sections',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  gengar: {
    name: 'Gengar',
    description: 'Dark purple theme with modern styling',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  kakuna: {
    name: 'Kakuna',
    description: 'Minimalist design with clean lines and subtle styling',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  azurill: {
    name: 'Azurill',
    description: 'Blue-themed modern design with professional layout',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  chikorita: {
    name: 'Chikorita',
    description: 'Green-themed academic style with structured layout',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  leafish: {
    name: 'Leafish',
    description: 'Fresh green design with natural styling',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  ditto: {
    name: 'Ditto',
    description: 'Adaptive design that adapts to content',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  bronzor: {
    name: 'Bronzor',
    description: 'Bronze-themed executive style with professional layout',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  rhyhorn: {
    name: 'Rhyhorn',
    description: 'Strong and bold design with powerful styling',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  nosepass: {
    name: 'Nosepass',
    description: 'Stable and reliable design with steady layout',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  },
  glalie: {
    name: 'Glalie',
    description: 'Cool and sleek design with modern styling',
    layout: {
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
      scale: 1,
    }
  }
};

function isValidObjectId(id: string | string[] | undefined): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { id } = req.query;
    // Only allow unauthenticated access for GET /api/resumes/[id] (not 'all')
    if (!id || id === 'all') {
      // ... existing logic for 'all' resumes, requires auth ...
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      const backendUrl = `${process.env.BACKEND_URL}/api/resumes`;
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
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate resume ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid resume ID format' });
    }

    const backendUrl = `${process.env.BACKEND_URL}/api/resumes/${id}`;

    if (req.method === 'GET') {
      // Try to get userId, but allow missing userId for public resumes
      const { userId } = getAuth(req);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-clerk-user-id'] = userId;
      const backendRes = await fetch(backendUrl, {
        method: 'GET',
        headers,
      });
      if (!backendRes.ok) {
        const errorText = await backendRes.text();
        console.error(`Backend error ${backendRes.status}:`, errorText);
        return res.status(backendRes.status).json({ 
          error: `Backend error: ${backendRes.status} ${backendRes.statusText}` 
        });
      }
      const data = await backendRes.json();
      // If resume is public, allow access without auth
      if (
        data.visibility === 'public' ||
        data.isPublic === true ||
        (data.data && data.data.isPublic === true)
      ) {
        return res.status(200).json(data);
      }
      // If not public, require auth
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Resume is not public' });
      }
      // Otherwise, return the resume (user is authenticated)
      return res.status(200).json(data);
    }

    // For PUT requests (update resume)
    if (req.method === 'PUT') {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      const { title, template, visibility, ...resumeData } = req.body;

      // Get template info and default layout if template is being updated
      let templateInfo = null;
      if (template) {
        templateInfo = AVAILABLE_TEMPLATES[template as keyof typeof AVAILABLE_TEMPLATES] || AVAILABLE_TEMPLATES.onyx;
      }

      // Transform the data to match backend expectations
      const backendPayload = {
        title,
        template,
        visibility,
        data: {
          ...resumeData,
          // Include template information and default layout if template is being updated
          ...(templateInfo && { templateInfo }),
          availableTemplates: AVAILABLE_TEMPLATES,
          layout: resumeData.layout || (templateInfo?.layout || resumeData.layout),
        },
      };

      const backendRes = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-user-id': userId,
        },
        body: JSON.stringify(backendPayload),
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

    // For DELETE requests (delete resume)
    if (req.method === 'DELETE') {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      const backendRes = await fetch(backendUrl, {
        method: 'DELETE',
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

      return res.status(backendRes.status).json({ message: 'Resume deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 