import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, ExternalLink, MoreHorizontal, Download, Eye, Edit3, Linkedin } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AuthProvider, UserButton } from "@/components/mock-auth"

// Mock data - in real app this would come from your database
const resumes = [
  {
    id: "1",
    title: "Software Engineer Resume",
    template: "Modern",
    status: "Published",
    lastModified: "2 hours ago",
    views: 24,
  },
  {
    id: "2",
    title: "Product Manager CV",
    template: "Executive",
    status: "Draft",
    lastModified: "1 day ago",
    views: 0,
  },
  {
    id: "3",
    title: "Frontend Developer",
    template: "Creative",
    status: "Published",
    lastModified: "3 days ago",
    views: 12,
  },
]

export default function Dashboard() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NexCV</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Rest of the component remains the same */}
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600">Manage your resumes and create new ones.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link href="/editor/new">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-gray-300 hover:border-blue-500">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Create New Resume</h3>
                    <p className="text-gray-600">Start with our default template</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Linkedin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Import from LinkedIn</h3>
                  <p className="text-gray-600">AI-powered profile import</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumes Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Your Resumes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{resume.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{resume.template} Template</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Share Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={resume.status === "Published" ? "default" : "secondary"}>{resume.status}</Badge>
                      <span className="text-sm text-gray-600">{resume.views} views</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Modified {resume.lastModified}</p>
                    <Link href={`/editor/${resume.id}`}>
                      <Button className="w-full">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Resume
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
