"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Save, Sparkles, LayoutTemplate } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface EditorHeaderProps {
  title: string
  isPublic: boolean
  onTitleChange: (title: string) => void
  onTemplateClick: () => void
  onAIClick: () => void
  onSaveClick: () => void
  onExportClick: () => void
  saving?: boolean
}

export function EditorHeader({
  title,
  isPublic,
  onTitleChange,
  onTemplateClick,
  onAIClick,
  onSaveClick,
  onExportClick,
  saving = false
}: EditorHeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-[300px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="public"
              checked={isPublic}
              onChange={() => onTitleChange(title)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="public" className="text-sm font-medium">Public</label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onTemplateClick}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={onAIClick}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveClick} disabled={saving}>
            {saving ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 inline-block" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={onExportClick}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
} 