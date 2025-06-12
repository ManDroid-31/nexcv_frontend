"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AuthProvider, UserButton } from "@/components/mock-auth"
import {
  FileText,
  Save,
  Download,
  Share2,
  Eye,
  Code,
  FormInput,
  Sparkles,
  Plus,
  Trash2,
  Palette,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { ResumePreview } from "@/components/resume-preview"
import { AISidebar } from "@/components/ai-sidebar"
import { TemplateSelector } from "@/components/template-selector"
import { ExportModal } from "@/components/export-modal"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export default function ResumeEditor() {
  const [editMode, setEditMode] = useState<"form" | "json">("form")
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [resumeData, setResumeData] = useState({
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
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  })

  const totalPages = 5 // Total number of sections: Personal Info, Summary, Experience, Education, Skills

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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
                  value={resumeData.title}
                  onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                  className="text-lg font-semibold border-0 bg-transparent px-0 focus-visible:ring-0"
                />
                <Badge variant={resumeData.isPublic ? "default" : "secondary"}>
                  {resumeData.isPublic ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(true)}>
                <Palette className="w-4 h-4 mr-2" />
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsAISidebarOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" onClick={() => setIsExportModalOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Panel - Form/JSON Editor */}
          <div className="w-1/2 border-r bg-white overflow-y-auto">
            <div className="p-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resume Editor</h2>
                <Tabs value={editMode} onValueChange={(value) => setEditMode(value as "form" | "json")}>
                  <TabsList>
                    <TabsTrigger value="form">
                      <FormInput className="w-4 h-4 mr-2" />
                      Form Mode
                    </TabsTrigger>
                    <TabsTrigger value="json">
                      <Code className="w-4 h-4 mr-2" />
                      JSON Mode
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {editMode === "form" ? (
                <div className="space-y-6">
                  {/* Pagination */}
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          isActive={currentPage > 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          isActive={currentPage < totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  {/* Resume Settings */}
                  {currentPage === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Resume Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="slug">URL Slug</Label>
                          <Input
                            id="slug"
                            value={resumeData.slug}
                            onChange={(e) => setResumeData({ ...resumeData, slug: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={resumeData.isPublic}
                            onCheckedChange={(checked) => setResumeData({ ...resumeData, isPublic: checked })}
                          />
                          <Label>Make resume public</Label>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Personal Information */}
                  {currentPage === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={resumeData.personalInfo.name}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  personalInfo: { ...resumeData.personalInfo, name: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={resumeData.personalInfo.email}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={resumeData.personalInfo.phone}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={resumeData.personalInfo.location}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Summary */}
                  {currentPage === 3 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Professional Summary
                          <Button variant="outline" size="sm">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance with AI
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={resumeData.summary}
                          onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                          rows={4}
                          placeholder="Write a compelling professional summary..."
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Experience */}
                  {currentPage === 4 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Work Experience
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                          <div key={exp.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Experience {index + 1}</h4>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => {
                                    const updatedExperience = [...resumeData.experience];
                                    updatedExperience[index].company = e.target.value;
                                    setResumeData({ ...resumeData, experience: updatedExperience });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Position</Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => {
                                    const updatedExperience = [...resumeData.experience];
                                    updatedExperience[index].position = e.target.value;
                                    setResumeData({ ...resumeData, experience: updatedExperience });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => {
                                    const updatedExperience = [...resumeData.experience];
                                    updatedExperience[index].startDate = e.target.value;
                                    setResumeData({ ...resumeData, experience: updatedExperience });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => {
                                    const updatedExperience = [...resumeData.experience];
                                    updatedExperience[index].endDate = e.target.value;
                                    setResumeData({ ...resumeData, experience: updatedExperience });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => {
                                  const updatedExperience = [...resumeData.experience];
                                  updatedExperience[index].description = e.target.value;
                                  setResumeData({ ...resumeData, experience: updatedExperience });
                                }}
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Education */}
                  {currentPage === 5 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Education
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <div key={edu.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Education {index + 1}</h4>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>School</Label>
                                <Input
                                  value={edu.school}
                                  onChange={(e) => {
                                    const updatedEducation = [...resumeData.education];
                                    updatedEducation[index].school = e.target.value;
                                    setResumeData({ ...resumeData, education: updatedEducation });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Degree</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const updatedEducation = [...resumeData.education];
                                    updatedEducation[index].degree = e.target.value;
                                    setResumeData({ ...resumeData, education: updatedEducation });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  type="month"
                                  value={edu.startDate}
                                  onChange={(e) => {
                                    const updatedEducation = [...resumeData.education];
                                    updatedEducation[index].startDate = e.target.value;
                                    setResumeData({ ...resumeData, education: updatedEducation });
                                  }}
                                />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={edu.endDate}
                                  onChange={(e) => {
                                    const updatedEducation = [...resumeData.education];
                                    updatedEducation[index].endDate = e.target.value;
                                    setResumeData({ ...resumeData, education: updatedEducation });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Skills */}
                  {currentPage === 6 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {resumeData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <Button variant="ghost" size="sm" className="h-auto p-0 ml-1">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Input placeholder="Add a skill and press Enter" />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="json-editor">Resume JSON</Label>
                  <Textarea
                    id="json-editor"
                    value={JSON.stringify(resumeData, null, 2)}
                    onChange={(e) => {
                      try {
                        setResumeData(JSON.parse(e.target.value))
                      } catch {
                        // Handle JSON parse error silently
                      }
                    }}
                    className="font-mono text-sm"
                    rows={30}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 bg-gray-100">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Preview</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ResumePreview data={resumeData} template={resumeData.template} />
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <AISidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          resumeData={resumeData}
          onUpdateResume={setResumeData}
        />

        {/* Template Selector Modal */}
        <TemplateSelector
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplate={resumeData.template}
          onSelectTemplate={(template) => {
            setResumeData({ ...resumeData, template })
            setIsTemplateModalOpen(false)
          }}
        />

        {/* Export Modal */}
        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} resumeData={resumeData} />
      </div>
    </AuthProvider>
  )
} 