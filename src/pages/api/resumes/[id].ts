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
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.query;
    // Only allow unauthenticated access for GET /api/resumes/[id] (not 'all')
    if (!id || id === 'all') {
      // ... existing logic for 'all' resumes, requires auth ...
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
      // Support view param in body or query
      const view = req.body?.view || req.query?.view;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (view === 'publicview') {
        headers['x-resume-view'] = 'publicview';
        // Do NOT send x-clerk-user-id for publicview
      } else {
        if (view === 'ownerview') headers['x-resume-view'] = 'ownerview';
        headers['x-clerk-user-id'] = userId;
      }
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
      return res.status(200).json(data);
    }

    // For PUT requests (update resume)
    if (req.method === 'PUT') {
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