"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sparkles, Send, Wand2, FileText, Target, Lightbulb, CheckCircle, Clock } from "lucide-react"

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  resumeData: any
  onUpdateResume: (data: any) => void
}

export function AISidebar({ isOpen, onClose, resumeData, onUpdateResume }: AISidebarProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    {
      id: "1",
      type: "improvement",
      title: "Enhance your summary",
      description: "Your professional summary could be more impactful with specific achievements.",
      action: "Improve Summary",
      status: "pending",
    },
    {
      id: "2",
      type: "missing",
      title: "Add skills section",
      description: "Consider adding more technical skills relevant to your field.",
      action: "Add Skills",
      status: "pending",
    },
    {
      id: "3",
      type: "grammar",
      title: "Grammar improvements",
      description: "Found 2 minor grammar issues in your experience section.",
      action: "Fix Grammar",
      status: "completed",
    },
  ])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    // Simulate AI response
    setTimeout(() => {
      setMessage("")
      setIsLoading(false)
    }, 2000)
  }

  const applySuggestion = (suggestionId: string) => {
    setSuggestions(suggestions.map((s) => (s.id === suggestionId ? { ...s, status: "completed" } : s)))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>Get AI-powered suggestions to improve your resume</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Quick Actions */}
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Wand2 className="w-3 h-3 mr-1" />
                Rewrite Section
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                Improve Impact
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Add Section
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Get Ideas
              </Button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">AI Suggestions</h3>
            </div>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pb-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                        <Badge
                          variant={suggestion.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {suggestion.status === "completed" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {suggestion.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      {suggestion.status === "pending" && (
                        <Button size="sm" className="w-full" onClick={() => applySuggestion(suggestion.id)}>
                          {suggestion.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask AI to improve your resume..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="sm" onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 