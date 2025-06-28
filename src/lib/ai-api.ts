// AI API utility for backend at http://localhost:5000/api/ai/
"use client"

import { ResumeData } from '@/types/resume';

export function getAuthHeader(userId?: string): Record<string, string> {
  if (!userId) throw new Error('No userId available for AI API request');
  return { 'x-clerk-user-id': userId };
}

export async function chatWithAI({ message, conversationId, resume, userId }: {
  message: string,
  conversationId?: string,
  resume?: ResumeData,
  userId?: string
}) {
  const userIdLog = getAuthHeader(userId)['x-clerk-user-id'];
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(userId)
  };
  console.log('[AI API] POST /chat', { userId: userIdLog, conversationId });
  const res = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversationId, resume, userId })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('[AI API] /chat error:', errText);
    throw new Error(errText);
  }
  return res.json();
}

export async function enhanceResumeWithAI({ resume, userId }: {
  resume: ResumeData,
  userId?: string
}) {
  const userIdLog = getAuthHeader(userId)['x-clerk-user-id'];
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(userId)
  };
  console.log('[AI API] POST /enhance-resume', { userId: userIdLog });
  console.log('[AI API] Original resume data:', resume);
  
  const res = await fetch('http://localhost:5000/api/ai/enhance-resume', {
    method: 'POST',
    headers,
    body: JSON.stringify({ resume, userId })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('[AI API] /enhance-resume error:', errText);
    throw new Error(errText);
  }
  const response = await res.json();
  console.log('[AI API] Raw backend response:', response);
  
  // Handle the backend response format
  if (response.enhanceResume) {
    // Backend returns enhanceResume as a JSON string, parse it
    try {
      const enhancedData = JSON.parse(response.enhanceResume);
      console.log('[AI API] Parsed enhanceResume JSON:', enhancedData);
      
      // The backend returns the enhanced data nested under 'data' property
      // We need to merge the enhanced data with the original resume structure
      let finalEnhancedData;
      
      if (enhancedData.data) {
        // If there's a nested data property, merge it with the original resume
        finalEnhancedData = {
          ...enhancedData,
          ...enhancedData.data, // Spread the enhanced data over the original structure
          data: undefined // Remove the nested data property
        };
        console.log('[AI API] Merged enhanced data with original structure:', finalEnhancedData);
      } else {
        // If no nested data property, use the enhanced data directly
        finalEnhancedData = enhancedData;
      }
      
      // Clean up any malformed JSON strings in custom sections
      if (finalEnhancedData.customSections) {
        finalEnhancedData.customSections = finalEnhancedData.customSections.map((section: { value: unknown; [key: string]: unknown }) => {
          if (section.value && Array.isArray(section.value)) {
            section.value = section.value.map((item: { description?: string; [key: string]: unknown }) => {
              if (item.description && typeof item.description === 'string' && item.description.includes('`json')) {
                // Remove the malformed JSON wrapper
                const cleanDescription = item.description.replace(/`json\s*\{[^}]*\}\s*`\.?/g, '').trim();
                return { ...item, description: cleanDescription };
              }
              return item;
            });
          }
          return section;
        });
      }
      
      console.log('[AI API] Final cleaned enhanced data:', finalEnhancedData);
      
      return {
        enhanced: finalEnhancedData,
        cached: response.cached || false,
        source: response.source || 'ai_generated'
      };
    } catch (error) {
      console.error('[AI API] Failed to parse enhanceResume JSON:', error);
      throw new Error('Invalid enhanced resume data format');
    }
  }
  
  // Return the response as-is if it doesn't have enhanceResume
  console.log('[AI API] No enhanceResume in response, returning as-is:', response);
  return response;
}

export async function getAIConversation({ conversationId, userId }: {
  conversationId: string,
  userId?: string
}) {
  const headers = getAuthHeader(userId);
  console.log('[AI API] GET /conversation', { userId: headers['x-clerk-user-id'], conversationId });
  const res = await fetch(`http://localhost:5000/api/ai/conversation/${conversationId}`, {
    headers
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('[AI API] /conversation error:', errText);
    throw new Error(errText);
  }
  return res.json();
}

export async function getAICacheStats(userId?: string) {
  const headers = getAuthHeader(userId);
  console.log('[AI API] GET /cache/stats', { userId: headers['x-clerk-user-id'] });
  const res = await fetch('http://localhost:5000/api/ai/cache/stats', {
    headers
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('[AI API] /cache/stats error:', errText);
    throw new Error(errText);
  }
  return res.json();
}

export async function testAINormalization({ prompt }: { prompt: string }) {
  console.log('[AI API] POST /test-normalization');
  const res = await fetch('http://localhost:5000/api/ai/test-normalization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('[AI API] /test-normalization error:', errText);
    throw new Error(errText);
  }
  return res.json();
} 