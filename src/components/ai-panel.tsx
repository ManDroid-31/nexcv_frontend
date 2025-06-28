"use client"

import type React from "react"
import { useState, useRef, useLayoutEffect, useMemo } from "react"
import { Send, Sparkles, Bot, ChevronUp, ChevronDown, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAIStore } from '@/stores/ai-store';
import { useResumeStore } from '@/stores/resume-store';
import { useUser} from "@clerk/nextjs"
import ReactMarkdown from 'react-markdown';
import { ResumeData } from '@/types/resume';
import { toast } from 'sonner';

interface AIPanelProps {
  onApplyEnhanced?: (enhancedResume: ResumeData) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onApplyEnhanced }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [input, setInput] = useState('')
  const { user } = useUser();
  const userId = user?.id
  const resumeData = useResumeStore(state => state.resumeData); 
  const setResumeData = useResumeStore(state => state.setResumeData);

  // Zustand AI store
  const {
    chatHistory,
    enhancedResume,
    isLoading,
    error,
    sendMessage,
    enhanceResume,
  } = useAIStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic width based on content
  const getDynamicWidth = useMemo(() => {
    const baseWidth = 42; // 42rem base width
    const maxWidth = 80; // 80rem maximum width
    
    // Check if there are long AI responses
    const hasLongResponses = chatHistory.some(msg => 
      msg.role === 'assistant' && msg.content.length > 500
    );
    
    // Check if there are code blocks or complex content
    const hasComplexContent = chatHistory.some(msg => 
      msg.role === 'assistant' && (
        msg.content.includes('```') || 
        msg.content.includes('`') ||
        msg.content.length > 800
      )
    );
    
    if (hasComplexContent) {
      return Math.min(maxWidth, baseWidth + 20); // Add 20rem for complex content
    } else if (hasLongResponses) {
      return Math.min(maxWidth, baseWidth + 10); // Add 10rem for long responses
    }
    
    return baseWidth;
  }, [chatHistory]);

  // Auto-scroll to bottom on new message
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    console.log("sending message to ai")
    if (!input.trim()) return;
    await sendMessage({ message: input, userId, resume: resumeData });
    setInput('');
  };

  const handleEnhance = async () => {
    await enhanceResume({ resume: resumeData, userId });
  };

  const handleApplyEnhanced = () => {
    console.log('[AI Panel] Applying enhanced resume:', enhancedResume);
    
    if (onApplyEnhanced && enhancedResume) {
      // Use the callback if provided
      console.log('[AI Panel] Using callback to apply enhanced resume');
      onApplyEnhanced(enhancedResume);
    } else if (enhancedResume) {
      // Fallback to direct setResumeData
      console.log('[AI Panel] Using direct setResumeData to apply enhanced resume');
      setResumeData(enhancedResume);
    }
    
    // Show success message with details about what was enhanced
    const enhancements = [];
    if (enhancedResume?.summary) {
      enhancements.push("Professional Summary");
    }
    if (enhancedResume?.skills && enhancedResume.skills.length > 0) {
      enhancements.push("Skills List");
    }
    if (enhancedResume?.enhancedExperience) {
      enhancements.push("Experience Descriptions");
    }
    
    const enhancementText = enhancements.length > 0 
      ? `Enhanced: ${enhancements.join(", ")}`
      : "Enhanced resume applied!";
    
    console.log('[AI Panel] Enhancement details:', { enhancements, enhancementText });
    toast.success(`${enhancementText} Review the changes in the editor.`);
  };

  // Calculate panel height based on state
  const getPanelHeight = () => {
    if (isMaximized) return "85vh"
    if (isHovered) return "580px"
    return "320px" // Increased min height
  }

  const getPanelTransformY = () => {
    if (isMaximized) return "0"
    if (isHovered) return "0"
    return "calc(100% - 100px)"
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-0 left-1/2 z-50"
      style={{
        width: "100%",
        maxWidth: `${getDynamicWidth}rem`,
        height: getPanelHeight(),
        transform: `translate(-50%, ${getPanelTransformY()})`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="relative w-full h-full bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with drag handle and maximize button */}
        <div className="relative w-full h-16 flex items-center justify-between px-6 bg-gradient-to-r from-background/80 to-muted/20 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-foreground">AI Assistant</span>
            {/* You can add more badges/info here */}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            <Button
              onClick={() => setIsMaximized(!isMaximized)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-muted/50 rounded-lg transition-all duration-200"
            >
              {isMaximized ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-6 space-y-6">
            {/* AI Header CTA */}
            <div className="space-y-3">
              <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 group" onClick={handleEnhance} disabled={isLoading}>
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Improve Entire Resume with AI
              </Button>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Let our AI analyze and enhance your entire resume for maximum impact
              </p>
            </div>

            {/* Enhanced Resume Section */}
            {enhancedResume && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Resume Enhanced Successfully!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      AI has improved your resume content
                    </p>
                    {/* Show what was enhanced */}
                    <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                      <div className="flex flex-wrap gap-2">
                        {enhancedResume.summary && (
                          <span className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">Summary</span>
                        )}
                        {enhancedResume.skills && enhancedResume.skills.length > 0 && (
                          <span className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">Skills ({enhancedResume.skills.length})</span>
                        )}
                        {enhancedResume.experience && enhancedResume.experience.length > 0 && (
                          <span className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">Experience</span>
                        )}
                        {enhancedResume.enhancedExperience && (
                          <span className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">Enhanced Experience</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyEnhanced}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            )}

            <Separator />
            {/* Chat Interface */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Chat with AI Assistant</span>
              </div>
              {/* Chat Messages */}
              <div 
                ref={scrollRef} 
                className="space-y-3 min-h-[220px] max-h-[480px] overflow-y-auto pr-2"
                style={{ 
                  scrollBehavior: 'smooth',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div 
                      className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted/50 text-muted-foreground rounded-tl-none'
                      }`}
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown 
                          components={{
                            code: ({ className, children, ...props }) => (
                              <code className={`bg-muted px-1 py-0.5 rounded text-xs ${className || ''}`} {...props}>
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">
                                {children}
                              </pre>
                            ),
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.content}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat Input */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="h-10 text-sm border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                    placeholder="Ask me anything about your resume..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="h-10 px-4 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              {error && <div className="text-red-500 text-xs mt-2 break-words">{error}</div>}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
