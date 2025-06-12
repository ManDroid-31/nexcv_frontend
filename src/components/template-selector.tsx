"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  currentTemplate: string
  onSelectTemplate: (template: string) => void
}

const templates = [
  {
    id: "modern",
    name: "Modern",
    category: "Professional",
    description: "Clean and contemporary design perfect for tech roles",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Tech", "Minimal", "ATS-Friendly"],
  },
  {
    id: "executive",
    name: "Executive",
    category: "Professional",
    description: "Sophisticated layout for senior positions",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Leadership", "Corporate", "Premium"],
  },
  {
    id: "creative",
    name: "Creative",
    category: "Design",
    description: "Bold and artistic for creative professionals",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Design", "Creative", "Colorful"],
  },
  {
    id: "academic",
    name: "Academic",
    category: "Education",
    description: "Traditional format for academic positions",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Academic", "Research", "Traditional"],
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "Professional",
    description: "Simple and elegant design",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Simple", "Clean", "ATS-Friendly"],
  },
  {
    id: "startup",
    name: "Startup",
    category: "Tech",
    description: "Dynamic layout for startup environments",
    preview: "/placeholder.svg?height=300&width=200",
    tags: ["Startup", "Dynamic", "Modern"],
  },
]

export function TemplateSelector({ isOpen, onClose, currentTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>Select a template that best fits your style and industry</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-3 gap-4 p-1">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentTemplate === template.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={template.preview || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-40 object-cover rounded border"
                    />
                    {currentTemplate === template.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">{template.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Apply Template</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 