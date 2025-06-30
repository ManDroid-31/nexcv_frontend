"use client"

import { create } from 'zustand';
import { chatWithAI, enhanceResumeWithAI, getAIConversation } from '@/lib/ai-api';
import { toast } from 'sonner';
import type { ResumeData } from '@/types/resume';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIState {
  conversationId?: string;
  chatHistory: AIMessage[];
  aiResponse?: string;
  enhancedResume?: ResumeData;
  isLoading: boolean;
  error?: string;
  // Async actions
  sendMessage: (args: { message: string; resume?: ResumeData; userId?: string }) => Promise<void>;
  enhanceResume: (args: { resume: ResumeData; userId?: string }) => Promise<void>;
  applyEnhancedResume: (onApply: (enhancedResume: ResumeData) => void) => void;
  fetchConversation: (args: { conversationId: string; userId?: string }) => Promise<void>;
  reset: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  conversationId: undefined,
  chatHistory: [],
  aiResponse: undefined,
  enhancedResume: undefined,
  isLoading: false,
  error: undefined,

  async sendMessage({ message, resume, userId }) {
    set({ isLoading: true, error: undefined });
    try {
      const response = await chatWithAI({ message, resume, userId });
      console.log('[AI Store] Chat response:', response);
      
      // Add messages to chat history
      set(state => ({
        chatHistory: [
          ...state.chatHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: response.message }
        ],
        conversationId: response.conversationId,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'AI chat failed';
      console.error('[AI Store] Error:', errorMessage);
      
      // Still add the user message even if AI response fails
      set(state => ({
        chatHistory: [
          ...state.chatHistory,
          { role: 'user', content: message }
        ],
        error: errorMessage,
        isLoading: false
      }));
      
      toast.error('Failed to get AI response');
    }
  },

  async enhanceResume({ resume, userId }) {
    set({ isLoading: true, error: undefined });
    try {
      console.log('[AI Store] Starting resume enhancement...');
      const response = await enhanceResumeWithAI({ resume, userId });
      console.log('[AI Store] Enhancement response:', response);
      
      // The API now returns { enhanced, cached, source }
      const enhancedResume = response.enhanced;
      console.log('[AI Store] Enhanced resume data:', enhancedResume);
      
      set({
        enhancedResume,
        isLoading: false,
        error: undefined,
      });
      
      const cacheMessage = response.cached ? ' (using cached result)' : ' (fresh AI generation)';
      toast.success(`Resume enhanced successfully${cacheMessage}`);
    } catch (err: unknown) {
      console.error('[AI Store] Enhancement error:', err);
      const errorMessage = err instanceof Error ? err.message : 'AI enhancement failed';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  applyEnhancedResume(onApply) {
    const { enhancedResume } = get();
    if (enhancedResume) {
      onApply(enhancedResume);
    }
  },

  async fetchConversation({ conversationId, userId }) {
    set({ isLoading: true, error: undefined });
    try {
      const { conversation } = await getAIConversation({ conversationId, userId });
      set({
        chatHistory: conversation.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        conversationId,
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversation';
      set({ error: errorMessage, isLoading: false });
    }
  },

  reset() {
    set({
      conversationId: undefined,
      chatHistory: [],
      aiResponse: undefined,
      enhancedResume: undefined,
      isLoading: false,
      error: undefined,
    });
  },
})); 