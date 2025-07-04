"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import React from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  AuthProvider,
  Code,
  FormInput,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "@/components"
import { ResumePreview } from "@/components/resume-preview"
import { TemplateSelector } from "@/components/template-selector"
import { ExportModal } from "@/components/export-modal"
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
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { editor as MonacoEditorType } from 'monaco-editor'
import { getTemplateDefaultLayout } from '@/components/templates'
import { getResumeById } from '@/data/resume'
import { AIPanel } from '@/components/ai-panel'
import { ResumeData, CustomSection, CustomSectionValue, KeyValuePair, ArrayObjectItem, Layout } from '@/types/resume'
import { useResumeStore } from '@/stores/resume-store'
import { AppNavbar } from '@/components/AppNavbar'
import { useRequireAuth } from '@/hooks/use-require-auth'

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false }
);

// Replace DraggableSection import with dynamic import
const DraggableSection = dynamic(() => import('./DraggableSection').then(mod => mod.default), { ssr: false });

type EditMode = "form" | "json" | "paged-form"

type PageProps = {
  params: Promise<{ id: string }>
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

// Define ResumeKey type
type ResumeKey = 'personalInfo' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'title' | 'slug' | 'isPublic' | 'template' | 'tags' | 'layout';

// Helper to check if a string is a valid section name
const isValidSectionName = (name: string): name is ResumeKey => {
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
  return validSections.includes(name as ResumeKey);
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

// Restore SortableDraggableSection as a wrapper component to use useSortable outside the map
function SortableDraggableSection({ id, title, children, onTitleChange, isDragging, isOverlay }: { id: string; title: string; children: React.ReactNode; onTitleChange?: (newName: string) => void; isDragging?: boolean; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging: sortableDragging } = useSortable({ id });
  // Determine if this section is being dragged (from dnd-kit or parent prop)
  const dragging = typeof isDragging === 'boolean' ? isDragging : sortableDragging;
  // Overlay: when rendering in DragOverlay
  const overlay = !!isOverlay;
  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: overlay ? 0.7 : dragging ? 0.5 : 1,
        background: overlay || dragging ? 'rgba(240,240,255,0.95)' : undefined,
        boxShadow: overlay || dragging ? '0 4px 24px 0 rgba(80,80,160,0.10)' : undefined,
        border: overlay || dragging ? '2px solid #6366f1' : undefined,
        zIndex: overlay ? 9999 : dragging ? 10 : 1,
        width: '100%',
        minWidth: 0,
        transition: 'box-shadow 0.2s, opacity 0.2s',
        pointerEvents: overlay ? 'none' : undefined,
        position: overlay ? 'relative' : undefined,
      }}
      className={overlay ? 'block' : ''}
    >
      <DraggableSection
        title={title}
        onTitleChange={onTitleChange}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {children}
      </DraggableSection>
    </div>
  );
}

// main function and last 
export default function ResumeEditor({ params }: PageProps) {
  const { user } = useUser();
  const { requireAuth } = useRequireAuth();
  

  // All hooks must be called before any return
  const resolvedParams = React.use(params);
  const resumeId = resolvedParams.id;
  const [editMode, setEditMode] = useState<EditMode>("form");
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
    saveResume,
    markAsSaved,
    markAsUnsaved
  } = useResumeStore()

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
      // Mark as unsaved when data is updated
      markAsUnsaved(resumeData.id);
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
        // Mark as unsaved when data is updated
        markAsUnsaved(resumeData.id);
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
  // Add state for the section currently being hovered over
  const [overSectionId, setOverSectionId] = useState<string | null>(null)

  // Update handleDragStart to track active section
  const handleDragStart = (event: DragStartEvent) => {
    setActiveSectionId(String(event.active.id))
    setOverSectionId(String(event.active.id))
  }

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over && event.over.id) {
      setOverSectionId(String(event.over.id));
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

  // Add a top-level loading state for page transitions
  const [saving, setSaving] = useState(false);

  // Add debounced update for JSON editor
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [jsonEditorValue, setJsonEditorValue] = useState('');

  // Add this function to sync isPublic and visibility
  function syncPublicFields(data: ResumeData): ResumeData {
    let isPublic = data.isPublic;
    let visibility = data.visibility;
    // If only one is present, or they disagree, sync them
    if (typeof isPublic === 'boolean') {
      visibility = isPublic ? 'public' : 'private';
    } else if (typeof visibility === 'string') {
      isPublic = visibility === 'public';
    } else {
      // Default to private
      isPublic = false;
      visibility = 'private';
    }
    return { ...data, isPublic, visibility };
  }

  const debouncedUpdateResume = (value: string | undefined) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (value && resumeData) {
        try {
          let parsed = JSON.parse(value);
          // Patch: restore ids from original data
          parsed = restoreIdsFromOriginal(resumeData, parsed);
          // Sync public fields
          parsed = syncPublicFields(parsed);
          setResumeData(parsed);
          markAsUnsaved(resumeId);
        } catch {
          // Don't update state if JSON is invalid
        }
      }
    }, 500); // 500ms delay
  };

  // Update JSON editor value when resume data changes (but not from editor)
  useEffect(() => {
    if (resumeData) {
      const newValue = JSON.stringify(resumeData, null, 2);
      setJsonEditorValue(newValue);
    } else {
      setJsonEditorValue('');
    }
  }, [resumeData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!requireAuth()) return;
    if (!resumeData || !userId) return;
    setSaving(true);
    try {
      // Always sync before saving
      const saveData = syncPublicFields(resumeData);
      await saveResume(saveData, userId, resumeId);
      // Refetch the latest resume from the backend
      let updated = await getResumeById(resumeId, userId, 'ownerview');
      updated = syncPublicFields(updated);
      setResumeData(updated);
      // Mark as saved after successful save
      markAsSaved(resumeId);
      toast.success('Resume saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  // Handle applying enhanced resume from AI
  const handleApplyEnhancedResume = (enhancedResume: ResumeData) => {
    if (!enhancedResume || !resumeData) return;
    
    // Restore IDs from original data to maintain consistency
    const safeEnhancedResume = restoreIdsFromOriginal(resumeData, enhancedResume);
    
    // Update the resume data
    setResumeData(safeEnhancedResume);
    
    // Update the JSON editor value immediately
    const newJsonValue = JSON.stringify(safeEnhancedResume, null, 2);
    setJsonEditorValue(newJsonValue);
    
    // Switch to JSON mode to show the changes
    setEditMode("json");
    
    // Show specific enhancements
    const enhancements = [];
    if (enhancedResume.summary && enhancedResume.summary !== resumeData.summary) {
      enhancements.push("Professional Summary");
    }
    if (enhancedResume.skills && enhancedResume.skills.length > (resumeData.skills?.length || 0)) {
      enhancements.push("Skills List");
    }
    if (enhancedResume.experience && enhancedResume.experience.length > 0) {
      enhancements.push("Experience Descriptions");
    }
    
    const enhancementText = enhancements.length > 0 
      ? `Enhanced: ${enhancements.join(", ")}`
      : "Enhanced resume applied!";
    
    toast.success(`${enhancementText} Review the changes in JSON mode.`);
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
      markAsUnsaved(resumeId);
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
      markAsUnsaved(resumeId);
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
                markAsUnsaved(resumeId);
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

  // Move these to the top of ResumeEditor, not inside renderFormFields
  const sectionOrder = useMemo(() => (resumeData?.sectionOrder || []).filter(k => k !== 'id'), [resumeData?.sectionOrder]);
  const validSectionOrder = useMemo(() => {
    const allowedKeys = [
      'personalInfo', 'summary', 'experience', 'education', 'projects', 'skills',
      'title', 'slug', 'isPublic', 'template', 'tags', 'layout'
    ];
    return sectionOrder.filter((key) => allowedKeys.includes(key));
  }, [sectionOrder]);
  const customSectionOrder = useMemo(() => sectionOrder.filter(key => key.startsWith('custom:')), [sectionOrder]);

  // Update the form fields rendering to use DraggableSection
  const renderFormFields = () => {
    if (!resumeData) return null;
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={event => {
          const { active, over } = event;
          setActiveSectionId(null);
          setOverSectionId(null);
          if (over && active.id !== over.id) {
            const oldIndex = validSectionOrder.indexOf(active.id as ResumeKey);
            const newIndex = validSectionOrder.indexOf(over.id as ResumeKey);
            const newOrder = arrayMove(validSectionOrder, oldIndex, newIndex);
            updateResumeData({ sectionOrder: newOrder });
            markAsUnsaved(resumeId);
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
              if (!allowedKeys.includes(key)) return null;
              const value = getSectionValue(key);
              if (value === undefined) return null;
              // Show drop indicator above the section being hovered
              if (activeSectionId && overSectionId === key && activeSectionId !== key) {
                return (
                  <React.Fragment key={key}>
                    <div style={{ height: '32px', background: 'rgba(99,102,241,0.10)', border: '2px dashed #6366f1', borderRadius: '0.5rem', margin: '12px 0' }} />
                    <SortableDraggableSection
                      id={key}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      isDragging={false}
                    >
                      {renderFormField(key, value)}
                    </SortableDraggableSection>
                  </React.Fragment>
                );
              }
              // Normal rendering
              return (
                <SortableDraggableSection
                  key={key}
                  id={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  isDragging={false}
                >
                  {renderFormField(key, value)}
                </SortableDraggableSection>
              );
            })}
            {/* Custom sections */}
            {customSectionOrder.map((key) => {
              const customId = key.replace('custom:', '');
              const customSection = resumeData.customSections?.find((s: CustomSection) => s.id === customId);
              if (!customSection) return null;
              // Show drop indicator above the section being hovered
              if (activeSectionId && overSectionId === key && activeSectionId !== key) {
                return (
                  <React.Fragment key={key}>
                    <div style={{ height: '32px', background: 'rgba(99,102,241,0.10)', border: '2px dashed #6366f1', borderRadius: '0.5rem', margin: '12px 0' }} />
                    <SortableDraggableSection
                      id={key}
                      title={customSection.name}
                      isDragging={false}
                    >
                      {renderFormField(customSection.name.toLowerCase().replace(/\s+/g, ''), customSection.value)}
                    </SortableDraggableSection>
                  </React.Fragment>
                );
              }
              // Normal rendering
              return (
                <SortableDraggableSection
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
                    markAsUnsaved(resumeId);
                  }}
                  isDragging={false}
                >
                  {renderFormField(customSection.name.toLowerCase().replace(/\s+/g, ''), customSection.value)}
                </SortableDraggableSection>
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
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeSectionId ? (() => {
            // Main section
            if (!activeSectionId.startsWith('custom:')) {
              if (!allowedKeys.includes(activeSectionId)) return null;
              if (["title", "slug", "isPublic", "template"].includes(activeSectionId)) return null;
              const value = getSectionValue(activeSectionId);
              if (value === undefined) return null;
              return (
                <SortableDraggableSection
                  id={activeSectionId}
                  title={activeSectionId.charAt(0).toUpperCase() + activeSectionId.slice(1)}
                  isOverlay
                >
                  {renderFormField(activeSectionId, value)}
                </SortableDraggableSection>
              );
            }
            // Custom section
            const customId = activeSectionId.replace('custom:', '');
            const customSection = resumeData.customSections?.find(s => s.id === customId);
            if (!customSection) return null;
            return (
              <SortableDraggableSection
                id={activeSectionId}
                title={customSection.name}
                isOverlay
              >
                {renderFormField(customSection.name.toLowerCase().replace(/\s+/g, ''), customSection.value)}
              </SortableDraggableSection>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Update the Monaco editor onMount handler
  const handleEditorMount = (editor: MonacoEditorType.IStandaloneCodeEditor) => {
    // Add Ctrl+S handler
    editor.addCommand(
      // Use numbers instead of KeyMod/KeyCode since we can't import monaco directly
      2048 | 49, // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
      () => {
        try {
          const value = editor.getValue();
          const parsed = JSON.parse(value);
          // Only update if the parsed data is actually different
          if (resumeData) {
            const currentString = JSON.stringify(resumeData, null, 2);
            if (value !== currentString) {
              // Patch: restore ids from original data
              const safeParsed = restoreIdsFromOriginal(resumeData, parsed);
              setResumeData(safeParsed);
              markAsUnsaved(resumeId);
              toast.success("JSON is valid and applied");
            }
          } else {
            toast.error("Cannot update: original resume data is missing.");
          }
        } catch {
          toast.error("Invalid JSON format");
        }
      }
    );
  };

  // On resume load, sync isPublic and visibility
  useEffect(() => {
    if (resumeId && userId) {
      (async () => {
        try {
          // Always use 'ownerview' for the logged-in user
          let data = await getResumeById(resumeId, userId, 'ownerview');
          data = syncPublicFields(data);
          setResumeData(data);
        } catch {
          setResumeData({} as ResumeData);
          toast.error('Failed to load resume');
        }
      })();
    }
  }, [resumeId, userId, setResumeData]);

  // Add this function to get default layout for the current template
  const handleResetLayout = () => {
    if (!resumeData) return;
    // You need to implement getTemplateDefaultLayout to return the default layout for a template
    const defaultLayout = getTemplateDefaultLayout(resumeData.template) as Layout;
    setResumeData({
      ...resumeData,
      layout: defaultLayout
    });
    markAsUnsaved(resumeId);
    toast.success('Layout reset to template default!');
  };

  // Move allowedKeys to top-level scope so it is accessible everywhere
  const allowedKeys = [
    'personalInfo', 'summary', 'experience', 'education', 'projects', 'skills',
    'title', 'slug', 'isPublic', 'template', 'tags', 'layout'
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!resumeData) {
    return <div>No resume data found</div>
  }

  if (!userId) {
    return <div>Loading user...</div>;
  }

  return (
    <AuthProvider>
      <AppNavbar />
      <div className="min-h-screen bg-background">
        <EditorHeader
          title={resumeData.title}
          isPublic={resumeData.isPublic}
          onTitleChange={(title) => {
            updateResumeData({ title });
            markAsUnsaved(resumeId);
          }}
          onPublicChange={isPublic => {
            updateResumeData({
              isPublic,
              visibility: isPublic ? "public" : "private"
            });
            markAsUnsaved(resumeId);
          }}
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
                              size="default"
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                                size="default"
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
                              size="default"
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
                    value={jsonEditorValue}
                    onChange={(value: string | undefined) => {
                      if (value) {
                        setJsonEditorValue(value);
                        debouncedUpdateResume(value);
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
                      markAsUnsaved(resumeId);
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
                            onChange={(e) => {
                              updateResumeData({
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
                              });
                              markAsUnsaved(resumeId);
                            }}
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
                            onChange={(e) => {
                              updateResumeData({
                                layout: {
                                  ...resumeData.layout,
                                  spacing: {
                                    ...(resumeData.layout?.spacing ?? {}),
                                    lineHeight: Number(e.target.value)
                                  }
                                }
                              });
                              markAsUnsaved(resumeId);
                            }}
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
                            onChange={(e) => {
                              updateResumeData({
                                layout: {
                                  ...resumeData.layout,
                                  scale: Number(e.target.value)
                                }
                              });
                              markAsUnsaved(resumeId);
                            }}
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
            markAsUnsaved(resumeId);
            setIsTemplateModalOpen(false);
          }}
        />

        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} resumeData={resumeData} />

        {/* Replace the inline AI panel with the AIPanel component */}
        <AIPanel onApplyEnhanced={handleApplyEnhancedResume} />
      </div>
    </AuthProvider>
  )
} 




// fuk it Manas single handedly understood whole 2000(almostt) lines of code 🫡🫡🙌🙌