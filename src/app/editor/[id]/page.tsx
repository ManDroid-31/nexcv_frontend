"use client"

import { useState, useRef, useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import React from 'react'

// component dependencies

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
import { TemplateSelector } from "@/components/template-selector"
import { ExportModal } from "@/components/export-modal"  //used for eport card
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { EditorHeader } from "@/components/editor-header"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { editor } from 'monaco-editor'
import { getTemplateDefaultLayout } from '@/components/templates'
import { getResumeById } from '@/data/resume'
import { AIPanel } from '@/components/ai-panel'
import { ResumeData, CustomSection, CustomSectionValue, KeyValuePair, ArrayObjectItem } from '@/types/resume'
import { useResumeStore } from '@/stores/resume-store'

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false }
)

type EditMode = "form" | "json" | "paged-form"

type PageProps = {
  params: { id: string }
};

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
  onTitleChange,
  children 
}: { 
  id: string
  title: string
  onTitleChange?: (newTitle: string) => void;
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
    boxShadow: isDragging ? '0 0 0 4px #3b82f6, 0 2px 8px rgba(0,0,0,0.10)' : undefined,
    border: isDragging ? '2px solid #3b82f6' : undefined,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex items-center"
            style={{ marginRight: 8 }}
          >
            <GripVertical className="w-5 h-5 text-blue-500" />
          </div>
          {onTitleChange ? (
            <Input
              className="font-bold text-lg border-none bg-transparent focus:ring-0 focus:outline-none p-0 h-auto"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              style={{ width: Math.max(80, title.length * 12) }}
            />
          ) : (
            <CardTitle>{title}</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

// Add type safety for dynamic object access
type ResumeKey = keyof ResumeData;

// Helper to check if a string is a valid section name
const isValidSectionName = (name: string): name is keyof ResumeData => {
  const validSections = [
    'title',
    'slug',
    'isPublic',
    'template',
    'tags',
    'layout',
    'personalInfo',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
  ] as const;
  return validSections.includes(name as keyof ResumeData);
};

// Patch: Prevent id editing in JSON mode

function isKeyValuePairArray(val: CustomSectionValue): val is KeyValuePair[] {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'key' in val[0] && 'value' in val[0];
}
function isArrayObjectItemArray(val: CustomSectionValue): val is ArrayObjectItem[] {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'title' in val[0] && 'description' in val[0];
}
function restoreIdsFromOriginal(original: ResumeData, edited: ResumeData): ResumeData {
  // Restore ids for main array/object sections
  function restoreArray<T extends { id?: string }>(origArr: T[], editArr: T[]): T[] {
    return editArr.map((item, idx) =>
      typeof item === 'object' && item !== null && origArr[idx] && origArr[idx].id
        ? { ...item, id: origArr[idx].id }
        : item
    );
  }
  const result: ResumeData = { ...edited };
  if (Array.isArray(original.experience) && Array.isArray(edited.experience)) {
    result.experience = restoreArray(original.experience, edited.experience);
  }
  if (Array.isArray(original.projects) && Array.isArray(edited.projects)) {
    result.projects = restoreArray(original.projects, edited.projects);
  }
  if (Array.isArray(original.education) && Array.isArray(edited.education)) {
    result.education = restoreArray(original.education, edited.education);
  }
  if (Array.isArray(original.skills) && Array.isArray(edited.skills)) {
    result.skills = edited.skills;
  }
  // Restore ids for customSections and their values
  if (Array.isArray(original.customSections) && Array.isArray(edited.customSections)) {
    result.customSections = edited.customSections.map((section, idx) => {
      const origSection = original.customSections[idx];
      if (!origSection) return section;
      let newValue = section.value;
      // Only restore ids for KeyValuePair[] and ArrayObjectItem[]
      if (isKeyValuePairArray(origSection.value) && isKeyValuePairArray(section.value)) {
        newValue = section.value.map((item, i) => {
          const origItem = Array.isArray(origSection.value) && origSection.value[i];
          return origItem && typeof origItem === 'object' && 'id' in origItem ? { ...item, id: origItem.id } : item;
        });
      } else if (isArrayObjectItemArray(origSection.value) && isArrayObjectItemArray(section.value)) {
        newValue = section.value.map((item, i) => {
          const origItem = Array.isArray(origSection.value) && origSection.value[i];
          return origItem && typeof origItem === 'object' && 'id' in origItem ? { ...item, id: origItem.id } : item;
        });
      }
      return { ...section, id: origSection.id, value: newValue };
    });
  }
  return result;
}


// main function and last 
export default function ResumeEditor({ params }: PageProps) {
  // Unwrap params using React.use() for Next.js compatibility
  const { id: resumeId } = React.use(params);
  const [editMode, setEditMode] = useState<EditMode>("form")

  //UI componeents state handlers
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
    getPreviewData,
    isLoading,
    error,
    setResumeData,
    updateResumeData,
    saveResume
  } = useResumeStore()

  const { user } = useUser()
  const userId = user?.id

  const totalPages = RESUME_SECTIONS.length

  // Helper function to check if a key is a valid ResumeKey
  // nothin complex just typeshit here
  const isResumeKey = (key: string): key is keyof ResumeData => {
    if (!resumeData) return false;
    return isValidSectionName(key);
  };

  // Helper function to get section value
  const getSectionValue = (key: string): unknown => {
    if (!resumeData) return undefined;
    if (isResumeKey(key)) {
      return resumeData[key];
    }
    const customSection = resumeData.customSections.find(
      section => section.name.toLowerCase().replace(/\s+/g, '') === key
    );
    return customSection?.value;
  };

  // Helper function to update section value
  const updateSectionValue = (key: string, value: unknown) => {
    if (!resumeData) return;
    if (isResumeKey(key)) {
      updateResumeData({ [key]: value });
    } else {
      const customSection = resumeData.customSections.find(
        section => section.name.toLowerCase().replace(/\s+/g, '') === key
      );
      if (customSection) {
        const updatedSections = resumeData.customSections.map(section =>
          section.id === customSection.id
            ? { ...section, value: value as CustomSectionValue }
            : section
        );
        updateResumeData({ customSections: updatedSections });
      }
    }
  };

  // Add DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Add active section state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  // Update handleDragStart to track active section
  const handleDragStart = (event: DragStartEvent) => {
    setActiveSectionId(String(event.active.id))
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

  // Add a top-level loading state for page transitions
  const [pageLoading, setPageLoading] = useState(false)
  const router = useRouter()

  // Show loading animation on route change
  useEffect(() => {
    const handleStart = () => setPageLoading(true)
    const handleComplete = () => setPageLoading(false)
    router.events?.on('routeChangeStart', handleStart)
    router.events?.on('routeChangeComplete', handleComplete)
    router.events?.on('routeChangeError', handleComplete)
    return () => {
      router.events?.off('routeChangeStart', handleStart)
      router.events?.off('routeChangeComplete', handleComplete)
      router.events?.off('routeChangeError', handleComplete)
    }
  }, [router])

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!resumeData || !userId) return;
    setSaving(true);
    try {
      await saveResume(resumeData, userId, resumeId);
      // Refetch the latest resume from the backend
      const updated = await getResumeById(resumeId, userId);
      setResumeData(updated);
      toast.success('Resume saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = (sectionName: string, sectionType: string) => {
    if (!sectionName) {
      toast.error('Please enter a section name');
      return;
    }

    const formattedName = sectionName.trim().toLowerCase().replace(/\s+/g, '');
    
    // Check if section already exists in customSections
    if (resumeData && resumeData.customSections.some(section => 
      section.name.toLowerCase().replace(/\s+/g, '') === formattedName
    )) {
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
    const newSection = JSON.parse(JSON.stringify(template)) as CustomSectionValue;
    
    // Add to customSections array
    const customSection: CustomSection = {
      id: Date.now().toString(),
      name: sectionName.trim(), // Use trimmed name for display
      type: sectionType as SectionType,
      value: newSection
    };

    if (resumeData) {
      const newSectionKey = `custom:${customSection.id}`;
      setResumeData({
        ...resumeData,
        customSections: [...resumeData.customSections, customSection],
        sectionOrder: [...resumeData.sectionOrder, newSectionKey]
      });
      toast.success('New section added successfully');
    }
  };

  // Helper function to remove a section
  const removeSection = (key: string, customSection: CustomSection) => {
    if (resumeData) {
      const updatedData = {
        ...resumeData,
        customSections: resumeData.customSections.filter(
          section => section.id !== customSection.id
        )
      } as ResumeData;

      if (isResumeKey(key)) {
        delete updatedData[key];
      }
      
      setResumeData(updatedData);
      setResumeData({
        ...resumeData,
        sectionOrder: resumeData.sectionOrder.filter(section => section !== `custom:${customSection.id}`)
      });
      toast.success('Section removed successfully');
    }
  };

  // Update the renderFormField function
  const renderFormField = (key: string, value: unknown) => {
    // Find if this is a custom section
    const customSection = resumeData?.customSections?.find(section => 
      section.name?.toLowerCase().replace(/\s+/g, '') === key
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
              } else if (resumeData && isValidSectionName(key)) {
                // For standard sections, create a new object without the removed section
                const { [key]: removed, ...rest } = resumeData;
                // Silence the unused variable warning
                void removed;
                setResumeData(rest as ResumeData);
                setResumeData({
                  ...resumeData,
                  sectionOrder: resumeData.sectionOrder.filter(section => section !== key)
                });
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

    // Add tag editing for sections that support it
    const renderTags = (tags: string[] = [], onUpdate: (tags: string[]) => void) => (
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 ml-1 cursor-pointer"
                onClick={() => {
                  const newTags = [...tags];
                  newTags.splice(index, 1);
                  onUpdate(newTags);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <Input 
          placeholder="Add tags (comma-separated)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              const newTags = e.currentTarget.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag && !tags.includes(tag));
              
              if (newTags.length > 0) {
                onUpdate([...tags, ...newTags]);
              }
              e.currentTarget.value = '';
            }
          }}
        />
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
                  updateSectionValue(key, e.target.value);
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
                        updateSectionValue(key, newValue);
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
                      updateSectionValue(key, newValue);
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
                          updateSectionValue(key, newValue);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => {
                          const newValue = { ...(value as Record<string, string>) };
                          delete newValue[subKey];
                          updateSectionValue(key, newValue);
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
                      updateSectionValue(key, newValue);
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
                          updateSectionValue(key, newValue);
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
                          updateSectionValue(key, newValue);
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
                        updateSectionValue(key, newValue);
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
                  updateSectionValue(key, newValue);
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
                            updateSectionValue(key, newValue);
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
                        updateSectionValue(key, newValue);
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
                  updateSectionValue(key, newValue);
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
          {renderSectionHeader(key as string)}
          <Textarea
            value={value}
            onChange={(e) => updateSectionValue(key, e.target.value)}
            rows={4}
            placeholder={`Enter your ${key}...`}
          />
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-4">
          {renderSectionHeader(key as string)}
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
                        updateSectionValue(key, newValue);
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
                              updateSectionValue(key, newValue);
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
                              updateSectionValue(key, newValue);
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
                              updateSectionValue(key, newValue);
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
                            updateSectionValue(key, newValue);
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
                              updateSectionValue(key, newValue);
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
                              updateSectionValue(key, newValue);
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
                                  updateSectionValue(key, newValue);
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
                                updateSectionValue(key, newValue);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      {renderTags(item.tags || [], (newTags) => {
                        const newValue = [...value];
                        newValue[itemIndex] = { ...item, tags: newTags };
                        updateSectionValue(key, newValue);
                      })}
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
                              updateSectionValue(key, newValue);
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
                        updateSectionValue(key, newValue);
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
                      updateSectionValue(key, [...value, ...newItems]);
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
                updateSectionValue(key, newValue);
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
                        updateSectionValue(key, newValue);
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
                        updateSectionValue(key, newValue);
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
                      updateSectionValue(key, newValue);
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
                updateSectionValue(key, newValue);
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
                  onChange={(e) => updateSectionValue(key, { ...value, [subKey]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              updateSectionValue(key, {});
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
    const allowedKeys = [
      'personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'
    ];
    function isResumeKeyStrict(key: any): key is ResumeKey {
      return allowedKeys.includes(String(key));
    }
    const sectionOrder = (resumeData?.sectionOrder || []).filter(k => k !== 'id');
    const validSectionOrder = sectionOrder.filter((key): key is ResumeKey => isResumeKeyStrict(key));
    const customSectionOrder = sectionOrder.filter(key => key.startsWith('custom:'));
    return (



      // actual form field
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={event => {
          const { active, over } = event;
          setActiveSectionId(null);
          if (over && active.id !== over.id) {
            const oldIndex = validSectionOrder.indexOf(active.id as string);
            const newIndex = validSectionOrder.indexOf(over.id as string);
            const newOrder = arrayMove(validSectionOrder, oldIndex, newIndex);
            updateResumeData({ sectionOrder: newOrder });
          }
        }}
      >
        <SortableContext
          items={validSectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {/* Main sections */}
            {validSectionOrder.map((key) => {
              const value = getSectionValue(key);
              if (value === undefined) return null;
              return (
                <DraggableSection
                  key={key}
                  id={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {renderFormField(key as ResumeKey, value)}
                </DraggableSection>
              );
            })}

            {/* Custom sections */}
            {customSectionOrder.map((key) => {
              const customId = key.replace('custom:', '')
              const customSection = resumeData.customSections?.find((s: CustomSection) => s.id === customId)
              if (!customSection) return null
              return (
                <DraggableSection
                  key={key}
                  id={key}
                  title={customSection.name}
                  onTitleChange={newName => {
                    // Update custom section name and sectionOrder
                    const updatedSections = resumeData.customSections.map((s: CustomSection) =>
                      s.id === customSection.id ? { ...s, name: newName } : s
                    );
                    const updatedOrder = [...validSectionOrder, ...customSectionOrder].map(k =>
                      k === key ? `custom:${customSection.id}` : k
                    );
                    updateResumeData({ customSections: updatedSections, sectionOrder: updatedOrder });
                  }}
                >
                  {renderFormField(customSection.name.toLowerCase().replace(/\s+/g, '') as string, customSection.value)}
                </DraggableSection>
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



        {/* below section for dragging animation */}
        <DragOverlay adjustScale={true} dropAnimation={null}>
          {activeSectionId ? (() => {
            // Main section
            if (!activeSectionId.startsWith('custom:')) {
              if (["title", "slug", "isPublic", "template"].includes(activeSectionId)) return null;
              const value = getSectionValue(activeSectionId);
              if (value === undefined) return null;
              return (
                <div className="z-50 opacity-90">
                  <DraggableSection
                    id={activeSectionId}
                    title={activeSectionId.charAt(0).toUpperCase() + activeSectionId.slice(1)}
                  >
                    {renderFormField(activeSectionId as ResumeKey, value)}
                  </DraggableSection>
                </div>
              );
            }
            // Custom section
            const customId = activeSectionId.replace('custom:', '')
            const customSection = resumeData.customSections?.find(s => s.id === customId)
            if (!customSection) return null
            return (
              <div className="z-50 opacity-90">
                <DraggableSection
                  id={activeSectionId}
                  title={customSection.name}
                >
                  {renderFormField(customSection.name.toLowerCase().replace(/\s+/g, '') as string, customSection.value)}
                </DraggableSection>
              </div>
            )
          })() : null}
        </DragOverlay>
      </DndContext>
    )
  }

  // Update the Monaco editor onMount handler
  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    // Add Ctrl+S handler
    editor.addCommand(
      // Use numbers instead of KeyMod/KeyCode since we can't import monaco directly
      2048 | 49, // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
      () => {
        try {
          const value = editor.getValue();
          const parsed = JSON.parse(value);
          // Patch: restore ids from original data
          if (resumeData) {
            const safeParsed = restoreIdsFromOriginal(resumeData, parsed);
            setResumeData(safeParsed);
            toast.success("JSON is valid");
          } else {
            toast.error("Cannot update: original resume data is missing.");
          }
        } catch {
          toast.error("Invalid JSON format");
        }
      }
    );
  };

  // Update the initial resume data with proper types
  useEffect(() => {
    if (resumeId && userId) {
      (async () => {
        try {
          const data = await getResumeById(resumeId, userId);
          setResumeData(data);
        } catch {
          setResumeData(null);
          toast.error('Failed to load resume');
        }
      })();
    }
  }, [resumeId, userId, setResumeData]);

  // Add this function to get default layout for the current template
  const handleResetLayout = () => {
    if (!resumeData) return;
    // You need to implement getTemplateDefaultLayout to return the default layout for a template
    const defaultLayout = getTemplateDefaultLayout(resumeData.template);
    setResumeData({
      ...resumeData,
      layout: defaultLayout
    });
    toast.success('Layout reset to template default!');
  };

  // Add AI Drawer Panel State
  const [aiDrawerHovered, setAIDrawerHovered] = useState(false);
  const [aiMessage, setAIMessage] = useState("");
  const [aiIsLoading, setAIIsLoading] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState([
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
  ]);

  const handleAISendMessage = async () => {
    if (!aiMessage.trim()) return;
    setAIIsLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setAIMessage("");
      setAIIsLoading(false);
    }, 2000);
  };

  const applyAISuggestion = (suggestionId: string) => {
    setAISuggestions(aiSuggestions.map((s) => (s.id === suggestionId ? { ...s, status: "completed" } : s)));
  };

  if (isLoading || pageLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!resumeData) {
    return <div>No resume data found</div>
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <EditorHeader
          title={resumeData.title}
          isPublic={resumeData.isPublic}
          onTitleChange={(title) => updateResumeData({ title })}
          onTemplateClick={() => setIsTemplateModalOpen(true)}
          onSaveClick={handleSave}
          onExportClick={() => setIsExportModalOpen(true)}
          saving={saving}
        />
        {/* Reset Layout Button */}
        <div className="flex justify-end px-6 pt-4">
          <Button variant="outline" onClick={handleResetLayout}>
            Reset Layout to Template Default
          </Button>
        </div>
        <div 
          ref={containerRef}
          className={`flex h-[calc(100vh-73px)] relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
        >
          {/* Left Panel - Form/JSON Editor */}
          <div 
            className="border-r bg-background overflow-y-auto"
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
                      <div className="text-sm text-muted-foreground">
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
                          {renderFormField(RESUME_SECTIONS[currentPage - 1]?.key as ResumeKey, resumeData[RESUME_SECTIONS[currentPage - 1]?.key])}
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
                    <div className="text-sm text-muted-foreground">
                      Press Ctrl+S to validate JSON
                    </div>
                  </div>
                  <MonacoEditor
                    height="600px"
                    defaultLanguage="json"
                    value={JSON.stringify(resumeData, null, 2)}
                    onChange={(value: string | undefined) => {
                      if (value && resumeData) {
                        try {
                          const parsed = JSON.parse(value);
                          // Patch: restore ids from original data
                          const safeParsed = restoreIdsFromOriginal(resumeData, parsed);
                          setResumeData(safeParsed);
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
            className="bg-muted relative"
            style={{ width: `${100 - editorWidth}%` }}
            onMouseDown={handleMouseDown}
          >
            {/* Visual Drag Indicator */}
            <div
                className={`absolute top-0 bottom-0 left-0 w-1 bg-border hover:bg-primary cursor-col-resize transition-colors ${
                isDragging ? 'bg-primary' : ''
              }`}
            />
            
            {/* Preview Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Live Preview</h3>
                  <select
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    value={resumeData?.template || 'onyx'}
                    onChange={(e) => {
                      updateResumeData({ template: e.target.value });
                      toast.success(`Template changed to ${e.target.value}`);
                    }}
                  >
                    <option value="onyx">Onyx</option>
                    <option value="bronzor">Bronzor</option>
                    <option value="ditto">Ditto</option>
                    <option value="chikorita">Chikorita</option>
                    <option value="leafish">Leafish</option>
                    <option value="azurill">Azurill</option>
                    <option value="gengar">Gengar</option>
                    <option value="pikachu">Pikachu</option>
                    <option value="kakuna">Kakuna</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Layout Controls */}
                    {resumeData && (
                      <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Margins</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={resumeData.layout?.margins?.left ?? 40}
                            onChange={(e) => updateResumeData({
                              layout: {
                                ...resumeData.layout,
                                margins: {
                                  ...(resumeData.layout?.margins ?? {}),
                                  top: Number(e.target.value),
                                  bottom: Number(e.target.value),
                                  left: Number(e.target.value),
                                  right: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-16 h-8"
                          />
                          <span className="text-sm text-muted-foreground">px</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Spacing</Label>
                          <Input
                            type="number"
                            min={1}
                            max={2}
                            step={0.1}
                            value={resumeData.layout?.spacing?.lineHeight ?? 1.5}
                            onChange={(e) => updateResumeData({
                              layout: {
                                ...resumeData.layout,
                                spacing: {
                                  ...(resumeData.layout?.spacing ?? {}),
                                  lineHeight: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-16 h-8"
                          />
                          <span className="text-sm text-muted-foreground">×</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Scale</Label>
                          <Input
                            type="number"
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            value={resumeData.layout?.scale ?? 1}
                            onChange={(e) => updateResumeData({
                              layout: {
                                ...resumeData.layout,
                                scale: Number(e.target.value)
                              }
                            })}
                            className="w-16 h-8"
                          />
                          <span className="text-sm text-muted-foreground">×</span>
                        </div>
                      </div>
                    )}
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
              {resumeData ? (
                <ResumePreview 
                  data={getPreviewData() || resumeData} 
                  template={resumeData.template || 'modern'} 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Loading resume data...</div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Modals */}
        <TemplateSelector
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplate={resumeData.template}
          onSelectTemplate={(template) => {
            updateResumeData({ template });
            setIsTemplateModalOpen(false);
          }}
        />

        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} resumeData={resumeData} />

        {/* Replace the inline AI panel with the AIPanel component */}
        <AIPanel
          aiDrawerHovered={aiDrawerHovered}
          setAIDrawerHovered={setAIDrawerHovered}
          aiMessage={aiMessage}
          setAIMessage={setAIMessage}
          aiIsLoading={aiIsLoading}
          aiSuggestions={aiSuggestions}
          applyAISuggestion={applyAISuggestion}
          handleAISendMessage={handleAISendMessage}
        />
      </div>
    </AuthProvider>
  )
} 




// fuk it Manas single handedly understood whole 2000(almostt) lines of code 🫡🫡🙌🙌