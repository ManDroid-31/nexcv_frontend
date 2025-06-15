"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthProvider } from "@/components/mock-auth"
import {
  Eye,
  Code,
  FormInput,
  Plus,
  Trash2,
} from "lucide-react"
import { ResumePreview } from "@/components/resume-preview"
import { AISidebar } from "@/components/ai-sidebar"
import { TemplateSelector } from "@/components/template-selector"
import { ExportModal } from "@/components/export-modal"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { EditorHeader } from "@/components/editor-header"
import dynamic from 'next/dynamic'
import { toast } from "sonner"
import * as monaco from 'monaco-editor'

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

interface ResumeData extends Record<string, unknown> {
  title: string;
  slug: string;
  isPublic: boolean;
  template: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: string[];
}

// Define the sections and their order
const RESUME_SECTIONS = [
  { key: 'personalInfo', label: 'Personal Information' },
  { key: 'summary', label: 'Professional Summary' },
  { key: 'experience', label: 'Work Experience' },
  { key: 'education', label: 'Education' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
] as const;

export default function ResumeEditor() {
  const [editMode, setEditMode] = useState<"form" | "json" | "paged-form">("form")
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "Software Engineer Resume",
    slug: "software-engineer-resume",
    isPublic: true,
    template: "modern",
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "johndoe.dev",
    },
    summary: "Experienced software engineer with 5+ years building scalable web applications.",
    experience: [
      {
        id: "1",
        company: "Tech Corp",
        position: "Senior Software Engineer",
        startDate: "2022-01",
        endDate: "Present",
        description: "Led development of microservices architecture serving 1M+ users.",
      },
    ],
    education: [
      {
        id: "1",
        school: "University of Technology",
        degree: "Bachelor of Computer Science",
        startDate: "2016-09",
        endDate: "2020-05",
      },
    ],
    projects: [
      {
        id: "1",
        name: "E-commerce Platform",
        description: "Built a scalable e-commerce platform using Next.js and Node.js",
        technologies: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
        url: "https://example.com/project",
        startDate: "2023-01",
        endDate: "2023-06"
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  })
  const [isDragging, setIsDragging] = useState(false)
  const [editorWidth, setEditorWidth] = useState(50) // percentage
  const containerRef = useRef<HTMLDivElement>(null)
  const minWidth = 30 // minimum width percentage for each panel

  const totalPages = RESUME_SECTIONS.length

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking near the left edge of the preview panel
    const previewPanel = e.currentTarget as HTMLElement
    const rect = previewPanel.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    
    // If click is within 20px of the left edge, start dragging
    if (clickX <= 20) {
      setIsDragging(true)
      e.preventDefault()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Ensure the width stays within bounds
      if (newWidth >= minWidth && newWidth <= 100 - minWidth) {
        setEditorWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const renderFormField = (key: string, value: unknown) => {
    if (typeof value === 'string') {
      return (
        <div className="space-y-4">
          <Textarea
            value={value}
            onChange={(e) => setResumeData({ ...resumeData, [key]: e.target.value })}
            rows={4}
            placeholder={`Enter your ${key}...`}
          />
          <Button
            variant="outline"
            onClick={() => {
              setResumeData({ ...resumeData, [key]: '' });
            }}
            className="cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-4">
          {value.map((item, itemIndex) => (
            <div key={itemIndex} className="border rounded-lg p-4 space-y-3">
              {typeof item === 'string' ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1 cursor-pointer"
                      onClick={() => {
                        const newValue = [...value];
                        newValue.splice(itemIndex, 1);
                        setResumeData({ ...resumeData, [key]: newValue });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                </div>
              ) : (
                <div className="space-y-4">
                  {key === 'projects' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>ID</Label>
                          <Input
                            value={item.id}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, name: e.target.value };
                              setResumeData({ ...resumeData, [key]: newValue });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>URL (optional)</Label>
                        <Input
                          value={item.url || ''}
                          onChange={(e) => {
                            const newValue = [...value];
                            newValue[itemIndex] = { ...item, url: e.target.value };
                            setResumeData({ ...resumeData, [key]: newValue });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newValue = [...value];
                            newValue[itemIndex] = { ...item, description: e.target.value };
                            setResumeData({ ...resumeData, [key]: newValue });
                          }}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Start Date (optional)</Label>
                          <Input
                            type="month"
                            value={item.startDate || ''}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, startDate: e.target.value };
                              setResumeData({ ...resumeData, [key]: newValue });
                            }}
                          />
                        </div>
                        <div>
                          <Label>End Date (optional)</Label>
                          <Input
                            type="month"
                            value={item.endDate || ''}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, endDate: e.target.value };
                              setResumeData({ ...resumeData, [key]: newValue });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Technologies</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                              {tech}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto p-0 ml-1 cursor-pointer"
                                onClick={() => {
                                  const newValue = [...value];
                                  newValue[itemIndex] = {
                                    ...item,
                                    technologies: item.technologies.filter((_: string, i: number) => i !== techIndex)
                                  };
                                  setResumeData({ ...resumeData, [key]: newValue });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Input 
                          className="mt-2"
                          placeholder="Add technology and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              const newValue = [...value];
                              newValue[itemIndex] = {
                                ...item,
                                technologies: [...item.technologies, e.currentTarget.value]
                              };
                              setResumeData({ ...resumeData, [key]: newValue });
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(item).map(([itemKey, itemValue]) => (
                        <div key={itemKey}>
                          <Label>{itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}</Label>
                          <Input
                            value={itemValue as string}
                            disabled={itemKey === 'id'}
                            className={itemKey === 'id' ? 'bg-gray-100' : ''}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, [itemKey]: e.target.value };
                              setResumeData({ ...resumeData, [key]: newValue });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        const newValue = [...value];
                        newValue.splice(itemIndex, 1);
                        setResumeData({ ...resumeData, [key]: newValue });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {typeof value[0] === 'string' ? (
            <Input 
              placeholder={`Add ${key.slice(0, -1)} and press Enter`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setResumeData({
                    ...resumeData,
                    [key]: [...value, e.currentTarget.value]
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
          ) : (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                const newValue = [...value];
                if (key === 'projects') {
                  newValue.push({
                    id: Date.now().toString(),
                    name: '',
                    description: '',
                    technologies: [],
                  });
                } else if (key === 'experience') {
                  newValue.push({
                    id: Date.now().toString(),
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                  });
                } else if (key === 'education') {
                  newValue.push({
                    id: Date.now().toString(),
                    school: '',
                    degree: '',
                    startDate: '',
                    endDate: '',
                  });
                } else {
                  newValue.push({});
                }
                setResumeData({ ...resumeData, [key]: newValue });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {key.slice(0, -1)}
            </Button>
          )}
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey}>
                <Label>{subKey.charAt(0).toUpperCase() + subKey.slice(1)}</Label>
                <Input
                  value={subValue as string}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    [key]: { ...value, [subKey]: e.target.value }
                  })}
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setResumeData({ ...resumeData, [key]: {} });
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        </div>
      )
    }

    return null;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <EditorHeader
          title={resumeData.title}
          isPublic={resumeData.isPublic}
          onTitleChange={(title) => setResumeData({ ...resumeData, title })}
          onTemplateClick={() => setIsTemplateModalOpen(true)}
          onAIClick={() => setIsAISidebarOpen(true)}
          onSaveClick={() => {/* TODO: Implement save functionality */}}
          onExportClick={() => setIsExportModalOpen(true)}
        />

        <div 
          ref={containerRef}
          className="flex h-[calc(100vh-73px)] relative"
        >
          {/* Left Panel - Form/JSON Editor */}
          <div 
            className="border-r bg-white overflow-y-auto"
            style={{ width: `${editorWidth}%` }}
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resume Editor</h2>
                <Tabs value={editMode} onValueChange={(value) => setEditMode(value as "form" | "json" | "paged-form")}>
                  <TabsList>
                    <TabsTrigger value="form" className="cursor-pointer">
                      <FormInput className="w-4 h-4 mr-2" />
                      Form Mode
                    </TabsTrigger>
                    <TabsTrigger value="paged-form" className="cursor-pointer">
                      <Code className="w-4 h-4 mr-2" />
                      Paged Form Mode
                    </TabsTrigger>
                    <TabsTrigger value="json" className="cursor-pointer">
                      <Code className="w-4 h-4 mr-2" />
                      JSON Mode
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {editMode === "form" || editMode === "paged-form" ? (
                <div className="space-y-6">
                  {/* Pagination */}
                  {editMode === "paged-form" && (
                    <div className="flex items-center justify-between mb-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              isActive={currentPage > 1}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              isActive={currentPage < totalPages}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      <div className="text-sm text-gray-500">
                        {RESUME_SECTIONS[currentPage - 1]?.label}
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  {editMode === "form" ? (
                    <>
                      {/* Existing Sections */}
                      {Object.entries(resumeData).map(([key, value]) => {
                        // Skip these fields as they're handled separately
                        if (['title', 'slug', 'isPublic', 'template'].includes(key)) return null;
                        
                        return (
                          <Card key={key}>
                            <CardHeader>
                              <CardTitle>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderFormField(key, value)}
                            </CardContent>
                          </Card>
                        );
                      })}

                      {/* Add New Section Button */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Add New Section</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Section Name</Label>
                                <Input
                                  placeholder="e.g., Certifications"
                                  id="new-section-name"
                                />
                              </div>
                              <div>
                                <Label>Section Type</Label>
                                <select
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 cursor-pointer"
                                  id="new-section-type"
                                >
                                  <option value="string">Text</option>
                                  <option value="array">List</option>
                                  <option value="object">Key-Value Pairs</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                const nameInput = document.getElementById('new-section-name') as HTMLInputElement;
                                const typeInput = document.getElementById('new-section-type') as HTMLSelectElement;
                                const sectionName = nameInput.value.trim().toLowerCase().replace(/\s+/g, '');
                                const sectionType = typeInput.value;

                                if (!sectionName) return;

                                let initialValue: unknown;
                                switch (sectionType) {
                                  case 'string':
                                    initialValue = '';
                                    break;
                                  case 'array':
                                    initialValue = [];
                                    break;
                                  case 'object':
                                    initialValue = {};
                                    break;
                                  default:
                                    return;
                                }

                                setResumeData({
                                  ...resumeData,
                                  [sectionName]: initialValue
                                });

                                // Reset inputs
                                nameInput.value = '';
                                typeInput.value = 'string';
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Section
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    // Paged Form Mode
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {RESUME_SECTIONS[currentPage - 1]?.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {renderFormField(RESUME_SECTIONS[currentPage - 1]?.key, resumeData[RESUME_SECTIONS[currentPage - 1]?.key])}
                        </CardContent>
                      </Card>

                      {/* Add New Section Button in Paged Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Add New Section</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Section Name</Label>
                                <Input
                                  placeholder="e.g., Certifications"
                                  id="new-section-name-paged"
                                />
                              </div>
                              <div>
                                <Label>Section Type</Label>
                                <select
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 cursor-pointer"
                                  id="new-section-type-paged"
                                >
                                  <option value="string">Text</option>
                                  <option value="array">List</option>
                                  <option value="object">Key-Value Pairs</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                const nameInput = document.getElementById('new-section-name-paged') as HTMLInputElement;
                                const typeInput = document.getElementById('new-section-type-paged') as HTMLSelectElement;
                                const sectionName = nameInput.value.trim().toLowerCase().replace(/\s+/g, '');
                                const sectionType = typeInput.value;

                                if (!sectionName) return;

                                let initialValue: unknown;
                                switch (sectionType) {
                                  case 'string':
                                    initialValue = '';
                                    break;
                                  case 'array':
                                    initialValue = [];
                                    break;
                                  case 'object':
                                    initialValue = {};
                                    break;
                                  default:
                                    return;
                                }

                                setResumeData({
                                  ...resumeData,
                                  [sectionName]: initialValue
                                });

                                // Reset inputs
                                nameInput.value = '';
                                typeInput.value = 'string';
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Section
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="json-editor">Resume JSON</Label>
                    <div className="text-sm text-gray-500">
                      Press Ctrl+S to validate JSON
                    </div>
                  </div>
                  <MonacoEditor
                    height="600px"
                    defaultLanguage="json"
                    value={JSON.stringify(resumeData, null, 2)}
                    onChange={(value: string | undefined) => {
                      if (value) {
                        try {
                          const parsed = JSON.parse(value);
                          setResumeData(parsed);
                          toast.success("JSON is valid");
                        } catch {
                          // Don't update state if JSON is invalid
                          toast.error("Invalid JSON format");
                        }
                      }
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                    onMount={(editor) => {
                      // Add Ctrl+S handler
                      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                        try {
                          const value = editor.getValue();
                          JSON.parse(value);
                          toast.success("JSON is valid");
                        } catch {
                          toast.error("Invalid JSON format");
                        }
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview with Drag Area */}
          <div 
            className="bg-gray-100 relative"
            style={{ width: `${100 - editorWidth}%` }}
            onMouseDown={handleMouseDown}
          >
            {/* Visual Drag Indicator */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors ${
                isDragging ? 'bg-blue-500' : ''
              }`}
            />
            
            {/* Preview Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Preview</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="h-[calc(100%-57px)]">
              <ResumePreview data={resumeData} template={resumeData.template} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <AISidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          resumeData={resumeData}
          onUpdateResume={setResumeData}
        />

        <TemplateSelector
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplate={resumeData.template}
          onSelectTemplate={(template) => {
            setResumeData({ ...resumeData, template })
            setIsTemplateModalOpen(false)
          }}
        />

        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} resumeData={resumeData} />
      </div>
    </AuthProvider>
  )
} 