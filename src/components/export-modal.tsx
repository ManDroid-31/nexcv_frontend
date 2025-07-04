// this is main dashboard for creating viewing and all stuff

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Share2, Code, Copy, ExternalLink, CheckCircle, FileText, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { generateResumePDF } from '@/lib/pdf-generator'
import { ResumeData } from '@/types/resume'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
}

export function ExportModal({ isOpen, onClose, resumeData }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl] = useState(`https://nexcv.vercel.app/resumes/${resumeData.id}?view=publicview`)
  const [publicApiUrl] = useState(`https://nexcv.vercel.app/resumes/${resumeData.id}?view=publicview`)

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate filename
      const fileName = `${resumeData.personalInfo?.name || resumeData.title || 'resume'}-${new Date().toISOString().split('T')[0]}.pdf`
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .toLowerCase()

      // Generate and download PDF
      generateResumePDF(resumeData, fileName)
      
      toast.success('PDF downloaded successfully! This is a standard PDF file and safe to open.')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadJSON = () => {
    try {
      const jsonData = JSON.stringify(resumeData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const fileName = `${resumeData.personalInfo?.name || resumeData.title || 'resume'}-${new Date().toISOString().split('T')[0]}.json`
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .toLowerCase()
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`
      link.type = 'application/json'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      toast.success('JSON downloaded successfully! This is a standard .json file and safe to use.')
    } catch (error) {
      console.error('Error downloading JSON:', error)
      toast.error('Failed to download JSON file.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Link copied to clipboard!')
  }

  const copyJSON = () => {
    const json = JSON.stringify(resumeData, null, 2)
    navigator.clipboard.writeText(json)
    toast.success('Resume data copied to clipboard!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export & Share</DialogTitle>
          <DialogDescription>Download your resume or share it with others</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="download" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">
              <Download className="w-4 h-4 mr-2" />
              Download
            </TabsTrigger>
            <TabsTrigger value="share">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </TabsTrigger>
            <TabsTrigger value="export">
              <Code className="w-4 h-4 mr-2" />
              Export Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Download as PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Download your resume as a high-quality PDF file, perfect for job applications.
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    This is a standard PDF file. It is safe to open and share.
                  </p>
                  <Button 
                    onClick={handleDownloadPDF} 
                    disabled={isExporting} 
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Download as JSON
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Download your resume data as JSON for backup or importing into other tools.
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    This is a standard .json file. It is safe to use and import.
                  </p>
                  <Button 
                    onClick={handleDownloadJSON} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Resume Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-lg">{resumeData.personalInfo?.name || resumeData.title}</div>
                    {resumeData.personalInfo?.email && <div>📧 {resumeData.personalInfo.email}</div>}
                    {resumeData.personalInfo?.phone && <div>📞 {resumeData.personalInfo.phone}</div>}
                    {resumeData.personalInfo?.location && <div>📍 {resumeData.personalInfo.location}</div>}
                    {resumeData.summary && (
                      <div className="mt-3">
                        <div className="font-medium">Summary:</div>
                        <div className="text-gray-600 dark:text-gray-400">{resumeData.summary.substring(0, 150)}...</div>
                      </div>
                    )}
                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div className="mt-3">
                        <div className="font-medium">Experience: {resumeData.experience.length} position(s)</div>
                      </div>
                    )}
                    {resumeData.skills && resumeData.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="font-medium">Skills: {resumeData.skills.length} skill(s)</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Public Resume Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Share your resume with a public URL. Anyone with this link can view your resume.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="share-url">Public URL</Label>
                  <div className="flex space-x-2">
                    <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                    <Button variant="outline" onClick={() => copyToClipboard(shareUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public-api-url">Export/Preview Public Resume (PDF/JSON)</Label>
                  <div className="flex space-x-2">
                    <Input id="public-api-url" value={publicApiUrl} readOnly className="flex-1" />
                    <Button variant="outline" onClick={() => copyToClipboard(publicApiUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" onClick={() => window.open(shareUrl, "_blank")}> 
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button className="flex-1" onClick={() => copyToClipboard(shareUrl)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>

                {resumeData.isPublic && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Your resume is publicly accessible
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Resume Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Export your resume data as JSON for backup or importing into other tools.
                </p>

                <Button onClick={copyJSON} className="w-full" variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  Copy JSON Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 