"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserButton } from "@/components/mock-auth"
import {
  FileText,
  Save,
  Download,
  Sparkles,
  Palette,
} from "lucide-react"
import Link from "next/link"

interface EditorHeaderProps {
  title: string;
  isPublic: boolean;
  onTitleChange: (title: string) => void;
  onTemplateClick: () => void;
  onAIClick: () => void;
  onSaveClick: () => void;
  onExportClick: () => void;
}

export function EditorHeader({
  title,
  isPublic,
  onTitleChange,
  onTemplateClick,
  onAIClick,
  onSaveClick,
  onExportClick,
}: EditorHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NexCV</span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-lg font-semibold border-0 bg-transparent px-0 focus-visible:ring-0"
            />
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onTemplateClick}>
            <Palette className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={onAIClick}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveClick}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={onExportClick}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
} 