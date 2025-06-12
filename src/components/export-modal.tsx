"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Share2, Code, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  resumeData: any
}

export function ExportModal({ isOpen, onClose, resumeData }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl] = useState(`https://nexcv.app/resume/${resumeData.slug}`)
  const { toast } = useToast()

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    // Simulate PDF generation
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully.",
      })
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    })
  }

  const copyJSON = () => {
    const json = JSON.stringify(resumeData, null, 2)
    navigator.clipboard.writeText(json)
    toast({
      title: "JSON Copied",
      description: "Resume data has been copied to your clipboard.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download as PDF</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Download your resume as a high-quality PDF file, perfect for job applications.
                </p>
                <Button onClick={handleDownloadPDF} disabled={isExporting} className="w-full">
                  {isExporting ? (
                    <>Generating PDF...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Public Resume Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
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
                <p className="text-gray-600">
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