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
  Code,
  FormInput,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  GripVertical,
} from "lucide-react"
import { ResumePreview } from "@/components/resume-preview"
import { AISidebar } from "@/components/ai-sidebar"
import { TemplateSelector } from "@/components/template-selector"
import { ExportModal } from "@/components/export-modal"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { EditorHeader } from "@/components/editor-header"
import dynamic from 'next/dynamic'
import { toast } from "sonner"
import { useResumeStore } from '@/stores/resume-store'
import { use } from 'react'
import { CustomSection, KeyValuePair, ArrayObjectItem, CustomSectionValue, ResumeData } from '@/types/resume'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false }
)

type EditMode = "form" | "json" | "paged-form"

interface PageProps {
  params: Promise<{ id: string }>
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

// Define section templates and their display names
const SECTION_TEMPLATES = {
  'string': '',
  'array': [],
  'object': {},
  'array-object': [{
    id: Date.now().toString(),
    title: '',
    description: '',
    date: '',
  }],
  'key-value': [{
    id: Date.now().toString(),
    key: '',
    value: ''
  }]
} as const;

const SECTION_TYPE_OPTIONS = [
  { value: 'string', label: 'Text' },
  { value: 'array', label: 'List' },
  { value: 'object', label: 'Key-Value Pairs' },
  { value: 'array-object', label: 'List of Items' },
  { value: 'key-value', label: 'Key-Value Object' }
] as const;

type SectionType = keyof typeof SECTION_TEMPLATES;

// Add DraggableSection component
function DraggableSection({ 
  id, 
  title, 
  children 
}: { 
  id: string
  title: string
  children: React.ReactNode 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResumeEditor({ params }: PageProps) {
  const { id: resumeId } = use(params)
  const [editMode, setEditMode] = useState<EditMode>("form")
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [editorWidth, setEditorWidth] = useState(50) // percentage
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const minWidth = 30 // minimum width percentage for each panel

  // Use the unified resume store
  const {
    resumeData,
    isLoading,
    error,
    setResumeData,
    updateResumeData,
    setTemplate
  } = useResumeStore()

  const totalPages = RESUME_SECTIONS.length

  // Add section order state
  const [sectionOrder, setSectionOrder] = useState<string[]>([])

  // Initialize section order
  useEffect(() => {
    if (resumeData) {
      const order = Object.keys(resumeData).filter(key => 
        !['title', 'slug', 'isPublic', 'template', 'customSections'].includes(key)
      )
      setSectionOrder(order)
    }
  }, [resumeData])

  // Add DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  const handleSave = async () => {
    if (!resumeData) return
    try {
      // TODO: Implement save functionality
      toast.success('Resume saved successfully')
    } catch {
      toast.error('Failed to save resume')
    }
  }

  const handleAddSection = (sectionName: string, sectionType: string) => {
    if (!sectionName) {
      toast.error('Please enter a section name');
      return;
    }

    const formattedName = sectionName.trim().toLowerCase().replace(/\s+/g, '');
    
    // Check if section already exists
    if (resumeData && resumeData[formattedName] !== undefined) {
      toast.error('Section already exists');
      return;
    }

    // Validate section type
    if (!(sectionType in SECTION_TEMPLATES)) {
      console.log('Invalid type:', sectionType, 'Available types:', Object.keys(SECTION_TEMPLATES));
      toast.error('Invalid section type');
      return;
    }

    // Get template for the section type
    const template = SECTION_TEMPLATES[sectionType as SectionType];
    
    // Create new section with template
    const newSection = JSON.parse(JSON.stringify(template));
    
    // Add to customSections array
    const customSection: CustomSection = {
      id: Date.now().toString(),
      name: sectionName.trim(), // Use trimmed name for display
      type: sectionType as SectionType,
      value: newSection
    };

    if (resumeData) {
      const updatedData = {
        ...resumeData,
        customSections: [...(resumeData.customSections || []), customSection],
        [formattedName]: newSection
      };
      setResumeData(updatedData); // Use setResumeData instead of updateResumeData for full update
      toast.success('New section added successfully');
    }
  };

  // Add a helper function for section updates
  const updateSectionValue = (key: string, newValue: CustomSectionValue, customSection: CustomSection) => {
    if (resumeData) {
      updateResumeData({ [key]: newValue });
      // Update custom section value
      const updatedSections = resumeData.customSections.map(section =>
        section.id === customSection.id
          ? { ...section, value: newValue }
          : section
      );
      updateResumeData({ customSections: updatedSections });
    }
  };

  // Add a helper function for section removal
  const removeSection = (key: string, customSection: CustomSection) => {
    if (resumeData) {
      // Create a new object without the removed section
      const updatedData = {
        ...resumeData,
        customSections: resumeData.customSections.filter(
          section => section.id !== customSection.id
        )
      } as ResumeData;
      delete updatedData[key];
      
      setResumeData(updatedData);
      
      // Update section order
      setSectionOrder(prev => prev.filter(section => section !== key));
      
      toast.success('Section removed successfully');
    }
  };

  const renderFormField = (key: string, value: unknown) => {
    // Find if this is a custom section
    const customSection = resumeData?.customSections?.find(section => 
      section.name.toLowerCase().replace(/\s+/g, '') === key
    );

    const renderSectionHeader = (title: string) => (
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm(`Are you sure you want to remove the "${title}" section?`)) {
              if (customSection) {
                removeSection(key, customSection);
              } else {
                // For standard sections
                const updatedData = { ...resumeData } as ResumeData;
                delete updatedData[key];
                setResumeData(updatedData);
                setSectionOrder(prev => prev.filter(section => section !== key));
                toast.success(`${title} section removed successfully`);
              }
            }
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Section
        </Button>
      </div>
    );

    if (customSection) {
      switch (customSection.type) {
        case 'string':
      return (
            <div className="space-y-4">
              {renderSectionHeader(customSection.name)}
              <Textarea
                value={value as string || ''}
          onChange={(e) => {
                  updateSectionValue(key, e.target.value, customSection);
                }}
                rows={4}
                placeholder={`Enter your ${customSection.name}...`}
              />
            </div>
          );

        case 'array':
          return (
            <div className="space-y-4">
              {renderSectionHeader(customSection.name)}
              {(value as string[] || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1 cursor-pointer"
                      onClick={() => {
                        const newValue = [...(value as string[])];
                        newValue.splice(index, 1);
                        updateSectionValue(key, newValue, customSection);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                </div>
              ))}
              <Input 
                placeholder={`Add ${customSection.name} (comma-separated)`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value && resumeData) {
                    const newItems = e.currentTarget.value
                      .split(',')
                      .map(item => item.trim())
                      .filter(item => item && !(value as string[]).includes(item));
                    
                    if (newItems.length > 0) {
                      const newValue = [...(value as string[]), ...newItems];
                      updateSectionValue(key, newValue, customSection);
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          );

        case 'object':
          return (
            <div className="space-y-4">
              {renderSectionHeader(customSection.name)}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(value as Record<string, string> || {}).map(([subKey, subValue]) => (
                  <div key={subKey} className="relative">
                    <Label>{subKey.charAt(0).toUpperCase() + subKey.slice(1)}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={subValue}
                        onChange={(e) => {
                          const newValue = { ...(value as Record<string, string>), [subKey]: e.target.value };
                          updateSectionValue(key, newValue, customSection);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => {
                          const newValue = { ...(value as Record<string, string>) };
                          delete newValue[subKey];
                          updateSectionValue(key, newValue, customSection);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="New field name"
                  id={`new-field-${key}`}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(`new-field-${key}`) as HTMLInputElement;
                    if (input.value && resumeData) {
                      const newValue = { ...(value as Record<string, string>), [input.value]: '' };
                      updateSectionValue(key, newValue, customSection);
                      input.value = '';
                    }
                  }}
                >
                  Add Field
                </Button>
              </div>
            </div>
          );

        case 'key-value':
          return (
            <div className="space-y-4">
              {renderSectionHeader(customSection.name)}
              {(value as KeyValuePair[] || []).map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Key</Label>
                      <Input
                        value={item.key}
                        onChange={(e) => {
                          const newValue = [...(value as KeyValuePair[])];
                          newValue[index] = { ...item, key: e.target.value };
                          updateSectionValue(key, newValue, customSection);
                        }}
                        placeholder="Enter key"
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={item.value}
                        onChange={(e) => {
                          const newValue = [...(value as KeyValuePair[])];
                          newValue[index] = { ...item, value: e.target.value };
                          updateSectionValue(key, newValue, customSection);
                        }}
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        const newValue = [...(value as KeyValuePair[])];
                        newValue.splice(index, 1);
                        updateSectionValue(key, newValue, customSection);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  const newValue = [...(value as KeyValuePair[])];
                  newValue.push({
                    id: Date.now().toString(),
                    key: '',
                    value: ''
                  });
                  updateSectionValue(key, newValue, customSection);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Key-Value Pair
              </Button>
            </div>
          );

        case 'array-object':
          return (
            <div className="space-y-4">
              {renderSectionHeader(customSection.name)}
              {(value as ArrayObjectItem[] || []).map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(item).map(([subKey, subValue]) => (
                      <div key={subKey}>
                        <Label>{subKey.charAt(0).toUpperCase() + subKey.slice(1)}</Label>
                        <Input
                          value={subValue}
                          onChange={(e) => {
                            const newValue = [...(value as ArrayObjectItem[])];
                            newValue[index] = { ...item, [subKey]: e.target.value };
                            updateSectionValue(key, newValue, customSection);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        const newValue = [...(value as ArrayObjectItem[])];
                        newValue.splice(index, 1);
                        updateSectionValue(key, newValue, customSection);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  const newValue = [...(value as ArrayObjectItem[])];
                  newValue.push({
                    id: Date.now().toString(),
                    title: '',
                    description: '',
                    date: ''
                  });
                  updateSectionValue(key, newValue, customSection);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          );
      }
    }

    // Handle standard resume fields
    if (typeof value === 'string') {
      return (
        <div className="space-y-4">
          {renderSectionHeader(key.charAt(0).toUpperCase() + key.slice(1))}
          <Textarea
            value={value}
            onChange={(e) => updateResumeData({ [key]: e.target.value })}
            rows={4}
            placeholder={`Enter your ${key}...`}
          />
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-4">
          {renderSectionHeader(key.charAt(0).toUpperCase() + key.slice(1))}
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
                        updateResumeData({ [key]: newValue });
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
                              updateResumeData({ [key]: newValue });
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Live Demo URL (optional)</Label>
                          <Input
                            value={item.liveUrl || ''}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, liveUrl: e.target.value };
                              updateResumeData({ [key]: newValue });
                            }}
                            placeholder="https://your-project.com"
                          />
                        </div>
                        <div>
                          <Label>GitHub URL (optional)</Label>
                          <Input
                            value={item.githubUrl || ''}
                            onChange={(e) => {
                              const newValue = [...value];
                              newValue[itemIndex] = { ...item, githubUrl: e.target.value };
                              updateResumeData({ [key]: newValue });
                            }}
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newValue = [...value];
                            newValue[itemIndex] = { ...item, description: e.target.value };
                            updateResumeData({ [key]: newValue });
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
                              updateResumeData({ [key]: newValue });
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
                              updateResumeData({ [key]: newValue });
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
                                  updateResumeData({ [key]: newValue });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Input 
                          className="mt-2"
                          placeholder="Add technologies (comma-separated)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              const newTechnologies = e.currentTarget.value
                                .split(',')
                                .map(tech => tech.trim())
                                .filter(tech => tech && !item.technologies.includes(tech));
                              
                              if (newTechnologies.length > 0) {
                                const newValue = [...value];
                                newValue[itemIndex] = {
                                  ...item,
                                  technologies: [...item.technologies, ...newTechnologies]
                                };
                                updateResumeData({ [key]: newValue });
                              }
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
                              updateResumeData({ [key]: newValue });
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
                        updateResumeData({ [key]: newValue });
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
            <div className="space-y-2">
              <Input 
                placeholder={`Add ${key.slice(0, -1)} (comma-separated)`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const newItems = e.currentTarget.value
                      .split(',')
                      .map(item => item.trim())
                      .filter(item => item && !value.includes(item));
                    
                    if (newItems.length > 0) {
                      updateResumeData({
                        [key]: [...value, ...newItems]
                      });
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
              <p className="text-sm text-gray-500">
                Press Enter to add multiple items. Separate items with commas.
              </p>
            </div>
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
                updateResumeData({ [key]: newValue });
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
      if (Array.isArray(value) && value.length > 0 && 'key' in value[0]) {
        // Handle key-value array type
      return (
        <div className="space-y-4">
            {value.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Key</Label>
              <Input
                      value={item.key}
                onChange={(e) => {
                        const newValue = [...value];
                        newValue[index] = { ...item, key: e.target.value };
                        updateResumeData({ [key]: newValue });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={item.value}
                      onChange={(e) => {
                        const newValue = [...value];
                        newValue[index] = { ...item, value: e.target.value };
                        updateResumeData({ [key]: newValue });
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      const newValue = [...value];
                      newValue.splice(index, 1);
                      updateResumeData({ [key]: newValue });
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
            </div>
          ))}
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                const newValue = [...value];
                newValue.push({
                  id: Date.now().toString(),
                  key: '',
                  value: ''
                });
                updateResumeData({ [key]: newValue });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Key-Value Pair
            </Button>
        </div>
        );
      }
      
      // Handle regular object type
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey}>
                <Label>{subKey.charAt(0).toUpperCase() + subKey.slice(1)}</Label>
                <Input
                  value={subValue as string}
                  onChange={(e) => updateResumeData({
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
              updateResumeData({ [key]: {} });
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        </div>
      );
    }

    return null;
  }

  // Update the Add Section button click handlers
  const handleAddSectionClick = (isPaged: boolean) => {
    const nameInput = document.getElementById(
      isPaged ? 'new-section-name-paged' : 'new-section-name'
    ) as HTMLInputElement;
    const typeInput = document.getElementById(
      isPaged ? 'new-section-type-paged' : 'new-section-type'
    ) as HTMLSelectElement;
    
    handleAddSection(nameInput.value, typeInput.value);
    
    // Reset inputs
    nameInput.value = '';
    typeInput.value = 'string';
  };

  // Update the form fields rendering to use DraggableSection
  const renderFormFields = () => {
    if (!resumeData) return null

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {sectionOrder.map((key) => {
              // Skip these fields as they're handled separately
              if (['title', 'slug', 'isPublic', 'template'].includes(key)) return null
              
              return (
                <DraggableSection
                  key={key}
                  id={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {renderFormField(key, resumeData[key])}
                </DraggableSection>
              )
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
                        {SECTION_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    className="cursor-pointer"
                    onClick={() => handleAddSectionClick(false)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  // Update the Monaco editor onMount handler
  const handleEditorMount: OnMount = (editor) => {
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
  };

  // Load resume data when component mounts
  useEffect(() => {
    if (resumeId) {
      // TODO: Load resume data using resumeId
      // For now, we'll use mock data
      setResumeData({
        title: "Software Engineer Resume",
        slug: "software-engineer-resume",
        isPublic: true,
        template: "modern",
        personalInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA"
        },
        experience: [
          {
            id: Date.now().toString(),
            position: "Software Engineer",
            company: "Example Corp",
            startDate: "2023-01",
            endDate: "2023-06",
            description: "Developed and maintained web applications using modern technologies."
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
        summary: "",
        education: [],
        projects: [],
        customSections: []
      });
    }
  }, [resumeId, setResumeData]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!resumeData) {
    return <div>No resume data found</div>
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <EditorHeader
          title={resumeData.title}
          isPublic={resumeData.isPublic}
          onTitleChange={(title) => updateResumeData({ title })}
          onTemplateClick={() => setIsTemplateModalOpen(true)}
          onAIClick={() => setIsAISidebarOpen(true)}
          onSaveClick={handleSave}
          onExportClick={() => setIsExportModalOpen(true)}
        />

        <div 
          ref={containerRef}
          className={`flex h-[calc(100vh-73px)] relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
        >
          {/* Left Panel - Form/JSON Editor */}
          <div 
            className="border-r bg-white overflow-y-auto"
            style={{ width: isFullscreen ? '100%' : `${editorWidth}%` }}
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resume Editor</h2>
                <Tabs value={editMode} onValueChange={(value) => setEditMode(value as EditMode)}>
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
                    renderFormFields()
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
                                  {SECTION_TYPE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              className="cursor-pointer"
                              onClick={() => handleAddSectionClick(true)}
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
                    onMount={handleEditorMount}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview with Drag Area */}
          {!isFullscreen && (
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
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Live Preview</h3>
                  <select
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    value={resumeData.template}
                    onChange={(e) => {
                      setTemplate(e.target.value);
                      toast.success(`Template changed to ${e.target.value}`);
                    }}
                  >
                    <option value="modern">Modern</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                    <option value="professional">Professional</option>
                    <option value="minimal">Minimal</option>
                    <option value="elegant">Elegant</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">{zoomLevel}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
              <div 
                ref={previewRef}
                className="h-[calc(100%-57px)] overflow-auto"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${100 / (zoomLevel / 100)}%`,
                  height: `${100 / (zoomLevel / 100)}%`
                }}
              >
              <ResumePreview data={resumeData} template={resumeData.template} />
            </div>
          </div>
          )}
        </div>

        {/* Modals */}
        <AISidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          resumeData={resumeData}
          onUpdateResume={updateResumeData}
        />

        <TemplateSelector
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplate={resumeData.template}
          onSelectTemplate={(template) => {
            setTemplate(template)
            setIsTemplateModalOpen(false)
          }}
        />

        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} resumeData={resumeData} />
      </div>
    </AuthProvider>
  )
} 