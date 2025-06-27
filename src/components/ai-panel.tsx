"use client"

import type React from "react"
import { useState } from "react"
import { Target, Lightbulb, CheckCircle, Clock, Send, Sparkles, Bot, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface AISuggestion {
  id: string
  type: string
  title: string
  description: string
  action: string
  status: string
}

interface AIPanelProps {
  setAIDrawerHovered: (open: boolean) => void
  aiMessage: string
  setAIMessage: (msg: string) => void
  aiIsLoading: boolean
  aiSuggestions: AISuggestion[]
  applyAISuggestion: (id: string) => void
  handleAISendMessage: () => void
}

export const AIPanel: React.FC<AIPanelProps> = ({
  setAIDrawerHovered,
  aiMessage,
  setAIMessage,
  aiIsLoading,
  aiSuggestions,
  applyAISuggestion,
  handleAISendMessage,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    setAIDrawerHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setAIDrawerHovered(false)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  // Calculate panel height based on state
  const getPanelHeight = () => {
    if (isMaximized) return "85vh"
    if (isHovered) return "580px"
    return "116px" // 20% of 580px
  }

  const getPanelTransform = () => {
    if (isMaximized) return "translateY(0)"
    if (isHovered) return "translateY(0)"
    return "translateY(calc(100% - 116px))"
  }

  const getPanelTransformY = () => {
    if (isMaximized) return "0"
    if (isHovered) return "0"
    return "calc(100% - 116px)"
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-0 left-1/2 z-50"
      style={{
        width: "100%",
        maxWidth: "42rem",
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
            <Badge variant="secondary" className="text-xs">
              {aiSuggestions.filter((s) => s.status === "pending").length} pending
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />

            {/* Maximize button */}
            <Button
              onClick={toggleMaximize}
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

        {/* Scrollable content */}
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-6 space-y-6">
            {/* AI Header CTA */}
            <div className="space-y-3">
              <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Improve Entire Resume with AI
              </Button>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Let our AI analyze and enhance your entire resume for maximum impact
              </p>
            </div>

            <Separator />

            {/* AI Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
              </div>

              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="border-l-4 border-l-primary/60 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-foreground leading-tight">{suggestion.title}</h4>
                        <Badge
                          variant={suggestion.status === "completed" ? "default" : "secondary"}
                          className="ml-2 text-xs shrink-0"
                        >
                          {suggestion.status === "completed" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {suggestion.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{suggestion.description}</p>
                      {suggestion.status === "pending" && (
                        <Button
                          onClick={() => applyAISuggestion(suggestion.id)}
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 rounded-lg"
                        >
                          {suggestion.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 justify-start text-xs font-medium hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 rounded-lg bg-transparent"
                >
                  <Target className="w-3 h-3 mr-2" />
                  Improve Impact
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 justify-start text-xs font-medium hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 rounded-lg bg-transparent"
                >
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Get Ideas
                </Button>
              </div>
            </div>

            <Separator />

            {/* Chat Interface */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Chat with AI Assistant</span>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 min-h-[120px] max-h-[200px] overflow-y-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-muted/50 px-3 py-2 rounded-lg rounded-tl-none text-sm text-muted-foreground max-w-[80%]">
                    Hi! I&apos;m here to help you create an outstanding resume. What would you like to improve?
                  </div>
                </div>
                {aiMessage && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                      {aiMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAISendMessage()
                }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative">
                  <Input
                    value={aiMessage}
                    onChange={(e) => setAIMessage(e.target.value)}
                    className="h-10 text-sm border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                    placeholder="Ask me anything about your resume..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={aiIsLoading || !aiMessage.trim()}
                  size="sm"
                  className="h-10 px-4 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                >
                  {aiIsLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
